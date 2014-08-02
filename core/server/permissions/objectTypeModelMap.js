module.exports = {
    'role':       require('../models/role').Role,
    'permission': require('../models/permission').Permission,

    'user':       require('../models/user').User,
    'app':        require('../models/app').App,
    'circle':     require('../models/circle').Circle,
    'group':      require('../models/group').Group,
    'message':    require('../models/message').Message,
    'notification':require('../models/notification').Notification,
    'post':       require('../models/post').Post,
    'repost':     require('../models/repost').Repost,
    'setting':    require('../models/settings').Setting
};
