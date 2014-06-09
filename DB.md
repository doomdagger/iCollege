iCollege Database Design
========


### user 用户

field name  | field type | 备注
------------|------------|------
_id         ||
username    ||用户名
nickname    ||昵称
email       ||邮箱
cellphone   ||手机号码
password    ||密码
name        ||真实姓名
age         ||年龄
sex         ||性别
location    ||当前登录地点
online      ||是否在线
[educations](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#education "")   ||education实体的集合，学历信息
[friends](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#frienditem "")      ||friendItem实体的集合，好友
[groups](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#groupitem "")            ||groupItem实体的集合，群组
[apps](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#appitem-app "")            ||appItem实体的集合，安装的app插件
### message 即时通信消息

field name  | field type | 备注
------------|------------|------
_id         ||
type        ||message from system or group or a friend/anonymous user
content     ||消息内容
timestamp   ||消息发送时间戳
from        ||只可以是用户或者系统
to          ||可以是用户，消息群组
[addon](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#addon "")                  ||addon对象，消息附件

### post 短帖
field name  | field type | 备注
------------|------------|------
_id         ||
type        ||post from system or circle or a friend
content     ||消息内容
timestamp   ||消息发送时间戳
from        ||只可以是用户或者系统
to          ||可是是社交圈子（发到社交圈子中去），用户（给某个用户的post的回复），或为空（发的个人post）
[addons](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#addon "")                  ||addon对象集合，post附件，多为多个图片

### group 消息群组
field name  | field type | 备注
------------|------------|------
_id         ||
name        ||群组名称，系统建立组群组名不可更改
members     ||user的_id字段集合
type        ||群组类型，用户自建组或系统建立组
description ||群组介绍，可修改
[addons](http://git.candylee.cn/doomdagger/icollege/blob/master/DB.md#addon "")                       ||addon对象集合，群文件

### circle 社交圈子
field name  | field type | 备注
------------|------------|------
_id         ||
name        ||圈子名称，系统建立圈子名不可更改
members     ||user的_id字段集合
type        ||圈子类型，用户自建圈子或系统建立的圈子
description ||圈子介绍，可修改


### app 应用
field name  | field type | 备注
------------|------------|------
_id         ||
name        ||app名称




# 子文档

#### addon 附件

field name  | field type | 备注
------------|------------|------
name        ||文件名
size        ||文件大小
url         ||文件路径

#### friendItem 朋友项

field name  | field type | 备注
------------|------------|------
friendId    ||好友的_id
customName  ||好友备注名

#### groupItem 群组项

field name  | field type | 备注
------------|------------|------
groupId     ||群组的_id
messagePolicy||接受消息策略：完全屏蔽，仅接收不提醒，接收并提醒

#### appItem app项
field name  | field type | 备注
------------|------------|------
appId       ||app的_id



#### education 教育背景

field name  | field type | 备注
------------|------------|------
type        ||小学，初中，高中or大学
startYear   ||起始年份
endYear     ||终止年份
province    ||学校所在省份
city        ||学校所在城市
school      ||学校名称
class       ||所在班级
academy     ||学院（可选填）
faculty     ||系（可选填）


***

# App简介

iCollege的App应该设计的更加灵活些，让iCollege真正成为了类似微信的平台，然后跟微信不同，iCollege应该更加注重用户与用户之间的关联性。

微信平台仅仅允许开发者开发服务平台或订阅平台，局限性非常大，iCollege的App应该拥有更多的功能，列举出系统应该自带的若干个App插件:
* **教务系统集成app：**查看课表，查看考试安排（考试安排提醒与推送），查看成绩（考试成绩提醒与推送），查找空教室，计算平均学分绩
* **以大学生课程为基础的社交网络：**同教室上课的聊天群组选择性加入，选择性加入同课圈子（圈子类似贴吧，吐槽加文件共享）
* **以兴趣爱好为基础的社交网络：** 同爱好群组选择性加入，同爱好圈子选择性加入
* **同城社交网络：** 同一个城市，都是出门在外闯，见到老乡，见到校友，两眼泪汪汪。
* **饭团：** 订餐服务平台，不多说了。
* **掌上餐厅** 点菜服务平台，手机点菜，不多说了。
* **校园电商：**校园电商平台，二手书，宿舍超市，不多说了。


App可以做出来很多很多，但是都将建立在iCollege社交平台上，所有的App可以有权限使用iCollege父平台的一切功能，比如饭团上买了什么后可以在iCollege上发一个post，分享美食来赚取饭团积分。