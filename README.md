iCollege
========

More Wiki on the way...

### Code status

* ![build status](http://42.96.195.83:8111/httpAuth/app/rest/builds/buildType:\(id:ICollege_Build\)/statusIcon)

### Getting Started Guide for Developers

If you're a app or core developer, or someone comfortable getting up and running from a `git clone`, this method is for you.

If you clone the GitLab repository, you will need to build a number of assets using grunt.

Please do **NOT** use the master branch of iCollege in production. 

#### Prerequisite

1. **JRE 7** or greater be installed. 
1. **Ruby** 2.0 be installed. [How to install it?](http://rubyinstaller.org/downloads/)
1. **Sencha Cmd** be installed, and included into your System Path. [How to install it?](http://www.sencha.com/products/sencha-cmd/download)
1. **PhantomJS** 1.8.2 or greater. Installation instructions can be found [here](http://phantomjs.org/download.html)
1. **Python** 2.6 or greater(Recommend 2.7.* over 3.*), and included into your System Path. [How to install it?](https://www.python.org/download/releases/2.7.7/)

#### Quickstart:

1. `npm install -g grunt-cli`
1. `npm install -g casperjs`
1. `npm install`
1. `grunt init` (download frontend assets, sencha touch framework and put them in the right place)
1. `npm start`

#### Hint for Developers:

**Use `grunt dev` while you develop iCollege**, express will restart for modifications of server side code

### Apps

Apps Getting Started for iCollege Devs. Learn more from [Ghost App Architecture](https://github.com/TryGhost/Ghost/wiki/Apps-Getting-Started-for-Ghost-Devs).

### API & Sencha Touch

iCollege has two parts of routing policies:
1. `/app` - the sencha touch app of iCollege
2. `/api` - the restful API of iCollege

### Who are we ?

* CodeHolic Team.