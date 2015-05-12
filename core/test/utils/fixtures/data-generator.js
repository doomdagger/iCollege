var _ = require('lodash'),
    uuid = require('node-uuid'),
    mongoose = require('mongoose'),
    globalUtils = require('../../../server/utils'),

    counterMap = {},

    DataGenerator = {};

/*jshint quotmark:false*/
// jscs:disable validateQuoteMarks, requireCamelCaseOrUpperCaseIdentifiers
DataGenerator.Content = {
    // Password = Sl1m3rson
    users: [
        {
            name: 'Joe Bloggs',
            slug: 'joe-bloggs',
            nickname: 'Little Joe',
            email: 'jbloggs@example.com',
            password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
        },
        {
            name: 'Smith Wellingsworth',
            slug: 'smith-wellingsworth',
            nickname: 'Little Smith',
            email: 'swellingsworth@example.com',
            password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
        },
        {
            name: 'Jimothy Bogendath',
            slug: 'jimothy-bogendath',
            nickname: 'Little Jimothy',
            email: 'jbOgendAth@example.com',
            password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
        },
        {
            name: 'Slimer McEctoplasm',
            slug: 'slimer-mcectoplasm',
            nickname: 'Little Slimer',
            email: 'smcectoplasm@example.com',
            password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
        },
        {
            name: 'Ivan Email',
            slug: 'ivan-email',
            nickname: 'Little Ivan',
            email: 'info@ghost.org',
            password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
        }
    ],

    permissions: [
        {
            name: 'Browse posts',
            action_type: 'browse',
            object_type: 'post'
        },
        {
            name: 'test',
            action_type: 'edit',
            object_type: 'post'
        },
        {
            name: 'test',
            action_type: 'edit',
            object_type: 'user'
        },
        {
            name: 'test',
            action_type: 'edit',
            object_type: 'page'
        },
        {
            name: 'test',
            action_type: 'add',
            object_type: 'post'
        },
        {
            name: 'test',
            action_type: 'add',
            object_type: 'user'
        },
        {
            name: 'test',
            action_type: 'add',
            object_type: 'page'
        },
        {
            name: 'test',
            action_type: 'destroy',
            object_type: 'post'
        },
        {
            name: 'test',
            action_type: 'destroy',
            object_type: 'user'
        }
    ],

    roles: [
        {
            name: "SuperAdministrator",
            description: "Super Administrator who is in charge of everything"
        },
        {
            name: "Administrator",
            description: "Administrator who is assigned by Super Administrator"
        },
        {
            name: "iColleger",
            description: "Normal User of iCollege"
        }
    ]
};

DataGenerator.forDB = (function () {
    var roles,
        users,
        clients,
        roles_users;

    function createBasic(overrides) {
        return _.defaults(overrides, {
            uuid: uuid.v4(),
            created_by: mongoose.Types.ObjectId('000000000000000000000000'),
            created_at: new Date(),
            updated_by: mongoose.Types.ObjectId('000000000000000000000000'),
            updated_at: new Date()
        });
    }

    function createUser(overrides) {
        return _.defaults(overrides, {
            uuid: uuid.v4(),
            status: 'offline',
            created_by: mongoose.Types.ObjectId('000000000000000000000000'),
            created_at: new Date(),
            updated_by: mongoose.Types.ObjectId('000000000000000000000000'),
            updated_at: new Date()
        });
    }

    function createGenericUser(uniqueInteger) {
        return createUser({
            name: 'Joe Bloggs',
            slug: 'joe-blogs',
            nickname: "Little Joe",
            email: 'joe_' + uniqueInteger + '@example.com',
            password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
        });
    }

    function createToken(overrides) {
        return _.defaults(overrides, {
            token: uuid.v4(),
            client_id: mongoose.Types.ObjectId('000000000000000000000000'),
            expires: Date.now() + globalUtils.ONE_DAY_MS
        });
    }

    roles_users = [
        mongoose.Types.ObjectId('000000000000000000000000') + '',
        mongoose.Types.ObjectId('222222222222222222222222') + '',
        mongoose.Types.ObjectId('222222222222222222222222') + '',
        mongoose.Types.ObjectId('111111111111111111111111') + ''
    ];

    roles = [
        createBasic(DataGenerator.Content.roles[0]),
        createBasic(DataGenerator.Content.roles[1]),
        createBasic(DataGenerator.Content.roles[2])
    ];

    users = [
        createUser(_.extend({}, DataGenerator.Content.users[0], {roles: [roles_users[0]]})),
        createUser(_.extend({}, DataGenerator.Content.users[1], {roles: [roles_users[1]]})),
        createUser(_.extend({}, DataGenerator.Content.users[2], {roles: [roles_users[2]]})),
        createUser(_.extend({}, DataGenerator.Content.users[3], {roles: [roles_users[3]]}))
    ];

    clients = [
        createBasic({name: 'iCollege Admin', slug: 'icollege-admin', secret: 'not_available'})
    ];

    return {
        createUser: createUser,
        createGenericUser: createGenericUser,
        createBasic: createBasic,
        createRole: createBasic,
        createPermission: createBasic,
        createToken: createToken,

        roles: roles,
        users: users,
        roles_users: roles_users,
        clients: clients
    };
}());

DataGenerator.forModel = (function () {
    var users,
        roles;

    users = _.map(DataGenerator.Content.users, function (user) {
        user = _.pick(user, 'name', 'email', 'nickname');

        return _.defaults({
            password: 'Sl1m3rson'
        }, user);
    });

    roles = DataGenerator.Content.roles;

    return {
        users: users,
        roles: roles
    };
}());

DataGenerator.resetCounter = function () {
    counterMap = {};
};

// change param: counterMap to global scope
DataGenerator.next = function (obj) {
    var i,
        code,
        arr = [];
    if (!!counterMap[obj]) {
        // 如果已经超过了9，变成a
        if (++counterMap[obj] === 58) {
            counterMap[obj] = 97;
        }
        // 如果已经超过了f，变成0
        if (counterMap[obj] === 103) {
            counterMap[obj] = 48;
        }
        code = String.fromCharCode(counterMap[obj]);
    } else {
        code = '0';
        counterMap[obj] = code.charCodeAt(0);
    }
    for (i = 0; i < 24; i += 1) {
        arr.push(code);
    }
    return mongoose.Types.ObjectId(arr.join(''));
};


module.exports = DataGenerator;
