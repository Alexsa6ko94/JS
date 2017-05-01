// cdp is a wrapper with a few added functionalities
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
var articles_url = "http://www.autodata.com.br/noticias";

casper.start(articles_url);

// LOGIN:

// casper.thenOpen(articles_url);

var urls = [];
// Take all urls from: "http://www.autodata.com.br/noticias"
casper.then(function() {
    casper.waitForSelector('.container').then(function() {
        // Take html
        var body = casper.evaluate(function() {
            return document.getElementsByClassName('well section')[0].innerHTML;
        });
        // Take the urls
        casper.then(function () {
            var regEx = /<a\s[^>]*href=.(noticias\/\d+\/[^"]+).>([^<]+)<\/a>/ig,
                res,
                base = "http://www.autodata.com.br/";

            while( ( res = regEx.exec(body) ) !== null ) {
                var link = res[1];
                urls.push(base+link);
            }
        });
    });
});


// <input name='i_username' type="email" class="form-control" 
// placeholder="E-Mail" required autofocus autocomplete="off">


// Itterate over all urls and download them if they not require login
// Login actually not really needed. Those ones which need to
// will be accessible at the next calendar day.

casper.then(function() {
    casper.eachThen(urls, function(response) {
        this.thenOpen(response.data, function(response) {
            casper.waitForSelector(".content", function() {
                console.log("LINK: " + response.url);
                var indexCheck = response.url.replace(/\D/g, '');
                // Check if it already downloaded
                if(cdp.index.hasOwnProperty(indexCheck)) {
                    this.log(response.url + " is already downloaded!", "warning");
                }
                else {
                    if (this.exists('#f_login')) {
                        console.log(response.url + " - Required login. It will be downloaded at the next day");

                        this.fill('form#f_login', {
                            i_username: 'user', 
                            i_password: 'pass'
                        }, true);

                        casper.then(function() {
                            casper.waitForSelector(".content", function() {
                                casper.then(cdp.saveContent(indexCheck + '.html'));
                                cdp.index[indexCheck] = "Downloaded at: " + new Date().toLocaleString();
                            });
                        });
                    }
                    else {
                        casper.then(cdp.saveContent(indexCheck + '.html'));
                        cdp.index[indexCheck] = "Downloaded at: " + new Date().toLocaleString();
                    }
                }
            });
        });
    });
})

cdp.run();