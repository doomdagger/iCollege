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
        slug: {type: String, required: true, lowercase: true, trim: true},
        name: {type: String, required: true, trim: true}, // name, 使用名称生成slug

        nickname: {type: String, required: true, trim: true}, // 可以随便起，用于显示
        email: {type: String, match: /.*?@.*?/, trim: true}, // 可用作登陆账号
        phone: {type: String, match: /1[0-9]{10}/, trim: true}, // 可用作登陆账号
        password: {type: String, required: true, trim: true}, // 登陆密码

        avatar: {type: String}, // be what, for file storage, not sure
        credit: {type: Number, default: 0, min: 0}, // 积分，也就是经验值
        bio: {type: String, trim: true, default: 'I love iCollege'},
        signature: {type: String, trim: true, default: 'I love iCollege'},
        gender: {type: String, enum: ['male', 'female', 'unknown'], default: 'unknown'},
        birth_date: {type: Date, default: Date.now()},
        website: {type: String, trim: true, default: 'http://blog.icollege.com'},
        location: [{type: Number, index: '2dsphere', default: 0.0}], // 经纬度
        location_info: {type: String, trim: true}, // 地址位置文字描述
        tags: [{type: String, trim: true}], // 用户个性标签
        // inactive states: invited, invited-pending, inactive
        // active-usable states: online, invisible, offline
        // active-unusable states: locked
        // 记录密码输入错误： 'warn-1', 'warn-2', 'warn-3', 'warn-4'
        status: {type: String, enum: ['online', 'invisible', 'offline', 'invited', 'invited-pending', 'inactive', 'locked', 'warn-1', 'warn-2', 'warn-3', 'warn-4'], default: 'inactive', required: true}, // online offline or ...
        last_login: {type: Date},

        settings: {
            profile_visibility: {type: String, enum: ['private', 'public', 'friends_only'], default: 'friends_only'},
            language: {type: String, enum: ['zh_CN', 'en_US'], default: 'zh_CN'}
        },

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String},

        // 加入的群组
        groups: [{
            group_id: {type: String, ref: 'Group'},

            message_alert: {type: Boolean, default: true},
            location_share: {type: Boolean, default: true},
            profile_visible: {type: Boolean, default: false},

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],
        // 加入的圈子
        circles: [{
            circle_id: {type: String, ref: 'Circle'},

            post_alert: {type: Boolean, default: true},
            location_share: {type: Boolean, default: true},
            profile_visible: {type: Boolean, default: false},

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],
        // 添加的好友
        friends: [{
            friend_id: {type: String, ref: 'User'},
            remark_name: {type: String, default: '', trim: true}, // 好友备注名称
            friend_group: {type: String, default: 'friends', trim: true}, // 好友所属分组， 这个灵活些~
            esp_care: {type: Boolean, default: false}, // 特别关心此好友吗
            message_block: {type: Boolean, default: false}, // 屏蔽消息
            // 获取好友列表时请筛选status为agreed的
            status: {type: String, enum: ['pending', 'refused', 'agreed', 'expired'], default: 'pending'}, // 已经成为好友了吗，好友记录会在好友申请提交后插入，但是状态为pending，但是一旦被refuse，该记录择日会被清除，但是由好友申请构建的好友系统消息不会消失

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],
        // 用户角色
        roles: [{
            type: String,
            ref: 'Role'
        }],
        // 用户享有的权限
        permissions: [{
            type: String,
            ref: 'Permission'
        }],
        // 太过于遥远，再说吧
        apps: [{
            app_id: {type: String, required: true, ref: 'App'},
            app_fields: [{
                uuid: {type: String, required: true}, // uuid
                key: {type: String, required: true},
                value: {type: String, default: ""},
                type: {type: String, enum: ['html', 'markdown'], default: 'html'},
                relatable_id: {type: String, required: true},
                relatable_type: {type: String, enum: ['messages', 'posts', 'groups', 'circles'], default: 'posts'},
                created_at: {type: Date, default: Date.now()},
                created_by: {type: String},
                updated_at: {type: Date, default: Date.now()},
                updated_by: {type: String}
            }],
            app_settings: [{
                uuid: {type: String, required: true}, // uuid
                key: {type: String, required: true},
                value: {type: String, default: ""},
                created_at: {type: Date, default: Date.now()},
                created_by: {type: String},
                updated_at: {type: Date, default: Date.now()},
                updated_by: {type: String}
            }]
        }]
    },

    // ### APP
    // 所有开发者注册发布或iCollege维护的apps
    // TODO registered OAuth application, having its unique _ID and Client Secret.
    // OAuth Protocol:
    // authorizing procedure:
    // 1. redirect users to permission confirmation page: GET _id   response: code - an unguessable string
    // 2. user accept your access, then a post request be made: POST _id secret code(response from #1)   response: access_token generated - developer should save it and iCollege also should save it!
    // 3. user access_token to access api: access_token can be in query param, can also be in "Authorization: token TOKEN_HERE" Header
    apps: {
        uuid: {type: String, required: true},
        slug: {type: String, required: true, trim: true, lowercase: true},
        name: {type: String, required: true, trim: true},
        avatar: {type: String}, // be what, for file storage, not sure
        version: {type: String, required: true, trim: true},
        // 这个 app 需要哪些permission，安装时需争取到用户同意，方可继续安装
        // app 能够拥有的permission永远是user permission的子集，这点需要验证！！！
        permissions: [{
            type: String,
            ref: 'Permission'
        }],
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 通知，见于通知中心
    // 主要是为了应对圈子的回帖以及转发，@等动态的通知
    notifications: {
        uuid: {type: String, required: true}, // uuid

        to_user_id: {type: String, required: true, ref: 'User'},
        from_user_id: {type: String, required: true, ref: 'User'},

        action_type: {type: String, enum: ['repost', 'favored', 'forward', 'at'], required: true},  // 这么几种类别: 回复，赞，转发，@ 这四种
        object_type: {type: String, enum: ['repost', 'post'], required: true},
        object_id: {type: String, required: true}, // 对应着以上通知的类别，跟通知有关的对象ID可能是，repost, post两种，记住，是原有对象，不是行为产生后的对象

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 角色
    // 定义了用户的多个不同的角色分类
    roles: {
        uuid: {type: String, required: true}, // uuid
        name: {type: String, enum: ['SuperAdministrator', 'Administrator', 'iColleger'], required: true},
        permissions: [{
            type: String,
            ref: 'Permission'
        }],
        description: {type: String, trim: true, default: ""},

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 权限
    permissions: {
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

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### groups 群组实体
    groups: {
        uuid: {type: String, required: true}, // uuid
        slug: {type: String, required: true, lowercase: true, trim: true},
        name: {type: String, required: true, trim: true}, // name, 使用名称生成slug，标记了群组的唯一性

        owner_id: {type: String, required: true, ref: 'User'}, // user object id, who owns the group， 群主

        nickname: {type: String, required: true, trim: true}, // 可以随便起，用于显示
        avatar: {type: String}, // be what, for file storage, not sure

        // user list, 全部的用户列表，包含群主和管理员
        members: [{
            member_id: {type: String, required: true},
            member_name: {type: String, required: true, trim: true}, // 默认为用户昵称，可以改为想要的任何名称
            related: {type: Boolean, default: false}, // 是否为群管理员，群主也标记related为true
            status: {type: String, enum: ['pending', 'refused', 'agreed', 'expired'], default: 'pending'}, // 已经成为成员了吗，成员记录会在用户加入群组申请提交后插入，但是状态为pending，但是一旦被refuse，该记录择日会被清除，但是由成员申请构建生成的系统消息不会消失

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
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
        category: {type: String, required: true, trim: true, default: "朋友"}, // 群组类型
        description: {type: String, trim: true, default: "A Group of iCollege"}, // 群组介绍
        statement: [{
            uuid: {type: String, required: true}, // uuid
            title: {type: String, trim: true, default: "Hello!"},
            content: {type: String, trim: true, default: "New Group~ Say Something to Your Members"},
            author: {type: String, trim: true, required: true}, // 我们到时候只显示名称即可，存个字符串就行
            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],  // 群公告
        location: [{type: Number, index: '2dsphere', default: 0.0}],// longitude latitude
        location_info: {type: String, trim: true},// location name
        credit: {type: Number, min: 0, default: 0}, // 群积分

        settings: {
            permission_on_add: {type: String, enum: ['not_allowed', 'need_permission', 'need_nothing'], default: 'need_permission'}, // 添加成员进群组时的审核策略：不需要审核或需要管理员审核等
            visibility: {type: Boolean, default: false} // 对附近人的可见性
        },

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

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ---------------------------------------- 扩充以下的实体字段 注:根据mongoose标准添加，如果有default，就无需加上required ------------- //

    // ### circles 圈子实体
    // 系统会为每一个用户创建一个好友圈，这个圈子只会用来抓取别的好友的posts，不应该写入任何内容
    circles: {
        uuid: {type: String, required: true}, // uuid
        slug: {type: String, required: true, lowercase: true, trim: true},
        name: {type: String, required: true, trim: true}, // name, 使用名称生成slug，标记了群组的唯一性

        owner_id: {type: String, required: true, ref: 'User'}, // user object id, who owns the group， 群主

        nickname: {type: String, required: true, trim: true}, // 可以随便起，用于显示
        avatar: {type: String}, // be what, for file storage, not sure

        // user list, 全部的用户列表，包含圈主和管理员
        members: [{
            member_id: {type: String, required: true},
            member_name: {type: String, required: true, trim: true},
            related: {type: Boolean, default: false}, // 是否为圈子管理员，圈子主也标记related为true
            status: {type: String, enum: ['pending', 'refused', 'agreed', 'expired'], default: 'pending'}, // 已经成为成员了吗，成员记录会在用户加入群组申请提交后插入，但是状态为pending，但是一旦被refuse，该记录择日会被清除，但是由成员申请构建生成的系统消息不会消失

            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
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
        //
        category: {type: String, required: true, trim: true, default: '朋友'}, // 圈子类型，参考微群组
        description: {type: String}, // 圈子介绍
        statement: [{
            uuid: {type: String, required: true}, // uuid
            title: {type: String, trim: true, default: "Hello!"},
            content: {type: String, trim: true, default: "New Circle~ Say Something to Your Members"},
            author: {type: String, trim: true, required: true}, // 我们到时候只显示名称即可，存个字符串就行
            created_at: {type: Date, default: Date.now()},
            created_by: {type: String},
            updated_at: {type: Date, default: Date.now()},
            updated_by: {type: String}
        }],  // 圈子公告
        location: [{type: Number, index: '2dsphere'}], // longitude latitude
        location_info: {type: String, trim: true}, // location name
        credit: {type: Number, min: 0, default: 0}, // 积分

        settings: {
            permission_on_add: {type: String, enum: ['not_allowed', 'need_permission', 'need_nothing'], default: 'need_permission'}, // 添加成员进群组时的审核策略：不需要审核或需要管理员审核等
            visibility: {type: Boolean, default: false} // 对附近人的可见性
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
        content: {type: String, required: true},
        source_category: {type: String, enum: ['friends', 'groups'], required: true}, // 消息来自于个人（好友或系统（系统也是一个人类账号）），还是群组
        content_category: {type: String, enum: ['media', 'text', 'system'], default: 'text'}, // 消息类型：多媒体消息（视频，纯图片，音频），富文本消息(html，谨防js注入)，其他类型的系统消息（好友请求，其他由系统relay的具有特殊格式的消息），
        message_from: {type: String, required: true}, // 从这也能看出来，账户必须有角色，角色具有权限分级，并预留一个账户具备超级管理员角色，可以赋予普通用户管理员角色
        // to的多样性，用户，群组
        message_to: {type: String, required: true},

        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String} // 消息的某些状态被改变，改变者为谁
    },

    // ### 帖子实体 一定要考虑帖子的共通性，发帖（日志）；存在或不存在于圈子里
    posts: {
        uuid: {type: String, required: true},
        slug: {type: String, required: true, trim: true, lowercase: true}, // 帖子的标识符，时间与title与作者关联组成，标注了帖子的唯一性

        title: {type: String, required: true},

        author_id: {type: String, required: true, ref: 'User'}, // 用户Id，谁发的帖子
        circle_id: {type: String, ref: 'Circle'}, // 圈子Id，自己加入的朋友圈的ID, circle_id为空可认为此post发自于用户，并希望朋友看到，而不是发到某个圈子中，让圈友看到

        // 帖子的来源，好友圈（默认），或是其他某一个圈子：好友圈这个圈子专属于自己，这个圈子包含了用户的所有好友
        source_category: {type: String, enum: ['friends', 'circles'], required: true}, // circle_id为空是有意义的，此字段也不算冗余，暂时保留

        post_type: {type: String, enum: ['forward', 'original'], default: "original"}, // 是否为转发

        // ================== 转发信息 ==================
        forward_info: {     // 转发信息
            forward_message: {type: String, default: ''},
            post_id: {type: String, required: true, ref: "Post"}
        },

        // ================== 原创信息 ==================
        original_info: {
            html: {type: String, default: ''}, // 帖子内容，谨防js注入
            attachments: [{
                uuid: {type: String, required: true}, // uuid
                name: {type: String, trim: true},
                extension: {type: String, default: '', trim: true}, // 文件扩展类型
                size: {type: Number, min: 0, default: 0},
                path: {type: String}, // 文件路径

                created_at: {type: Date, default: Date.now()},
                created_by: {type: String},
                updated_at: {type: Date, default: Date.now()},
                updated_by: {type: String}
            }]
        },

        // ================ 转发，原创共享字段 ==============
        status: {type: String, enum: ['draft', 'published'], default: 'draft'}, // 帖子的状态，draft or published
        at_users: [{type: String, ref: 'User'}], // @user ids
        favored_users: [{ // 点赞的用户
            user_id: {type: String, required: true, ref: 'User'}, // 用户ID
            timestamp: {type: Date, required: true, default: Date.now()}   // 点赞的时间
        }],
        viewed_users: [{
            user_id: {type: String, required: true, ref: 'User'}, // 用户ID
            timestamp: {type: Date, required: true, default: Date.now()}  // 浏览的时间
        }],

        published_at: {type: Date, default: Date.now()},
        published_by: {type: String, required: true},
        created_at: {type: Date, default: Date.now()},
        created_by: {type: String},
        updated_at: {type: Date, default: Date.now()},
        updated_by: {type: String}
    },

    // ### 回帖实体
    reposts: {
        uuid: {type: String, required: true},

        author_id: {type: String, required: true, ref: 'User'}, // 用户Id，谁发的帖子回复
        circle_id: {type: String, ref: 'Circle'}, // 圈子Id，回帖回的帖子属于哪个圈子？ 如果post不属于任何圈子，此字段可为空

        to_post_id: {type: String, ref: 'Post'}, // 回帖属于哪个post，无论是回复帖子，还是回帖，这个字段记录了根帖子是谁

        repost_type: {type: String, enum: ['posts, reposts']}, // 回复是直接对帖子 还是 对回帖
        to_user_id: {type: String}, // 回复谁，回复对象为回帖时字段填值才有意义

        // ================== 回帖内容 ==============
        html: {type: String}, // 帖子内容，谨防js注入
        attachments: [{
            uuid: {type: String, required: true}, // uuid
            name: {type: String, trim: true},
            extension: {type: String, default: '', trim: true}, // 文件扩展类型
            size: {type: Number, min: 0, default: 0},
            path: {type: String}, // 文件路径
            created_at: {type: Date, default: Date.now()},
            created_by: {type: String}
        }],

        at_users: [{type: String}], // @user ids

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
        type: {type: String, required: true, default: 'core', enum: ['core', 'user', 'app', 'group', 'circle', 'post']}, // TODO: add more setting types for icollege
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
