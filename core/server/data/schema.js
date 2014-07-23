var Schema = require("mongoose").Schema;

// # Schema
// 这里定义了数据库实体的字段信息，export后供models模块使用
// Schema Type 都有哪些：
// 1. String: { type: String, enum: ['one','two','three'], lowercase: true, match: [ /\.html$/, "That file doesn't end in .html ({VALUE})" ], trim: true, uppercase: true }
// 2. Number: { type: Number, max: 10, min: 2 }
// 3. Date: { type: Date, expires: 60*60*24 }
//
// > Default SchemaTypes available for all types
// 1. index: true or false, 'hashed' '2d' '2dsphere', { type: '2dsphere', sparse: true } { unique: true, expires: '1d' }
// 2. required: true or false
// 3. select: true or false - Set to true if this path should always be included in the results
// 4. set: function - should receive a value and return a tweaked value to be set on this field
// 5. sparse: true or false - sparse index
// 6. unique: true or false - unique index
// 7. validate: function receive a value return true or false, [function, msg], [{validator:validator, msg:msg},{...}]
// 8. default: value
// 9. get: function - should receive a value and return a tweaked value to get
// ## DB Design
var db = {
    // ### users 用户实体
    users: {
        uuid: {type: String, required: true}, // uuid
        nickname: {type: String, trim: true}, // nickname
        lowercase_username: {type: String, required: true, lowercase: true, trim: true},
        username: {type: String, required: true, trim: true}, // used for sign in
        password: {type: String, required: true, trim: true},
        email: {type: String, match: /.*?@.*?/, trim: true},
        avatar: {type: String}, // be what, for file storage, not sure
        images: [{type: String}], // be what, for file storage, not sure
        credit: {type: Number, default: 0, min: 0}, // 积分，也就是经验值
        bio: {type: String, trim: true, default: 'I love iCollege'},
        signature: {type: String, trim: true, default: 'I love iCollege'},
        gender: {type: String, enum: ['male', 'female', 'unknown'], default: 'unknown'},
        birth_date: {type: Date, default: Date.now()},
        website: {type: String, trim: true, default: 'http://blog.icollege.com'},
        location: [{type: Number, index: '2dsphere', default: 0.0}],
        location_info: {type: String, trim: true},
        tags: [{type: String, trim: true}], // 用户个性标签
        status: {type: String, enum: ['online', 'invisible', 'offline'], default: 'offline', required: true}, // online offline or ...
        language: {type: String, enum: ['zh', 'en', 'fr'], default: 'zh'},
        last_login: {type: Date},
        created_at: {type: Date, default: Date.now()},
        created_by: {type: Schema.Types.ObjectId, required: true},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: Schema.Types.ObjectId, required: true},
        groups: [{
            group_id: {type: Schema.Types.ObjectId},
            message_alert: {type: Boolean, default: true},
            location_share: {type: Boolean, default: true},
            profile_visible: {type: Boolean, default: false},
            created_at: {type: Date, default: Date.now()}, // 记录了什么时候加入群组的信息
            created_by: {type: Schema.Types.ObjectId, required: true},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: Schema.Types.ObjectId, required: true}
        }],
        circles: [{
            circle_id: {type: Schema.Types.ObjectId},
            post_alert: {type: Boolean, default: true},
            location_share: {type: Boolean, default: true},
            profile_visible: {type: Boolean, default: false},
            created_at: {type: Date, default: Date.now()}, // 记录了什么时候加入圈子的信息
            created_by: {type: Schema.Types.ObjectId, required: true},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: Schema.Types.ObjectId, required: true}
        }],
        friends: [{
            friend_id: {type: Schema.Types.ObjectId},
            remark_name: {type: String, default: '', trim: true}, // 好友备注名称
            friend_group:{type: String, default: 'friends', trim: true}, // 好友所属分组， 这个灵活些~
            esp_care: {type: Boolean, default: false}, // 特别关心此好友吗
            message_block: {type: Boolean, default: false}, // 屏蔽消息
            status: {type: String, enum: ['pending', 'refused', 'agreed', 'expired'], default: 'pending'}, // 已经成为好友了吗，好友记录会在好友申请提交后插入，但是状态为pending，但是一旦被refuse，该记录择日会被清除，但是由好友申请构建的好友系统消息不会消失
            created_at: {type: Date, default: Date.now()},  // 记录了什么时候添加好友的信息
            created_by: {type: Schema.Types.ObjectId, required: true},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: Schema.Types.ObjectId, required: true}
        }],
        roles:[{
            type: Schema.Types.ObjectId,
            required: true
        }],
        permissions: [{
            permission_id: {type: Schema.Types.ObjectId, required: true},
            permission_scope: {type: String, enum: ['all', 'related', 'own']} // 最高Scope，无限制，有关联，仅限自己
        }],
        installed_apps: [{
            app_id: {type: Schema.Types.ObjectId, required: true},
            app_fields: [{
                uuid: {type: String, required: true}, // uuid
                key: {type: String, required: true},
                value: {type: String, default: ""},
                type: {type: String, enum: ['html', 'markdown'], default: 'html'},
                relatable_id: {type: Schema.Types.ObjectId, required: true},
                relatable_type: {type: String, enum: ['messages', 'posts', 'groups', 'circles'], default: 'posts'},
                created_at: {type: Date, default: Date.now()},
                created_by: {type: Schema.Types.ObjectId, required: true},
                updated_at: {type: Date, default: Date.now()},
                updated_by: {type: Schema.Types.ObjectId, required: true}
            }],
            app_settings: [{
                uuid: {type: String, required: true}, // uuid
                key: {type: String, required: true},
                value: {type: String, default: ""},
                created_at: {type: Date, default: Date.now()},
                created_by: {type: Schema.Types.ObjectId, required: true},
                updated_at: {type: Date, default: Date.now()},
                updated_by: {type: Schema.Types.ObjectId, required: true}
            }]
        }]
    },

    // ### APP
    // 所有开发者注册发布或iCollege维护的apps
    apps: {
        uuid: {type: String, required: true},
        lowercase_name: {type: String, required: true, trim: true, lowercase: true},
        name: {type: String, required: true, trim: true},
        slug: {type: String, required: true, trim: true},
        version: {type: String, required: true, trim: true},
        status: {type: String, required: true, enum: ['developing', 'released', 'inactive'], default: 'developing'},
        created_at: {type: Date, default: Date.now()},
        created_by: {type: Schema.Types.ObjectId, required: true},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: Schema.Types.ObjectId, required: true},
        // 这个 app 需要哪些permission，安装时需争取到用户同意，方可继续安装
        // app 能够拥有的permission永远是user permission的子集，这点需要验证！！！
        permissions: [{
            permission_id: {type: Schema.Types.ObjectId, required: true},
            permission_scope: {type: String, enum: ['all', 'related', 'own']} // 最高Scope，无限制，有关联，仅限自己
        }]
    },

    // ### 通知
    // 主要是为了应对圈子的回帖以及转发，@等动态的通知
    notifications: {
        uuid: {type: String, required: true}, // uuid
        user_id: {type: Schema.Types.ObjectId, required: true},
        note_category: {type: String, enum: ['re_post', 'favored', 'forward', 'at'], required: true},  // 这么几种类别: 回复，赞，转发，@ 这四种
        object_id: {type: Schema.Types.ObjectId, required: true}, // 对应着以上通知的类别，跟通知有关的对象ID可能是，re_post, post两种
        created_at: {type: Date, default: Date.now()},
        created_by: {type: Schema.Types.ObjectId, required: true},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: Schema.Types.ObjectId, required: true}
    },

    // ### 角色
    // 定义了用户的多个不同的角色分类
    roles: {
        uuid: {type: String, required: true}, // uuid
        name: {type: String, enum: ['SuperAdministrator', 'Administrator', 'iColleger'], required: true},
        permissions: [{
            permission_id: {type: Schema.Types.ObjectId, required: true},
            permission_scope: {type: String, enum: ['all', 'related', 'own']} // 最高Scope，无限制，有关联，仅限自己
        }],
        description: {type: String, trim: true, default: ""},
        created_at: {type: Date, default: Date.now()},
        created_by: {type: Schema.Types.ObjectId, required: true},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: Schema.Types.ObjectId, required: true}
    },

    // ### 权限
    permissions: {
        uuid: {type: String, required: true}, // uuid
        name: {type: String, required: true, trim: true},
        // object_types map the sub-modules of api module
        object_type: {
            type: String,
            enum: ['db', 'user', 'notification', 'role', 'permission',
                'group', 'circle', 'message', 'post', 're_post'],
            required: true
        },
        // action_types map the operations of each sub-module
        action_type: {
            type: String,
            enum: ['edit', 'remove', 'create', 'read', 'generate', 'exportContent',
                'importContent', 'deleteAllContent', 'browse', 'add'],
            required: true
        },
        object_id: {type: Schema.Types.ObjectId}, // 权限对象？这个字段什么意思
        created_at: {type: Date, default: Date.now()},
        created_by: {type: Schema.Types.ObjectId, required: true},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: Schema.Types.ObjectId, required: true}
    },

    // ### groups 群组实体
    groups: {
        uuid: {type: String, required: true}, // uuid
        nickname: {type: String, trim: true}, // group用于显示的名字，可以与其他群组重复的
        lowercase_group_name: {type: String, required: true, lowercase: true, trim: true}, // 小写形式，方便进行防止群组命名重复测试
        group_name: {type: String, required: true, trim: true}, // 标记了群组的唯一性
        avatar: {type: String}, // be what, for file storage, not sure
        // 群主
        user_id: {type: Schema.Types.ObjectId, required: true}, // user object id, who owns the group
        // 群组管理员，非！系统管理员
        related_ids: [{
            type: Schema.Types.ObjectId,
            required: true
        }],
        // user list, 全部的用户列表，包含群主和管理员
        members: [{
            member_id: {type: Schema.Types.ObjectId, required: true},
            member_name: {type: String, required: true, trim: true}
        }],
        // we have a limited range of categories for user to select, but not listed here as enums
        // 兴趣爱好：影视，音乐，星座，动漫，运动，读书，摄影，其他
        // 生活休闲：同城，同乡，购物，旅游，美食，美容，宠物，健康，母婴，其他
        // 游戏
        // 行业交流：投资，IT/互联网，建筑工程，服务，传媒，营销与广告，教师，律师，公务员，银行，咨询，其他
        // 学习考试：托福，雅思，CET4/6，GRE，GMAT，MBA，考研，高考，中考，职业认证，公务员，其他
        // 粉丝
        // 置业安家：业主，装修
        // 品牌产品
        // 同事*同学*朋友：亲友，同学，同事
        category: {type: String, required: true, trim: true}, // 群组类型
        description: {type: String, trim: true, default: "A Group of iCollege"}, // 群组介绍
        location: [{type: Number, index: '2dsphere', default: 0.0}],// longitude latitude
        location_info: {type: String, trim: true},// location name
        permission_on_add: {type: String, enum: ['not_allowed', 'need_permission', 'need_nothing'], default: 'need_permission'}, // 添加成员进群组时的审核策略：不需要审核或需要管理员审核等
        visibility: {type: Boolean, default: false}, // 对附近人的可见性
        credit: {type: Number, min: 0, default: 0}, // 积分
        attachments: [{
            uuid: {type: String, required: true}, // uuid
            name: {type: String, default: 'group_file', trim: true},
            extension: {type: String, default: '', trim: true}, // 文件扩展类型
            size: {type: Number, min: 0, default: 0},
            path: {type: String}, // 文件路径
            created_at: {type: Date, default: Date.now()},
            created_by: {type: Schema.Types.ObjectId, required: true},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: Schema.Types.ObjectId, required: true}
        }],
        created_at: {type: Date, default: Date.now()},
        created_by: {type: Schema.Types.ObjectId, required: true},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: Schema.Types.ObjectId, required: true}
    },

