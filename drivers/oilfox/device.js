'use strict';

const Homey = require('homey');
const https = require('https');

class OilFoxDevice extends Homey.Device {
	
	onInit() {
		this.log('MyDevice has been inited');
		this.settings = this.getSettings();
		this.data = this.getData();
		this.connectOilfox()
		
		
	}
	
	 connectOilfox() {
	var me = this;
	let post_data = JSON.stringify({
		'email': this.settings.username,
		'password': this.settings.password
	});

	let request_options = {
		host: 'api.oilfox.io',
		port: '443',
		path: '/v2/backoffice/session',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Connection': 'Keep-Alive',
			'User-Agent': 'okhttp/3.2.0',
			'Content-Length': post_data.length,
			'Accept': '*/*'
		}
	};

	let tokenRequest = https.request(request_options, (tokenRequestResult) => {
		tokenRequestResult.setEncoding('utf8');
		let tokenData = "";
		tokenRequestResult.on('data', (chunk) => { console.log("recieved chunk: " + chunk); tokenData += chunk; });
		tokenRequestResult.on('end', () => {
			let tokenObject;
			    try {
        		   tokenObject = JSON.parse(tokenData);
  			  } catch (e) {
       			 console.log("Problem with tokenData:" +tokenData);
    			}
			if(tokenObject && tokenObject.token)
			{
			request_options.headers['X-Auth-Token'] = tokenObject.token;
			request_options.path = '/v2/user/summary';
			request_options.method = 'GET';
			let summaryRequest = https.request(request_options, (summaryRequestResult) => {
				summaryRequestResult.setEncoding('utf8');
				let summaryData = "";
				summaryRequestResult.on('data', (chunk) => { summaryData += chunk; });
				summaryRequestResult.on('end', () => {
					let summaryObject = JSON.parse(summaryData);
					var i;
					var rechecktime;
				for (i in summaryObject['devices'])
				{
			     if(this.data.id === summaryObject['devices'][i]['id'])
				this.setCapabilityValue('fillLevel', summaryObject['devices'][i]['metering']['fillingPercentage']);
				this.setCapabilityValue('fillVolume', summaryObject['devices'][i]['metering']['liters']);
				this.setCapabilityValue('fillHeight', summaryObject['devices'][i]['metering']['currentOilHeight']);
				this.setCapabilityValue('measure_battery', summaryObject['devices'][i]['metering']['battery']);
				rechecktime = summaryObject['devices'][i]['metering']['serverDate']+summaryObject['devices'][i]['measurementIntervalInSeconds']*1000-(new Date).getTime()+60;
				}
				if(rechecktime && rechecktime <= 3600000) rechecktime = 86400000;
				if(rechecktime && rechecktime <= 0 && rechecktime >= -3600000) rechecktime = 3600000;
				if(!rechecktime || rechecktime <= -3600000)
				{
				this.setWarning(Homey.__("nodata"));
				rechecktime = 86400000;
				}
				else
				{
				this.unsetWarning()	
				}
			

			
			 setTimeout(function () {
                me.connectOilfox()
              }, rechecktime);
			

			
				});
			});
			summaryRequest.end();
			}
		});
	});

	tokenRequest.write(post_data);
	tokenRequest.end();
}	
	
	
}

module.exports = OilFoxDevice;