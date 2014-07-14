// # Schema
// 这里定义了数据库实体的字段信息，export后供models模块使用

// ## DB Design
var db = {
    // ### users 用户实体
    users: {
        uuid: {type: String}, // uuid
        name: {type: String}, // nickname
        username: {type: String}, // used for sign in
        password: {type: String},
        email: {type: String},
        avatar: {type: String},
        images: [{type: String}],
        credit: {type: Number}, // 积分，也就是经验值
        bio: {type: String},
        signature: {type: String},
        gender: {type: String},
        birth_date: {type: Date},
        website: {type: String},
        location: [{type: Number}],
        location_info: {type: String},
        tags: [{type: String}],
        status: {type: String}, // online offline or ...
        language: {type: String},
        last_login: {type: Date},
        created_at: {type: Date},
        created_by: {type: ObjectId},
        updated_at: {type: Date},
        updated_by: {type: ObjectId},
        groups: [{
            group_id: {type: ObjectId},
            message_alert: {type: Boolean},
            location_share: {type: Boolean},
            profile_visible: {type: Boolean}
        }],
        circles: [{
            circle_id: {type: ObjectId},
            post_alert: {type: Boolean},
            location_share: {type: Boolean},
            profile_visible: {type: Boolean}
        }]
    },

    // ### groups 群组实体
    groups: {
        uuid: {type: String}, // uuid
        name: {type: String}, // name
        avatar: {type: String},
        category: {type: String}, // 群组类型
        description: {type: String}, // 群组介绍
        location: [{type: Number}], // longitude latitude
        location_info: {type: String}, // location name
        permission_on_add: {type: String}, // 添加成员进群组时的审核策略：不需要审核或需要管理员审核等
        visibility: {type: Boolean}, // 对附近人的可见性
        members: [{
            member_id: {type: ObjectId},
            member_name: {type: String}
        }], // user list
        owner: {type: ObjectId}, // user object id
        credit: {type: Number}, // 积分
        attachments: [{
            name: {type: String},
            extension: {type: String}, // 文件扩展类型
            size: {type: Number},
            path: {type: String}, // 文件路径
            created_at: {type: Date},
            created_by: {type: ObjectId}
        }],
        created_at: {type: Date},
        created_by: {type: ObjectId},
        updated_at: {type: Date},
        updated_by: {type: ObjectId}
    },

    // ### circles 圈子实体
    circles: {
        uuid: {type: String}, // uuid
        name: {type: String}, // name
        avatar: {type: String},
        category: {type: String}, // 圈子类型
        description: {type: String}, // 圈子介绍
        location: [{type: Number}], // longitude latitude
        location_info: {type: String}, // location name
        permission_on_add: {type: String}, // 添加成员进圈子时的审核策略：不需要审核或需要管理员审核等
        visibility: {type: Boolean}, // 对附近人的可见性
        members: [{
            member_id: {type: ObjectId},
            member_name: {type: String}
        }], // user list
        owner: {type: ObjectId}, // user object id
        credit: {type: Number}, // 积分
        created_at: {type: Date},
        created_by: {type: ObjectId},
        updated_at: {type: Date},
        updated_by: {type: ObjectId}
    },

    // ### 消息实体 一定要考虑消息的共通性，系统消息和聊天消息
    messages: {
        uuid: {type: String}, // uuid
        content: {type: String},
        source_category: {type: String}, // 消息来自于系统，还是个人（好友之间），还是群组
        content_category: {type: String}, // 消息类型：多媒体消息（视频，纯图片，音频），富文本消息(html)，其他类型的系统消息（好友请求，其他由系统relay的具有特殊格式的消息），
        message_from: {type: ObjectId}, // 从这也能看出来，账户必须有角色，角色具有权限分级，并预留一个账户具备超级管理员角色，可以赋予普通用户管理员角色
        message_to: {type: ObjectId}, // to的多样性，用户，群组
        being_pulled: {type: Boolean}, // 前端是否曾经抓取过
        created_at: {type: Date},
        created_by: {type: ObjectId},
        updated_at: {type: Date},
        updated_by: {type: ObjectId} // 消息的某些状态被改变，改变者为谁
    },

    // ### 帖子实体 一定要考虑帖子的共通性，发帖（日志）；存在于圈子里（所以人，都有一个自己的圈子，好友圈，其他圈子都是额外创建的）
    posts: {
        uuid: {type: String},
        title: {type: String},
        slug: {type: String}, // 消息的唯一标识符，全局分配，会被用于url中
        html: {type: String}, // 帖子内容
        attachments: [{
            name: {type: String},
            extension: {type: String}, // 文件扩展类型
            size: {type: Number},
            path: {type: String}, // 文件路径
            created_at: {type: Date},
            created_by: {type: ObjectId}
        }],
        featured: {type: Boolean}, // 特色贴
        status: {type: String}, // 帖子的状态，draft or published
        language: {type: String},
        source_category: {type: String}, // 帖子的来源，好友圈（默认），或是其他某一个圈子：好友圈这个圈子其实并不存在，这个圈子包含了用户的所有好友
        post_from: {type: ObjectId}, // 用户Id，谁发的帖子
        created_at: {type: Date},
        created_by: {type: ObjectId},
        updated_at: {type: Date},
        updated_by: {type: ObjectId},
        published_at: {type: Date},
        published_by: {type: ObjectId}
    },

    // ### 回帖实体
    re_posts: {
        uuid: {type: String},
        html: {type: String}, // 帖子内容
        attachments: [{
            name: {type: String},
            extension: {type: String}, // 文件扩展类型
            size: {type: Number},
            path: {type: String}, // 文件路径
            created_at: {type: Date},
            created_by: {type: ObjectId}
        }],
        language: {type: String},
        source_category: {type: String}, // 是来自于帖子 还是 回帖
        re_post_from: {type: ObjectId}, // 用户Id，谁发的帖子回复
        re_post_to: {type: ObjectId}, // 帖子ID或是回帖ID
        created_at: {type: Date},
        created_by: {type: ObjectId},
        updated_at: {type: Date},
        updated_by: {type: ObjectId}
    }

    /*
    users: {
        name: {type: String, default: "Li He", required: true},
        password: {type: String, default: "12345", required: true},
        // # display functions below
        status: {type: String, enum: ['online', 'offline', 'invalid'], lowercase: true},
        email: {type: String, match: /.*?@.*?/, trim: true},
        createAt: {type: Date, expires: 60 * 60 * 24}, // 24 hours
        age: {type: Number, min: 0, max: 150},
        tags: [{type: String}], // array
        address: {
            city: String,
            street: String
        }
    }*/
};

function isPost(jsonData) {
    return jsonData.hasOwnProperty('html') && jsonData.hasOwnProperty('markdown') &&
        jsonData.hasOwnProperty('title') && jsonData.hasOwnProperty('slug');
}

function isTag(jsonData) {
    return jsonData.hasOwnProperty('name') && jsonData.hasOwnProperty('slug')
        && jsonData.hasOwnProperty('description') && jsonData.hasOwnProperty('parent_id');
}

module.exports.collections = db;
module.exports.checks = {
    isPost: isPost,
    isTag: isTag
};
