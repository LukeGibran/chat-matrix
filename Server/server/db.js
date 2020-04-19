var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dateStrings: true
});

module.exports = {
    connect: function () {
        var self = this;

        connection.connect(function (error) {
            if (error) {
                console.error('Error MySQL connect: ', error.message);
                return;
            }
            console.log('MySQL connection success');
            // self.deleteInactiveUsers(); ver lo comente yo
        });
    },

    getConnection: function () {
        return connection;
    },

    userExists: function (id, username, callback) {
        var sql = 'SELECT 1 FROM ?? WHERE ?? = ? AND ?? = ?';
        var inserts = ['user', 'instagram_id', id, 'instagram_username', username];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (error, results) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, results && results.length > 0);
            }
        });
    },

    saveUser: function (data, callback) {
        var sql = 'INSERT INTO ?? (??, ??, ??) VALUES(?, ?, ?)';
        var inserts = ['id', 'email', 'token', 'tokenSecret', data.profile.id, data.profile.emails[0].value, data.token, data.tokenSecret];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    updateUser: function (data, callback) {
        var sql = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?';
        var inserts = ['user',
            'instagram_follows', data.counts.follows,
            'instagram_followed_by', data.counts.followed_by,
            'instagram_username', data.username,
            'instagram_full_name', data.full_name,
            'instagram_profile_picture', data.profile_picture,
            'instagram_access_token', data.accessToken,
            'last_login', data.lastLogin,
            'instagram_id', data.id];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    updateUserPay: function (id, rate, lastDate, prevDate, authCount, callback) {
        var sql = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?';
        var inserts = ['user',
            'rate', rate,
            'last_pay_date', lastDate,
            'previous_pay_date', prevDate,
            'pay_auth_count', authCount,
            'instagram_id', id];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    resetUserPayAuthCount: function (id, callback) {
        var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
        var inserts = ['user', 'pay_auth_count', 0, 'instagram_id', id];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    userHasRegisteredStripeAccount: function (instagramId, callback) {
        var sql = 'SELECT 1 FROM ?? WHERE ?? = ?';
        var inserts = ['stripe',
            'instagram_id', instagramId];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (error, results) {
            if (error) {
                callback(error, null);
                return;
            }

            callback(null, results && results.length > 0);
        });
    },

    stripeConnectAccountExists: function (stripeId, instagramId, callback) {
        var sql = 'SELECT 1 FROM ?? WHERE ?? = ? AND ?? = ?';
        var inserts = ['stripe',
            'stripe_id', stripeId,
            'instagram_id', instagramId];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (error, results) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, results && results.length > 0);
            }
        });
    },

    saveStripeConnectAccount: function (instagramId, data, callback) {
        var sql = 'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES(?, ?, ?, ?, ?)';
        var inserts = ['stripe',
            'instagram_id', 'stripe_id', 'access_token', 'refresh_token', 'stripe_publishable_key',
            instagramId, data.stripe_user_id, data.access_token, data.refresh_token, data.stripe_publishable_key];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    updateStripeConnectAccount: function (instagramId, data, callback) {
        var sql = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ?';
        var inserts = ['stripe',
            'access_token', data.access_token,
            'refresh_token', data.refresh_token,
            'stripe_publishable_key', data.stripe_publishable_key,
            'instagram_id', instagramId,
            'stripe_id', data.stripe_user_id];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    savePayment: function (chargeId, stripeAccount, callback) {
        var sql = 'INSERT INTO ?? (??, ??) VALUES(?, ?)';
        var inserts = ['payment', 'charge_id', 'stripe_account',
            chargeId, stripeAccount];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    paymentExists: function (chargeId, stripeAccount, callback) {
        var sql = 'SELECT 1 FROM ?? WHERE ?? = ? AND ?? = ?';
        var inserts = ['payment',
            'charge_id', chargeId,
            'stripe_account', stripeAccount];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (error, results) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, results && results.length > 0);
            }
        });
    },

    deletePayment: function (chargeId, stripeAccount, callback) {
        var sql = 'DELETE FROM ?? WHERE ?? = ? AND ?? = ?';
        var inserts = ['payment',
            'charge_id', chargeId,
            'stripe_account', stripeAccount];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    deleteInactiveUsers: function () {
        /**
         * 
         * Select users who did not login in the past 30 days:
         * select instagram_id from user where last_login < NOW() - INTERVAL 15 DAY;
         * 
         * Select all data from user and stripe table with matching stripe_id where last_login is today:
         * select stripe_id, instagram_username from user left join stripe on user.instagram_id = stripe.instagram_id where user.last_login < now() - interval 0 day;
         * 
         * Delete all data from user and stripe table with matching stripe_id where last_login is today:
         * delete user, stripe from user left join stripe on user.instagram_id = stripe.instagram_id where user.last_login < now() - interval 0 day;
         * 
         */
        var sql = 'DELETE ??, ?? FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? < NOW() - INTERVAL 30 DAY';
        var inserts = ['user', 'stripe', 'user', 'stripe', 'user.instagram_id', 'stripe.instagram_id', 'user.last_login'];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (error) {
            if (error) {
                console.log(error);
            }
        });
    },

    getStipeAccountIdByInstagramId: function (instagramId, callback) {
        var sql = 'SELECT ?? FROM ?? WHERE ?? = ?';
        var inserts = ['stripe_id', 'stripe', 'instagram_id', instagramId];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    getUserByInstagramUsername: function (username, callback) {
        var sql = 'SELECT * FROM ?? WHERE ?? = ?';
        var inserts = ['user', 'instagram_username', username];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    },

    getUserByInstagramId: function (id, callback) {
        var sql = 'SELECT * FROM ?? WHERE ?? = ?';
        var inserts = ['user', 'instagram_id', id];
        sql = mysql.format(sql, inserts);

        connection.query(sql, callback);
    }
};