// ---------------------------------------- 扩充以下的实体字段 注:根据mongoose标准添加，如果有default，就无需加上required ------------- //

    // ### circles 圈子实体
    // 系统会为每一个用户创建一个好友圈，这个圈子只会用来抓取别的好友的posts，不应该写入任何内容
    circles: {
        uuid: {type: String, required: true}, // uuid
        nickname: {type: String}, // circle用于显示的名字，可以与其他圈子重复
        lowercase_circle_name: {type: String, required: true, lowercase: true, trim: true}, // 小写形式，方便进行防止圈子命名重复测试
        circle_name: {type: String, required: true, trim: true}, // 标记了圈子的唯一性
        // 圈主，圈子拥有者
        user_id: {type: Schema.Types.ObjectId}, // user object id
        // 圈子管理员，非！系统管理员
        related_ids: [{
            type: Schema.Types.ObjectId,
            required: true
        }],
        // user list, 全部的用户列表，包含圈主和管理员
        members: [{
            member_id: {type: Schema.Types.ObjectId, required: true},
            member_name: {type: String, required: true, trim: true}
        }],
        avatar: {type: String},
        // we have a limited range of categories for user to select, but not listed here as enums
        // 兴趣爱好：影视，音乐，星座，动漫，运动，读书，摄影，其他
        // 生活休闲：同城，同乡，购物，旅游，美食，美容，宠物，健康，母婴，其他
        // 游戏
        // 行业交流：投资，IT/互联网，建筑工程，服务，传媒，营销与广告，教师，律师，公务员，银行，咨询，其他
        // 学习考试：托福，雅思，CET4/6，GRE，GMAT，MBA，考研，高考，中考，职业认证，公务员，其他
        // 粉丝
        // 置业安家：业主，装修
        // 品牌产品
        // 同事*同学*朋友：亲友，同学，同事
        //
        // **圈子应该额外加一个category，是系统生成的专属个人朋友圈，还是用户创建的**
        category: {type: String, required: true, trim: true}, // 圈子类型，参考微群组
        description: {type: String}, // 圈子介绍
        location: [{type: Number, index: '2dsphere'}], // longitude latitude
        location_info: {type: String}, // location name
        permission_on_add: {type: String, enum: ['not_allowed', 'need_permission', 'need_nothing']}, // 添加成员进圈子时的审核策略：不需要审核或需要管理员审核等
        visibility: {type: Boolean, default: false}, // 对附近人的可见性
        credit: {type: Number, min: 0, default: 0}, // 积分
        created_at: {type: Date},
        created_by: {type: Schema.Types.ObjectId},
        updated_at: {type: Date},
        updated_by: {type: Schema.Types.ObjectId}
    },

    // ### 消息实体 一定要考虑消息的共通性，系统消息和聊天消息
    // 消息没有常规的 user_id 和 related_ids 字段，因为消息无所有者，仅有管理员和超级管理员可以删除
    messages: {
        uuid: {type: String}, // uuid
        content: {type: String},
        source_category: {type: String, enum: ['friends', 'groups'], required: true}, // 消息来自于个人（好友或系统（系统也是一个人类账号）），还是群组
        group_id: {type: Schema.Types.ObjectId}, // 仅有在消息来源于groups时此字段才有值
        content_category: {type: String, enum: ['media', 'text', 'system'], default: 'text'}, // 消息类型：多媒体消息（视频，纯图片，音频），富文本消息(html，谨防js注入)，其他类型的系统消息（好友请求，其他由系统relay的具有特殊格式的消息），
        message_from: {type: Schema.Types.ObjectId}, // 从这也能看出来，账户必须有角色，角色具有权限分级，并预留一个账户具备超级管理员角色，可以赋予普通用户管理员角色
        message_to: [{
            user_id: {type: Schema.Types.ObjectId},
            being_pulled: {type: Boolean, default: false} // 前端是否曾经抓取过
        }], // to的多样性，用户，群组
        created_at: {type: Date},
        created_by: {type: Schema.Types.ObjectId},
        updated_at: {type: Date},
        updated_by: {type: Schema.Types.ObjectId} // 消息的某些状态被改变，改变者为谁
    },

    // ### 帖子实体 一定要考虑帖子的共通性，发帖（日志）；存在于圈子里（所以人，都有一个自己的圈子，好友圈，其他圈子都是额外创建的）
    posts: {
        uuid: {type: String},
        slug: {type: String, required: true}, // 帖子的标识符，时间与title与作者关联组成，标注了帖子的唯一性
        title: {type: String},
        user_id: {type: Schema.Types.ObjectId}, // 用户Id，谁发的帖子
        circle_id: {type: Schema.Types.ObjectId}, // 圈子Id，自己专属朋友圈的ID或自己加入的朋友圈的ID
        source_category: {type: String, enum: ['friends', 'circles']}, // 帖子的来源，好友圈（默认），或是其他某一个圈子：好友圈这个圈子专属于自己，这个圈子包含了用户的所有好友

        // ================== 转发信息 ==================
        is_forward: {type: Boolean}, // 是否为转发
        forward_info: {     // 转发信息
            forward_message: {type: String},
            post_id: {type: Schema.Types.ObjectId}
        },
        // ================== 原创信息 ==================
        html: {type: String}, // 帖子内容，谨防js注入
        attachments: [{
            uuid: {type: String, required: true}, // uuid
            name: {type: String},
            extension: {type: String}, // 文件扩展类型
            size: {type: Number},
            path: {type: String}, // 文件路径
            created_at: {type: Date},
            created_by: {type: Schema.Types.ObjectId},
            updated_at: {type: Date},
            updated_by: {type: Schema.Types.ObjectId}
        }],
        status: {type: String, enum: ['draft', 'published'], default: 'draft'}, // 帖子的状态，draft or published
        language: {type: String, enum: ['zh', 'en'], default: 'zh'}, // 帖子的语言

        at_users: [{type: Schema.Types.ObjectId}], // @user ids
        favored_users: [{ // 点赞的用户
            user_id: {type: Schema.Types.ObjectId}, // 用户ID
            timestamp: {type: Date}   // 点赞的时间
        }],
        viewed_times: {type: Number}, // 浏览过的次数，不限制同一个用户浏览多次
        published_at: {type: Date},
        published_by: {type: Schema.Types.ObjectId},
        created_at: {type: Date},
        created_by: {type: Schema.Types.ObjectId},
        updated_at: {type: Date},
        updated_by: {type: Schema.Types.ObjectId}
    },

    // ### 回帖实体
    re_posts: {
        uuid: {type: String},
        user_id: {type: Schema.Types.ObjectId}, // 用户Id，谁发的帖子回复
        circle_id: {type: Schema.Types.ObjectId}, // 圈子Id，回帖回的帖子属于哪个圈子
        source_category: {type: String, enum: ['posts, re_posts']}, // 是来自于帖子 还是 回帖
        re_post_to: {type: Schema.Types.ObjectId}, // 帖子ID或是回帖ID

        // ================== 回帖内容 ==============
        html: {type: String}, // 帖子内容，谨防js注入
        attachments: [{
            uuid: {type: String, required: true}, // uuid
            name: {type: String},
            extension: {type: String}, // 文件扩展类型
            size: {type: Number},
            path: {type: String}, // 文件路径
            created_at: {type: Date},
            created_by: {type: Schema.Types.ObjectId}
        }],
        language: {type: String},

        at_users: [{type: Schema.Types.ObjectId}], // @user ids

        created_at: {type: Date},
        created_by: {type: Schema.Types.ObjectId},
        updated_at: {type: Date},
        updated_by: {type: Schema.Types.ObjectId}
    }

};

function isPost(jsonData) {
    return jsonData.hasOwnProperty('html') && jsonData.hasOwnProperty('post_from') &&
        jsonData.hasOwnProperty('title') && jsonData.hasOwnProperty('slug');
}

function isRePost(jsonData) {
    return jsonData.hasOwnProperty('html') && jsonData.hasOwnProperty('re_post_from');
}

module.exports.collections = db;
module.exports.checks = {
    isPost: isPost,
    isRePost: isRePost
};
