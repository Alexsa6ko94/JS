// Owner: aboyanov

// This CasperJS script is designed to download company information from: 'http://appscvs.supercias.gob.ec/portaldeinformacion/consulta_cia_param.zul'
// It demonstrate how CasperJS can be used to: 
//		- read data from file by passing it like argv: '~ casperjs script_name.js --list_name';
//		- usage of xPath
//		- write data to file
//		- skip the step on timeout
//      - fill input and submit it

var casper = require('casper').create({}); // creating the casper object

casper.options.waitTimeout = 90000; // setting a custom timeout, because the website is unstable
var fs = require('fs');	// used for file reading/writing
var x = require('casper').selectXPath; // used for all xpath selectors

var step1_timeout = 0; // flag
var step2_timeout = 0; // flag
var timeout_wait = 3600000; // 1 hour - 3 600s - 3 600 000ms

var list = '';

if (casper.cli.has("gold")){ // checks for --gold option
	list = 'config/companies_list_gold.txt'; // sets the list
}
else if (casper.cli.has("silver")){ // checks for --silver option
	list = 'config/companies_list_silver.txt'; // sets the list
}
else if (casper.cli.has("reg")){ //  checks for --reg option
	list = 'config/companies_list_reg.txt'; // sets the list
}
else if (casper.cli.has("timeout")){ //  checks for --timeout option, use it when the file is created in [indexes] directory!!!
	list = 'indexes/index_timeout.txt'; // sets the list
}
else{ // if no option is present the script will die
	casper.die("Please enter an option for downloading. [--gold | --silver | --reg | --timeout]", 1); // error message
}

var main_link = 'http://appscvs.supercias.gob.ec/portaldeinformacion/consulta_cia_param.zul'; // main url where we fill the codes
var companies_list = fs.read(list).toString().split("\n"); // reading the list of companies for downloading
console.log(companies_list);
casper.userAgent('Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:42.0) Gecko/20100101 Firefox/42.0'); // setting user agent because we are not bots :)

