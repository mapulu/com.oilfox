'use strict';

const Homey = require('homey');

class Oilfox extends Homey.App {
	
	onInit() {
		this.log('Oilfox is running...');
	}
	
}

module.exports = Oilfox;