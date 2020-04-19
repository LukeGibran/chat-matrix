$(function () {
    var User = require('./model/user');
    var VIPView = require('./view/vip-view');

    var username = window.location.pathname.split('/')[1];
    var user = new User(false);
    var vipUser = null;
    var view = new VIPView();

    var isChat = false;

    user.on('init', function () {
        user.updateBusy(true);
        user.checkVIPStatus(username);
    });

    user.on('vip_status', function (status, user) {
        vipUser = user;

        if (status) {
            view.online(vipUser);
        }
        else {
            view.offline();
        }

        if (isChat) {
            isChat = false;
            if (status) {
                window.location.href = '/c/chat?select_vip=' + vipUser.userId;
            }
        }
    });

    view.on('video_chat_with_vip', function () {
        if (!vipUser) { return; }

        isChat = true;
        user.checkVIPStatus(username);
    });

    user.initSocket(io(), false);
});