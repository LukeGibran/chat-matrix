$(function () {
    var VIPModel = require('./model/vip-model');

    var VIPDashboardView = require('./view/vip-dashboard-view');
    var RoomView = require('./view/room-view');

    var faceDetection = require('./utils/face-detection');
    var webRTCUtil = require('./utils/webRTC-util');

    faceDetection.init();

    var vipModel = new VIPModel();

    new VIPDashboardView(vipModel);
    new RoomView(vipModel);

    vipModel.loadVIPData();

    if (webRTCUtil.isSupported()) {
        $(window).resize(onWindowResize);
        onWindowResize();
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