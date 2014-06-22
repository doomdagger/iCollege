var casper = require('casper').create();

casper.start('http://baidu.com/', function() {
    this.echo(this.getTitle());
});

casper.thenOpen('http://git.candylee.cn/', function() {
    this.echo(this.getTitle());
});

casper.run();