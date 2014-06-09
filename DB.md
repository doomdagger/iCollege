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
**educations**   ||education实体的集合
**friends**      ||friendItem实体的集合
**groups**       ||groupItem实体的集合


### message 即时通信消息

field name  | field type | 备注
------------|------------|------
_id         ||
type        ||message from system or group or a single user
content     ||消息内容
timestamp   ||消息发送时间戳
from        ||只可以是用户或者系统
to          ||可是是用户，消息群组
**addon**       ||addon对象

### group 消息群组
field name  | field type | 备注
------------|------------|------
_id         ||
name        ||群组名称，系统建立组群组名不可更改
members     ||user的_id字段集合
type        ||群组类型，用户自建组或系统建立组
description ||群组介绍，可修改
**addons**      ||addon对象集合

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
appId       ||


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
