var cdp = require('cdp').create();
var casper = cdp.casper;
var xPath = require('casper').selectXPath;

casper.options.pageSettings["loadImages"] = false;
casper.options.pageSettings["loadPlugins"] = false;
// Change this to 'debug' for debugging log
casper.options["logLevel"] = "debug";
casper.options["verbose"] = true;
casper.options.waitTimeout = 1000 * 60;

// debug with slimerjs
casper.options.viewportSize = {width: 1300, height: 900};

// THIS IS THE SCRIPT
var login_url = "http://ecoanalitica.com/wp-login.php";
var articles_url = "http://ecoanalitica.com/informes/perspectivas";

casper.start(login_url);

casper.waitForSelector('#user_login').thenEvaluate(function() {
    document.getElementById('user_login').value = 'user';
    document.getElementById('user_pass').value = 'pass';
});
casper.thenClick('#wp-submit');
casper.thenOpen(articles_url);

// This is not actually a good way, because res of the standart JS closures :)
casper.then(function() {
    casper.waitForSelector('#content').then(function() {
        var table = casper.evaluate(function() {
            return document.getElementById('content').innerHTML;
        });
		
        casper.then(function () {
            var regEx = /<a\s*href=.([^"]+).>(Up\s*To\s*Day\s*Report[^<]+)<\/a>/ig;
            var res;

            while(( res = regEx.exec(table) ) !== null ) {

                var fileName = res[2],
                    link = res[1];

                if(cdp.index.hasOwnProperty(fileName)) {
                    this.log(pdf_texts[i] + " is already downloaded!", "warning");
                }else {
					casper.then(cdp.setDownload(fileName + '.pdf'));
					casper.thenOpen(link);
					cdp.index[fileName] = "Downloaded at: " + new Date().toLocaleString();
                }
            }

        });
    });
});

cdp.run();