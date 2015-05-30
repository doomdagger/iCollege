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
        // #### unique flags
        uuid: {type: String, required: true}, // uuid
        slug: {type: String, required: true, lowercase: true, trim: true},
        // #### auth info
        name: {type: String, required: true, trim: true}, // name, 使用名称生成slug
        password: {type: String, required: true, trim: true}, // 登陆密码
        // #### auth helper
        email: {type: String, match: /.*?@.*?/, trim: true}, // 可用作登陆账号
        phone: {type: String, match: /1[0-9]{10}/, trim: true}, // 可用作登陆账号
        // #### basic info
        nickname: {type: String, required: true, trim: true}, // 可以随便起，用于显示
        avatar: {type: String}, // be what, for file storage, not sure
        credit: {type: Number, default: 0, min: 0}, // 积分，也就是经验值
        bio: {type: String, trim: true, default: 'I love iCollege'},
        signature: {type: String, trim: true, default: 'I love iCollege'},
        website: {type: String, trim: true, default: 'http://blog.icollege.com'},
        // #### filter info
        gender: {type: String, enum: ['male', 'female', 'unknown'], default: 'unknown'},
        birth_date: {type: Date, default: Date.now()},
        location: [{type: Number, index: '2dsphere', default: 0.0}], // 经纬度
        location_info: {type: String, trim: true}, // 地址位置文字描述
        tags: [{type: String, trim: true}], // 用户个性标签

        // #### status

        // inactive states: invited, invited-pending, inactive
        // active-usable states: active
        // active-unusable states: locked
        // 记录密码输入错误： 'warn-1', 'warn-2', 'warn-3', 'warn-4'
        status: {type: String, enum: ['active', 'invited', 'invited-pending', 'inactive', 'locked', 'warn-1', 'warn-2', 'warn-3', 'warn-4'], default: 'inactive', required: true},
        login_status: {type: String, enum: ['online', 'invisible', 'offline'], default: 'offline'},// online offline or ...
        last_login: {type: Date},

        // #### user settings
        settings: {
            profile_visibility: {type: String, enum: ['private', 'public', 'friends_only'], default: 'friends_only'},
            language: {type: String, enum: ['zh_CN', 'en_US'], default: 'zh_CN'}
        },

        // #### log trace info
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String},

        // #### groups user joined
        // **sub document**
        // **ref**
        groups: [{
            // foreign ref
            group: {type: String, ref: 'Group'},

            // duplicate info for convenience
            group_name: {type: String},

            esp_care: {type: Boolean, default: false}, // 特别关心此群组
            message_block: {type: Boolean, default: false}, // 屏蔽消息
            location_share: {type: Boolean, default: true},
            profile_visible: {type: Boolean, default: false},

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],

        // #### user's roles
        // **ref**
        roles: [{
            type: String,
            ref: 'Role'
        }],

        // #### user's permissions
        // **ref**
        permissions: [{
            type: String,
            ref: 'Permission'
        }]
    },


    // ### 通知
    // 主要是为了应对圈子的回帖以及转发，@等动态的通知
    notifications: {
        // #### unique flags
        uuid: {type: String, required: true}, // uuid

        // #### basic info

        from_user: {type: String, required: true, ref: 'User'},
        to_user: {type: String, required: true, ref: 'User'},

        action_type: {type: String, enum: ['repost', 'favored', 'forward', 'at'], required: true},  // 这么几种类别: 回复，赞，转发，@ 这四种
        object_type: {type: String, enum: ['repost', 'post'], required: true},
        object_id: {type: String, required: true}, // 对应着以上通知的类别，跟通知有关的对象ID可能是，repost, post两种，记住，是原有对象，不是行为产生后的对象

        // #### log trace info
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 角色
    // 定义了用户的多个不同的角色分类
    roles: {
        // #### unique flags
        uuid: {type: String, required: true}, // uuid
        name: {type: String, enum: ['SuperAdministrator', 'Administrator', 'iColleger', 'updated', 'test1'], required: true},

        // #### basic info
        description: {type: String, trim: true, default: ""},

        // #### permissions
        // **ref**
        permissions: [{
            type: String,
            ref: 'Permission'
        }],

        // #### log trace info
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 权限
    permissions: {
        // #### unique flags
        uuid: {type: String, required: true}, // uuid
        name: {type: String, required: true, trim: true},

        // object_types map the sub-modules of api module
        object_type: {
            type: String,
            enum: ['db', 'user', 'app', 'notification', 'role', 'permission', 'group_member', 'circle_member',
                'group', 'circle', 'message', 'post', 'repost', 'setting', 'mail', 'slug', 'test'],
            required: true
        },
        // action_types map the operations of each sub-module
        action_type: {
            type: String,
            enum: ['edit', 'destroy', 'create', 'read', 'generate', 'exportContent', 'remove',
                'favor', 'importContent', 'deleteAllContent', 'browse', 'add', 'send', 'assign', 'test'],
            required: true
        },
        object_id: {type: String}, // 非必须的

        // #### log trace info
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### groups 群组实体
    groups: {
        // #### unique flags
        uuid: {type: String, required: true}, // uuid

        creator: {type: String, required: true, ref: "User"},

        // #### basic info
        nickname: {type: String, required: true, trim: true}, // 可以随便起，用于显示
        avatar: {type: String}, // be what, for file storage, not sure
        description: {type: String, trim: true, default: "A Group of iCollege"}, // 群组介绍
        credit: {type: Number, min: 0, default: 0}, // 群积分

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
        category: {type: String, required: true, trim: true, default: "朋友"}, // 群组类型
        tags: [{type: String, trim: true}], // 用户个性标签
        location: [{type: Number, index: '2dsphere', default: 0.0}],// longitude latitude
        location_info: {type: String, trim: true},// location name

        // #### user list, 全部的用户列表
        // **ref**
        // **sub document**
        members: [{
            member: {type: String, required: true, ref: "User"},

            member_name: {type: String, required: true, trim: true}, // 默认为用户昵称，可以改为想要的任何名称
            member_avatar: {type: String},

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],

        // #### 群公告
        // **sub document**
        statement: [{
            uuid: {type: String, required: true}, // uuid

            author: {type: String, required: true, ref: "User"},
            author_name: {type: String, trim: true, required: true},

            title: {type: String, trim: true, default: "Hello!"},
            content: {type: String, trim: true, default: "New Group~ Say Something to Your Members"},

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],

        // #### 群文件
        // **sub document**
        attachments: [{
            uuid: {type: String, required: true}, // uuid

            uploader: {type: String, required: true, ref: "User"},
            uploader_name: {type: String, trim: true, required: true},

            name: {type: String, default: 'group_file', trim: true},
            extension: {type: String, default: '', trim: true}, // 文件扩展类型
            size: {type: Number, min: 0, default: 0},
            path: {type: String}, // 文件路径

            upload_at: {type: Date, default: Date.now()},

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],

        settings: {
            permission_on_add: {type: String, enum: ['not_allowed', 'need_permission', 'need_nothing'], default: 'need_permission'}, // 添加成员进群组时的审核策略：不需要审核或需要管理员审核等
            member_visibility: {type: Boolean, default: false}, // 未加群是否可查看群成员
            location_visibility: {type: Boolean, default: false}, // 对附近人的可见性，有些情况下，群资料不完整，此属性强制为false
            allow_anonymous: {type: Boolean, default: true} // 是否允许匿名发言
        },

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },


    // ### 消息实体 一定要考虑消息的共通性，系统消息和聊天消息
    // 消息没有常规的 user_id 和 related_ids 字段，因为消息无所有者，仅有管理员和超级管理员可以删除
    messages: {
        uuid: {type: String, required: true}, // uuid

        source_category: {type: String, enum: ['users', 'groups'], required: true}, // 消息来自于个人（好友或系统（系统也是一个人类账号）），还是群组
        message_to: {type: String, required: true}, // to的多样性，用户，群组

        content_category: {type: String, enum: ['media', 'text', 'system'], default: 'text'}, // 消息类型：多媒体消息（视频，纯图片，音频），富文本消息(html，谨防js注入)，其他类型的系统消息（好友请求，其他由系统relay的具有特殊格式的消息），
        content: {type: String, required: true},

        message_from: {type: String, required: true, ref: 'User'}, // 从这也能看出来，账户必须有角色，角色具有权限分级，并预留一个账户具备超级管理员角色，可以赋予普通用户管理员角色

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 帖子实体 一定要考虑帖子的共通性，发帖（日志）；存在或不存在于圈子里
    posts: {
        uuid: {type: String, required: true},
        slug: {type: String, required: true, trim: true, lowercase: true}, // 帖子的标识符，时间与title与作者关联组成，标注了帖子的唯一性

        title: {type: String, required: true},

        author: {type: String, required: true, ref: 'User'}, // 用户Id，谁发的帖子
        author_name: {type: String, trim: true, required: true},

        // #### 可见此帖的群组
        // **ref**
        visible_groups: [{
            type: String,
            ref: 'Group'
        }],

        post_type: {type: String, enum: ['forward', 'original'], default: "original"}, // 是否为转发

        // ================== 转发信息 ==================
        forward_message: {type: String, default: ''},
        post_id: {type: String, required: true, ref: "Post"},

        // ================== 原创信息 ==================
        html: {type: String, default: ''}, // 帖子内容，谨防js注入
        attachments: [{
            uuid: {type: String, required: true}, // uuid

            name: {type: String, default: 'group_file', trim: true},
            extension: {type: String, default: '', trim: true}, // 文件扩展类型
            size: {type: Number, min: 0, default: 0},
            path: {type: String}, // 文件路径

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],

        // ================ 转发，原创共享字段 ==============
        status: {type: String, enum: ['draft', 'published'], default: 'draft'}, // 帖子的状态，draft or published
        // 点赞的用户
        favored_users: [{
            user: {type: String, required: true, ref: 'User'}, // 用户ID
            user_name: {type: String, trim: true, required: true},
            timestamp: {type: Date, required: true, default: Date.now()}   // 点赞的时间
        }],
        // 查看过的用户
        viewed_users: [{
            user_id: {type: String, required: true, ref: 'User'}, // 用户ID
            user_name: {type: String, trim: true, required: true},
            timestamp: {type: Date, required: true, default: Date.now()}  // 浏览的时间
        }],

        published_at: {type: Date, default: Date.now()},

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 回帖实体
    reposts: {
        uuid: {type: String, required: true},

        author: {type: String, required: true, ref: 'User'}, // 用户Id，谁发的帖子
        author_name: {type: String, trim: true, required: true},

        to_post: {type: String, required: true, ref: 'Post'}, // 回帖属于哪个post，无论是回复帖子，还是回帖，这个字段记录了根帖子是谁
        to_user: {type: String, ref: 'User'}, // 回复谁，回复对象为回帖时字段填值才有意义
        to_user_name: {type: String, trim: true, required: true},

        // ================== 回帖内容 ==============
        html: {type: String, default: ''}, // 帖子内容，谨防js注入

        published_at: {type: Date, default: Date.now()},

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 设置实体，相当于数据字典，也相当于一些系统级的默认配置
    settings: {
        uuid: {type: String, required: true},
        key: {type: String, required: true},
        value: {type: String},
        type: {type: String, required: true, default: 'core', enum: ['core', 'admin', 'user', 'app', 'group', 'circle', 'post']}, // TODO: add more setting types for icollege
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### client, oauth 2.0 client, an app and an user can both become a client
    clients: {
        uuid: {type: String, required: true},
        name: {type: String, required: true, trim: true},
        slug: {type: String, required: true, trim: true, lowercase: true},
        secret: {type: String, required: true, trim: true},
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },
    accesstokens: {
        token: {type: String, required: true, unique: true},
        user_id: {type: String, required: true, ref: 'User'},
        client_id: {type: String, required: true, ref: 'Client'},
        expires: {type: Number, required: true, min: 0}
    },
    refreshtokens: {
        token: {type: String, required: true, unique: true},
        user_id: {type: String, required: true, ref: 'User'},
        client_id: {type: String, required: true, ref: 'Client'},
        expires: {type: Number, required: true, min: 0}
    }

};

module.exports.collections = db;
