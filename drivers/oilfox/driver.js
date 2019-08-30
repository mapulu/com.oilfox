'use strict';

const Homey = require('homey');
const https = require('https');

class OilfoxDriver extends Homey.Driver {

    onPair( socket ) {
      let username = '';
      let password = '';
      
      socket.on('login', ( data, callback ) => {
       username = data.username;
	   password = data.password;
	let post_data = JSON.stringify({
		'email': username,
		'password': password
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
			console.log("Password okay");
            callback(null, true);
			}
			else
			{
		    console.log("Password wrong");
			callback(null, false);
			}
		});
	});

	tokenRequest.write(post_data);
	tokenRequest.end();
      });

	  
	  
	    socket.on('list_devices', function( data, callback ) {
let post_data = JSON.stringify({
		'email': username,
		'password': password
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
			let tokenObject = JSON.parse(tokenData);
			request_options.headers['X-Auth-Token'] = tokenObject.token;
			request_options.path = '/v2/user/summary';
			request_options.method = 'GET';
			let summaryRequest = https.request(request_options, (summaryRequestResult) => {
				summaryRequestResult.setEncoding('utf8');
				let summaryData = "";
				summaryRequestResult.on('data', (chunk) => { summaryData += chunk; });
				summaryRequestResult.on('end', () => {
					let summaryObject = JSON.parse(summaryData);
					var foundDevices = summaryObject.devices.map(result => ({
                    name: result.name,
                    data: {
                        id: result.id
                    },
                    settings: { username, password }
                }));

						
				callback( null,  foundDevices );
				//console.log(foundDevices);
						
				});
			});
			summaryRequest.end();
			}
			else
			{
			callback( null, []);
			}
		});
	});

	tokenRequest.write(post_data);
	tokenRequest.end();
	 })

		
		
    }
	
	
	
 
	
	

	
	
		
	
	
}



module.exports = OilfoxDriver;