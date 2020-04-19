$(function () {
    // Module requires
    var ChatModel = require('./model/chat-model');

    var GridView = require('./view/grid-view');
    var RoomView = require('./view/room-view');
    var QueueView = require('./view/queue-view');

    var faceDetection = require('./utils/face-detection');
    var webRTCUtil = require('./utils/webRTC-util');

    // Initialize
    faceDetection.init();

    var chatModel = new ChatModel();

    var gridView = new GridView(chatModel);
    new RoomView(chatModel);
    new QueueView(chatModel);

    init();

    function init() {
        if (!webRTCUtil.isSupported()) {
            gridView.showNotSupportedAlert();
            return;
        }

        $(window).resize(onWindowResize);
        onWindowResize();

        if (chatModel.isDev) {
            chatModel.initSocketConnection(true, null);
        }
        else {
            gridView.showInitialUsersInGrid();
        }
    }

    function onWindowResize() {
        var md = new MobileDetect(window.navigator.userAgent);
        var alert = $('#orientationAlert');

        if (md.phone()) {
            var win = $(window);

            if (win.width() > win.height()) {
                alert.removeClass('d-none');
            }
            else {
                alert.addClass('d-none');
            }
        }
        else {
            alert.addClass('d-none');
        }
    }
});