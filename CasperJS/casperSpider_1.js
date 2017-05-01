var casper = require('casper').create({
	clientScripts : [], 
	verbose : true,
	logLevel : "debug",
});

var cdp = require('cdp').create(casper);  

casper.options.viewportSize = { width: 1300, height: 900 };
var x = require('casper').selectXPath;

var val = [];
// THIS IS THE SCRIPT
casper.start();

casper.open("http://tcpoweb.pini.com.br/MenuIndiceCusto.aspx");

casper.then(function() {
	this.click(x("//*[@id='ctl00_MainContent_gvTitulosIndices_ctl02_gvIndices_ctl02_LnkIndice']"));      
});   

// Wait for tag with id="ctl00_MainContent_lblCorePaginaIndice"
casper.waitForSelector('#ctl00_MainContent_lblCorePaginaIndice', function() {
	// Save picture - debug purpose
	casper.then(function() {
		casper.capture('After_click.png');      
	});
	
	val.push(this.getElementsAttribute(x('//*[@id="ctl00_MainContent_cboLocal"]/option'), 'value'));
	val.length;

	casper.then(function() {
		casper.eachThen(val, function(item) {

			var opt = item.data;
			console.log(item.data);
			
			casper.then(function() {
				this.evaluate(function() {
					console.log(opt);
					$('#ctl00_MainContent_cboLocal').val(opt).change();
					casper.capture(opt + '.png');
				});
				casper.then(function() {
					casper.wait(5000);
				});
		   
				casper.then(cdp.setDownload(opt + '.html'));
				casper.then(cdp.saveContent(opt + '.html'));
			});
		});
	});

});       

cdp.run();