casper.start().each(companies_list,function(self, company){ // everything is in the "each" function wich takes each company from the list in the "company" variable
	self.thenOpen(main_link, function() { // every cycle opens the main link and starts again

		skip_everything = 0; // skips all downloads

		step1_timeout = 0; // flag
		step2_timeout = 0; // flag

		step4_timeout = 0; // flag
		step5_timeout = 0; // flag

		step7_timeout = 0; // flag
		step8_timeout = 0; // flag

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~GET COMPANY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x('//*[@name="txtParametro"]'), function() { // waiting for the text box selector to load up
			this.sendKeys(x('//*[@name="txtParametro"]'), company); // then fill it with a company
			this.click(x('//*[@class="z-button-cm"]'),function(){}); // clicking the button	
		},function(){ // on timeout function
			console.log("Critical 1 timeout!!!"); // message to the console
			fs.write("indexes/index_timeout.txt", "\n"+company, 'a'); // fill the "timeout" index
			skip_everything = 1; // flag is up
			this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
			request.abort(); // skip the step
		});
	
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~PROFILES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x("//*[text()[contains(.,'Información General')]]"), function() { // waiting for the "Profiles" button to show up
			this.click(x("//*[text()[contains(.,'Información General')]]"),function(){}); // then we click on it
		},function(){ // on timeout function
			if (skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Critical 2 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout.txt", "\n"+company, 'a'); // fill the "timeout" index
				skip_everything = 1; // flag is up
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~PROFILES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x("//*[text()[contains(.,'Imprimir')]]"), function() { // here we wait for the "print" button, this will make sure that the profiles window is available
			var profile_table = this.getPageContent(); // getting the html data and store it
			var regex_match = profile_table.match(/Información General del la Compañía/); // check if there are profiles in the content ; i'm not sure if this works for profiles the way it works for shareholders
			if (regex_match){ // if there are
				fs.write("/proj/inbox/dataprov/ec-supercias/data/SUPCOMPGOLD/SUPERCIAS_PROF_" + company + ".html", profile_table, 'w'); // write the html file
				fs.write("indexes/index_downloaded.txt", "\n"+company, 'a'); // fill the "downloaded" index
				console.log("~~~~~~ Company PROF - "+company+" - created! ~~~~~~"); // some info for the console
			}
			else{ // if there are not
				fs.write("indexes/index_empty.txt", "\n"+company, 'a'); // fill the "empty" index
				console.log("~~~~~~ Empty PROF - "+company+" ! ~~~~~~"); // some info for the console
			}
		},function(){ // on timeout function
			if (skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Critical 3 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout.txt", "\n"+company, 'a'); // fill the "timeout" index
				skip_everything = 1; // flag is up
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~CLOSE WINDOW~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x('//*[@class="z-window-modal-icon z-window-modal-close"]'), function() { // waiting for the "close" selector to load up
			this.click(x('//*[@class="z-window-modal-icon z-window-modal-close"]'),function(){}); // clicking the "close" button
		},function(){ // on timeout function
			if (skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Step 4 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout.txt", "\n"+company, 'a'); // fill the "timeout" index
				step4_timeout = 1; // flag is up
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SHAREHOLDERS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x("//*[text()[contains(.,'Socio o Accionistas')]]"), function() { // waiting for the "Shareholders" button to show up
			this.wait(3000); // here we wait for 3 sec, because the previous step may need some time to close the window
			this.click(x("//*[text()[contains(.,'Socio o Accionistas')]]"),function(){}); // then we click on it
		},function(){ // on timeout function
			if (step4_timeout == 1 || skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Step 5 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout_optional.txt", "\n"+company, 'a'); // fill the "timeout" index
				step5_timeout = 1; // flag is up
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SHAREHOLDERS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x("//*[text()[contains(.,'Imprimir')]]"), function() { // here we wait for the "print" button, this will make sure that the shareholder window is available
			var shareholder_table = this.getPageContent(); // getting the html data and store it
			var regex_match = shareholder_table.match(/class="z-treecell-cnt z-overflow-hidden">/); // check if there are shareholders in the content
			if (regex_match){ // if there are
				var filename = 'SUPERCIAS_SH_' + company + '.html';
				fs.write("/proj/inbox/dataprov/ec-supercias/data/SUPCOMPGOLD/SUPERCIAS_SH_" + company + ".html", shareholder_table, 'w'); // write the html file
				fs.write("indexes/index_downloaded_optional.txt", "\n"+company, 'a'); // fill the "downloaded" index
				console.log("~~~~~~ Company SH   - "+company+" - created! ~~~~~~"); // some info for the console
			}
			else{ // if there are not
				fs.write("indexes/index_empty_optional.txt", "\n"+company, 'a'); // fill the "empty" index
				console.log("~~~~~~ Empty SH - "+company+" ! ~~~~~~"); // some info for the console
			}
		},function(){ // on timeout function
			if (step4_timeout == 1 || step5_timeout == 1 || skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Step 6 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout_optional.txt", "\n"+company, 'a'); // fill the "timeout" index
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~CLOSE WINDOW~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x('//*[@class="z-window-modal-icon z-window-modal-close"]'), function() { // waiting for the "close" selector to load up
			this.click(x('//*[@class="z-window-modal-icon z-window-modal-close"]'),function(){}); // clicking the button
		},function(){ // on timeout function
			if (skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Step 7 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout_optional.txt", "\n"+company, 'a'); // fill the "timeout" index
				step7_timeout = 1; // flag is up
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~EXECUTIVES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x("//*[text()[contains(.,'Administradores')]]"), function() { // waiting for the "Executives" button to show up
			this.wait(3000); // here we wait for 3 sec, because the previous step may need some time to close the window
			this.click(x("//*[text()[contains(.,'Administradores')]]"),function(){}); // then we click on it
		},function(){ // on timeout function
			if (step7_timeout == 1 || skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Step 8 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout_optional.txt", "\n"+company, 'a'); // fill the "timeout" index
				step8_timeout = 1; // flag is up
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~EXECUTIVES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

		this.waitForSelector(x("//*[text()[contains(.,'Imprimir')]]"), function() { // here we wait for the "print" button, this will make sure that the executives window is available
			var executives_table = this.getPageContent(); // getting the html data and store it
			var regex_match = executives_table.match(/Identificaci/); // check if there are executives in the content
			if (regex_match){ // if there are
				fs.write("/proj/inbox/dataprov/ec-supercias/data/SUPCOMPGOLD/SUPERCIAS_EXEC_" + company + ".html", executives_table, 'w'); // write the html file
				fs.write("indexes/index_downloaded_optional.txt", "\n"+company, 'a'); // fill the "downloaded" index
				console.log("~~~~~~ Company EXEC - "+company+" - created! ~~~~~~"); // some info for the console
			}
			else{ // if there are not
				fs.write("indexes/index_empty_optional.txt", "\n"+company, 'a'); // fill the "empty" index
				console.log("~~~~~~ Empty EXEC - "+company+" ! ~~~~~~"); // some info for the console
			}
		},function(){ // on timeout function
			if (step7_timeout == 1 || step8_timeout == 1 || skip_everything == 1){ // check if it's already down
				request.abort(); // skip the step
			}
			else {
				console.log("Step 9 timeout!!!"); // message to the console
				fs.write("indexes/index_timeout_optional.txt", "\n"+company, 'a'); // fill the "timeout" index
				this.wait(timeout_wait); // wait for the site to eventually load - 1 hour
				request.abort(); // skip the step
			}
		});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

	});
});

casper.run(); // run all of the above :)
