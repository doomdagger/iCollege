iCollege
========
[![Tests](https://img.shields.io/travis/doomdagger/iCollege/master.svg?label=linux)](http://travis-ci.org/doomdagger/iCollege)
[![Dependencies](http://img.shields.io/david/doomdagger/iCollege.svg?style=flat)](https://david-dm.org/doomdagger/iCollege)

### What is iCollege

iCollege是一款即时通信软件，主打功能为即时通信，它类似于QQ，但跟QQ相比，更注重地域性用户间关系，因此，iCollege有一系列准则为每一位注册用户定位Ta的潜在性好友，并为每一位用户发现Ta可能感兴趣的地域性圈子和群组。
总结起来就是，我们帮助用户发现Ta想发现的人群。正如上述所说，iCollege拥有群组和圈子两种捆绑用户间关系的工具，他们的职责不尽相同：群组主打多人聊天，圈子主打兴趣发帖。但是单纯的群组和圈子功能可能有些单调，所以
我们额外研发了App插件功能，为第三方开发者提供开发工具包，使他们能够开发自己的App插件，并提供给用户使用，用户可选择性安装App插件，安装后的插件可以无缝集成进iCollege平台之中，为用户提供更多与众不同的使用体验。

#### How it works

iCollege服务平台由即时通信主服务器端，ios&Android&windows等移动客户端，基于sencha touch的网页客户端这三部分组成。即时通信主服务器端采用非阻塞I/O技术Node.js编写，利用基于Websocket技术的优秀即时通信框架socket.io，
以及Beanstalkd高并发队列等技术开发性能优秀的即时通信服务功能。此外，系统的App插件功能也是一大亮点。iCollege的App插件设计的非常灵活，可以让iCollege真正成为类似微信的公众服务平台，然而跟微信不同，iCollege更加注重
用户与用户之间的关联性。

微信平台仅仅允许开发者开发服务平台或订阅平台，局限性非常大，iCollege的App插件应该拥有更多的功能，列举出系统应该自带的若干个App插件:
* **教务系统集成app插件：**查看课表，查看考试安排（考试安排提醒与推送），查看成绩（考试成绩提醒与推送），查找空教室，计算平均学分绩
* **以大学生课程为基础的社交网络：**同教室上课的聊天群组选择性加入，选择性加入同课圈子（圈子类似贴吧，吐槽加文件共享）
* **以兴趣爱好为基础的社交网络：** 同爱好群组选择性加入，同爱好圈子选择性加入。
* **同城社交网络：** 同一个城市，都是出门在外闯，见到老乡，见到校友，两眼泪汪汪。
* **饭团：** 订餐服务平台，不多说了。
* **掌上餐厅** 点菜服务平台，手机点菜，不多说了。
* **校园电商：**校园电商平台，二手书，宿舍超市，不多说了。


App的公用性可以多种多样，但是都将建立在iCollege社交平台上，所有的App插件可以在用户授权条件下使用iCollege父平台的部分内置功能，比如饭团上买了什么后可以在iCollege圈子上发一个post，分享美食来赚取饭团积分。


### Code status

* [![Code Climate](https://codeclimate.com/repos/53eb9190e30ba04f350777c8/badges/9816f1c8e15376c51ecb/gpa.svg)](https://codeclimate.com/repos/53eb9190e30ba04f350777c8/feed)

### Getting Started Guide for Developers

If you're a app or core developer, or someone comfortable getting up and running from a `git clone`, this method is for you.

If you clone the GitLab repository, you will need to build a number of assets using grunt.

Please do **NOT** use the master branch of iCollege in production. 

#### Prerequisite

1. **JRE 7** or greater be installed. (WebStorm need it.)

#### Quickstart:

1. `npm install -g grunt-cli`
1. `npm install`
1. `npm start`

#### Hint for Developers:

**Use `grunt dev` while you develop iCollege**, express will restart for modifications of server side code

### Apps

Apps Getting Started for iCollege Devs. Learn more from [Ghost App Architecture](https://github.com/TryGhost/Ghost/wiki/Apps-Getting-Started-for-Ghost-Devs).

### API & Sencha Touch

iCollege has only one routing policy:
* `/icollege/api` - the restful API of iCollege

### Other Grunt Tasks

```bash
# 获取帮助信息
grunt help

# 生成iCollege项目文档
grunt docs

# 验证代码错误，验证代码风格，并执行代码测试：模块测试、单元测试、集成测试
grunt validate

# 验证代码错误，验证代码风格
grunt lint

# 仅执行单元测试
grunt test-unit

# 仅执行集成测试
grunt test-integration

# 仅执行模块测试
grunt test-module

# 执行功用性测试
grunt test-routes

# 生成代码测试覆盖率报告，生成的为html文件，位于项目根目录下
grunt test-coverage

# 启动开发监听模式
grunt dev

```

### Who are we ?

* CodeHolic Team.