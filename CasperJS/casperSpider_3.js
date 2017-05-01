var casper = require('casper').create({
    clientScripts : [], 
    verbose : true,
    logLevel : "debug",
   
    onWaitTimeout: function() {
        console.log("THE WAIT JUST TIMED OUT");
    },
    onStepTimeout: function() {
        console.log("THE STEP JUST TIMED OUT");
    }
});

//cdp.debugOn();

var cdp = require('cdp').create(casper);
var fs = require('fs'); // used for file reading/writing
var x = require('casper').selectXPath; // used for all xpath selectors
var utils = require('utils');

// For test with slimerjs
// casper.options.viewportSize = {width: 1300, height: 900};

//casper.options.pageSettings["userAgent"] = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0';
casper.options.waitTimeout = 1000 * 60;

// Set the start URL
var startUrl = "https://www.bolsar.com/Vistas/Noticias/Reportes.aspx";

//Start spidering
casper.start(startUrl, function() {
  spider(startUrl);
});

// Start the run
cdp.run();

// ################## FUNCTIONS ##################

// Spider from the given URL
function spider(url) {
	// Open the URL
	casper.open(url);
    
    casper.then(function() {
        casper.waitForSelector(x(".//*[@id='lnkVolver']"), function() {
            this.click(x(".//*[@id='lnkVolver']"));
        });
    });
	
    casper.then(function() {
        casper.waitForSelector(x(".//*[@class='ctl00_menuPrincipal_1 textoMenuTop ctl00_menuPrincipal_4']"), function() { 
			this.click(x("//a[contains(@href,'Reportes.aspx')]"));
        });    
    });

    casper.then(function() {
        casper.waitForSelector(x(".//*[@class='textoTituloTabla']"), function() {
            var table = casper.evaluate(function() {
                return document.getElementById("ctl00_ctl00_ContentPlaceHolder1_GrillaListado_dataGridListado").innerHTML;
            });
			
            casper.then(function () {
                var regEx = /Reporte\s*Mensual<\/td>\s*<td[^>]*>([^<]*)[\S\s]*?\/(Downloads\.aspx[^"']+)/ig;

                var res;

                while(( res = regEx.exec(table) ) !== null ) {

	                var fileName = res[1],
					link = res[2],
					base = 'https://www.bolsar.com/';

					casper.then(cdp.setDownload(fileName + '.pdf'));
					casper.thenOpen(base + link);
                }
            });
        });
    });
}
