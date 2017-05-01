var cdp = require('cdp').create();
var casper = cdp.casper;
var xPath = require('casper').selectXPath;
var utils = require('utils');

// Change this to 'debug' for debugging log
casper.options["logLevel"] = "debug";
casper.options["verbose"] = true;
casper.options.waitTimeout = 1000 * 60;

// debug with slimerjs
casper.options.viewportSize = {width: 1300, height: 900};

// THIS IS THE SCRIPT
var articles_url = "http://internet.cnbs.gob.hn/boletines/_layouts/15/xlviewer.aspx?id=/boletines/ARCHIVOS%20DE%20BOLETIN/ESTADOS%20FINANCIEROS%20SISTEMA%20FINANCIERO.xlsx&Source=http%3A%2F%2Finternet%2Ecnbs%2Egob%2Ehn%2Fboletines";

casper.start(articles_url).then(function() {
	casper.then(function() {
		this.evaluate(function () { jq = $.noConflict(true) } );
	});
	
	casper.waitForSelector('#m_excelWebRenderer_ewaCtl_Jewel-Default').then(function() {
    	this.click('#m_excelWebRenderer_ewaCtl_Jewel-Default');
	}).then(function () {
		var btn_selector = "//*[@id='m_excelWebRenderer_ewaCtl_Jewel.DownloadSnapshot-Menu48']";

		casper.waitForSelector(xPath(btn_selector)).then(function() {
    		console.log("The selector exist: " + btn_selector);

    		this.then(function() {
	    		if(this.exists(xPath(btn_selector))) {
	    			console.log('The Selector EXIST');
	    		}
				else {
	    			console.log('The Selector doesnt exist');
	    		}
    		})
    		
			// Example of using mouseEvent
			
    		this.then(function() {
    			casper.then(cdp.setDownload("test"));
    			casper.then(function() {
    				this.mouseEvent('click', xPath(btn_selector));
    			});
    		});
			
			// Example of using clickLabel
			
			casper.then(function() {
			    this.clickLabel('Descargar una instantánea', 'span');
			}).then(function() {
			    console.log(this.getPageContent());
			});

		});
	});
});


cdp.run();