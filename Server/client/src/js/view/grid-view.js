var faceDetection = require('../utils/face-detection');
var Camvas = require('../utils/camvas');

var grid = require('../view/components/grid');
var avatarUtils = require('../utils/avatar-utils');
var webRTCUtil = require('../utils/webRTC-util');
var activityMonitor = require('../utils/activity-monitor');
var avatarUtil = require('../utils/avatar-utils');

var GridView = function (model) {
    this._model = model;

    this._model.on('init', this._onInit.bind(this));
    this._model.on('users_loaded', this._onUsersLoaded.bind(this));
    this._model.on('select_vip', this._onSelectVip.bind(this));
    this._model.on('update_busy_status', this._onUpdateBusyStatus.bind(this));
    this._model.on('update_avatar', this._onUpdateAvatar.bind(this));

    this._model.on('chat_request_sent', this._onChatRequestSent.bind(this));
    this._model.on('chat_request_received', this._onChatRequestReceived.bind(this));
    this._model.on('chat_request_canceled', this._onChatRequestCanceled.bind(this));
    this._model.on('chat_request_denied', this._onChatRequestDenied.bind(this));
    this._model.on('chat_request_disconnected', this._onChatRequestDisconnected.bind(this));

    this._model.on('init_chat', this._onInitChat.bind(this));
    this._model.on('user_room_disconnected', this._onUserRoomDisconnected.bind(this));
    this._model.on('leave_room', this._onLeaveRoom.bind(this));
    this._model.on('vip_chat_ended', this._onVipChatEnded.bind(this));

    this._model.on('name_submitted', this._onNameSubmitted.bind(this));
    this._model.on('auth_stripe_payment_done', this._onAuthPaymentDone.bind(this));

    this._cellBoxPath = '../images/box.jpg';
    this._cellAvatarPath = '../images/avatar.jpg';
    this._faviconPath = '../favicon.png';
    this._faviconFlashPath = '../favicon_flash.png';

    this._isTabActive = true;
    this._pageTitle = document.title;
    this._blinkIntervalId = null;
    this._ringtone = new Howl({
        src: ['../sounds/ringtone.mp3', '../sounds/ringtone.webm'],
        loop: true
    });

    this._selectedVipUser = null;
    this._camvas = null;
    this._nameCache = null;

    this._stripeCardNumber = null;
    this._stripeCardExpiry = null;
    this._stripeCardCvc = null;

    this._isPollUsersInGrid = true;

    this._initFavicon();
    grid.init(this._model.userId, this);
    grid.styleNavbarFooter();
    grid.initCells();

    $(window).on('resize', this.onWindowResize.bind(this));
    $(window).on('focus', this.onWindowFocus.bind(this));
    $(window).on('blur', this.onWindowBlur.bind(this));
};

GridView.prototype = {
    select: function (user) {
        if (user.userId === this._model.userId) { return; }

        if (user.isVip) {
            activityMonitor.reset();
            this.showVIPChatConfirmModal(user);
        }
        else {
            this._model.sendChatRequest(user);
        }
    },

    report: function (user) {
        var self = this;

        this._model.updateBusy(true);
        this._showDialogModal('Report this user for bad behavior?',
            function () {
                activityMonitor.reset();
                self._model.reportUser(user);
            },
            function () {
                self._model.updateBusy(false);
            }
        );
    },

    hide: function () {
        $('#userGrid').addClass('d-none');
    },

    showInitialUsersInGrid: function () {
        var self = this;

        $.ajax({
            url: '/c/chat/users',
            type: 'GET',
            success: function (data) {
                var users = data.users;

                if (users) {
                    grid.update(users);
                }

                self.showTermsAndPrivacy();
                // self._pollUsersInGrid();
            },
            error: function () {
                self.showTermsAndPrivacy();
                // self._pollUsersInGrid();
            }
        });
    },

    showTermsAndPrivacy: function () {
        var self = this;
        var $modal = $('#termsPrivacyModal');

        function getPermission(callback) {
            $.ajax({
                url: '/p/permission',
                type: 'GET',
                data: {
                    data: 'terms_of_use_and_privacy_policy'
                },
                success: callback
            });
        }

        function postPermission(callback) {
            $.ajax({
                url: '/p/permission',
                type: 'POST',
                data: {
                    data: 'terms_of_use_and_privacy_policy'
                },
                success: callback
            });
        }

        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');

            // check permission if expired, again to make sure
            getPermission(function (response) {
                if (response.error) {
                    window.location.href = '/';
                }
                else {
                    if (response.expired) {// permission expired
                        postPermission(function (response) {
                            if (response.error) {
                                window.location.href = '/';
                            }
                            else {
                                self.showUserMediaConfirmation();
                            }
                        });
                    }
                    else {
                        self.showUserMediaConfirmation();
                    }
                }
            });
        });

        // check if permission expired
        getPermission(function (response) {
            if (response.error) {
                window.location.href = '/';
            }
            else {
                if (response.expired) {
                    $modal.modal({ backdrop: 'static', keyboard: false, focus: true });
                }
                else {
                    $modal.off('hide.bs.modal');
                    self.showUserMediaConfirmation();
                }
            }
        });
    },

    showUserMediaConfirmation: function () {
        var self = this;
        var chatMain = $('#chatMain');
        var $modal = $('#mediaConfirmModal');
        var $msgModal = $('#messageModal');
        var canvas = $modal.find('canvas').get(0);
        var timeout = null;
        var reloadTimeout = null;
        var isIOS = new MobileDetect(window.navigator.userAgent).os() === 'iOS';

        if (isIOS) {
            chatMain.addClass('d-none');
        }

        $modal.find('.btn-danger').attr('disabled', true);
        $modal.find('.btn-primary').attr('disabled', true);

        faceDetection.setCanvas(canvas);

        this._camvas = new Camvas(canvas, faceDetection.process,
            function () {
                if (reloadTimeout) {
                    clearTimeout(reloadTimeout);
                }

                $msgModal.modal('hide');
                $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

                webRTCUtil.waitForVideoReady(self._camvas.video, function () {
                    $modal.find('.btn-danger').attr('disabled', false);
                    $modal.find('.btn-primary').attr('disabled', false);

                    if (isIOS) {
                        chatMain.removeClass('d-none');
                    }
                });
            },
            function (error) {
                if (reloadTimeout) {
                    clearTimeout(reloadTimeout);
                }

                if (error.name === 'NotAllowedError') {
                    $msgModal.modal('hide');
                    self._userMediaBlocked();
                }
                else {
                    alert(error.name + ': ' + error.message);
                }
            },
            function () {
                $msgModal.find('h5').html('Please allow Camera and Microphone access and please use headphones to prevent echoing.');
                $msgModal.modal({ backdrop: 'static', keyboard: false, focus: true });

                var md = new MobileDetect(window.navigator.userAgent);

                if (md.mobile()) {
                    reloadTimeout = setTimeout(function () {
                        window.location.reload();
                    }, 10000);
                }
            }
        );

        // continue media
        var $btn = $modal.find('#continueBtn');
        $btn.on('click', function () {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            var numDetections = 1;
            var $message = $modal.find('#message');

            if (numDetections === 1) {
                $modal.find('.btn-danger').attr('disabled', true);
                $modal.find('.btn-primary').attr('disabled', true);

                var dataURL = self._camvas.capture();

                self._uploadAvatar(dataURL, self._model.username)
                    .then(function () {
                        $btn.off('click');
                        $modal.off('hide.bs.modal');
                        $modal.modal('hide');

                        $message.addClass('d-none');
                        $message.removeClass('d-flex');

                        self._isPollUsersInGrid = false;

                        self._model.initSocketConnection(true, self._model.username);
                    })
                    .catch(function () {
                        $modal.find('.btn-danger').attr('disabled', false);
                        $modal.find('.btn-primary').attr('disabled', false);
                        self._camvas.update();
                    });
            }
            else if (numDetections > 1) {
                $message.removeClass('d-none');
                $message.addClass('d-flex');
                $message.find('h4').html('Only one person can be in the camera view.');

                timeout = setTimeout(function () {
                    timeout = null;

                    $message.addClass('d-none');
                    $message.removeClass('d-flex');
                }, 2000);
            }
            else if (numDetections <= 0) {
                $btn.off('click');
                $modal.off('hide.bs.modal');
                $modal.modal('hide');

                $message.addClass('d-none');
                $message.removeClass('d-flex');

                self._userMediaBlocked();
            }
        });

        // cancel media
        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            $btn.off('click');
            self._camvas.stop();

            window.location.href = '/';
        });
    },

    showVIPChatConfirmModal: function (user) {
        this._selectedVipUser = user;

        if (this._model.isDev) {
            this._model.submitName("Guest Randy");
            return;
        }

        this._model.updateBusy(true);

        var self = this;
        var $modal = $('#userGrid').find('#vipChatConfirmModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        var instagramLink = 'instagram.com/' + user.username;

        var $instagramLink = $modal.find('#instagramLink');
        $instagramLink.attr('href', 'https://www.' + instagramLink);

        var $instagramLinkDisplay = $modal.find('#instagramLinkDisplay');
        $instagramLinkDisplay.html(instagramLink);

        // Yes button clicked
        var $btn = $modal.find('#yesBtn');
        $btn.on('click', function () {
            $btn.off('click');
            $modal.off('hide.bs.modal');
            $modal.modal('hide');
        });

        // No/close button clicked
        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            $modal.off('hidden.bs.modal');
            $btn.off('click');

            self._selectedVipUser = null;

            self._model.updateBusy(false);
        });

        // Modal is totally hidden
        $modal.on('hidden.bs.modal', function () {
            $modal.off('hidden.bs.modal');

            // Show another Modal after the first Modal is totally hidden to prevent a behavior that makes the next Modal not scrollable.
            self.showNameFormModal(user);
        });
    },

    showNameFormModal: function (vip) {
        var self = this;
        var $modal = $('#nameFormModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        var message = 'Please enter your name below. This will be passed onto ' + vip.fullname + '. Your name is temporarily stored by The Chat Matrix.';
        var $bodyText = $modal.find('#bodyText');
        $bodyText.html(message);

        var $inputName = $modal.find('#inputName');
        $inputName.keypress(function (event) {
            if (event.which === 13) {
                $inputName.blur();
                submit();
            }
        });

        $modal.on('shown.bs.modal', function () {
            $modal.off('shown.bs.modal');

            if (!webRTCUtil.isMobile()) {
                $inputName.focus();
            }

            if (self._nameCache) {
                $inputName.val(self._nameCache);
            }
        });

        var $btn = $modal.find('button');
        $btn.on('click', function () {
            submit();
        });

        function submit() {
            var inputVal = $inputName.val();
            if (inputVal.length > 0) {
                self._nameCache = inputVal;

                $btn.off('click');
                $btn.addClass('disabled');

                $inputName.unbind('keypress');
                $inputName.attr('disabled', true);

                activityMonitor.reset();
                self._model.submitName(inputVal);
            }
        }
    },

    loadCheckoutDetails: function () {
        $.ajax({
            url: '/s/stripe/checkout_details',
            type: 'GET',
            data: {
                vip_id: this._selectedVipUser.userId
            },
            success: this._createCheckoutForm.bind(this)
        });
    },

    showErrorModal: function (message, callback) {
        var self = this;

        this._model.updateBusy(true);

        var $modal = $('#userGrid').find('#errorModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });
        $modal.find('#errorMessage').html(message);

        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            self._model.updateBusy(false);

            if (callback) {
                callback();
            }
        });
    },

    showNotSupportedAlert: function () {
        var md = new MobileDetect(window.navigator.userAgent);
        var msg = (md.os() === 'iOS') ? 'Your current web browser is not supported. Please use the Safari web browser. If you are already using Safari, you may need to update your iOS software or use another device instead.' : 'Your current web browser is not supported. Please update your browser or use a different browser. You may need to use another device instead.';

        var $modal = $('#messageModal');

        $modal.find('h5').html(msg);
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });
    },

    _pollUsersInGrid: function () {
        // var self = this;

        $.ajax({
            url: '/c/chat/users',
            type: 'GET',
            success: function (data) {
                var users = data.users;

                if (users) {
                    grid.update(users);

                    // if (self._isPollUsersInGrid) {
                    //     setTimeout(function () {
                    //         self._pollUsersInGrid();
                    //     }, 2000);
                    // }
                }
            }
        });
    },

    _showDialogModal: function (message, yesCallback, hideCallback) {
        var modal = $('#dialogModal');
        modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        modal.find('.modal-body p').html(message);

        var yesBtn = modal.find('.btn-success');

        if (yesCallback) {
            yesBtn.on('click', function () {
                yesBtn.off('click');
                yesCallback();
            });
        }

        modal.on('hide.bs.modal', function () {
            modal.off('hide.bs.modal');

            if (yesCallback) {
                yesBtn.off('click');
            }

            if (hideCallback) {
                hideCallback();
            }
        });
    },

    _userMediaBlocked: function () {
        this._isPollUsersInGrid = false;
        this._model.initSocketConnection(false, null);
    },

    _uploadAvatar: function (dataURL, filename) {
        var self = this;
        var blob = avatarUtil.dataURLtoBlob(dataURL);
        var formData = new FormData();

        formData.append('profile', blob, filename);

        return new Promise(function (resolve, reject) {
            $.ajax({
                url: '/c/chat/profile',
                type: 'POST',
                processData: false,
                contentType: false,
                data: formData,
                success: function (data) {
                    if (data === 'success') {
                        self._camvas.stop();
                        resolve();
                    }
                    else {
                        reject(new Error('POST /c/chat/profile returned data is not "success"'));
                    }
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
    },

    _initFavicon: function () {
        var favicon = $('#favicon').get(0);

        if (favicon) {
            favicon.href = this._faviconPath;
        }
    },

    _createCheckoutForm: function (data) {
        if (data.error) {
            this.showErrorModal(data.error);
            return;
        }

        var self = this;
        var dataObj = JSON.parse(data);

        var amount = parseInt(dataObj.amount);
        var amountDollar = amount / 100;
        var submitLabel = 'Pay $' + amountDollar.toFixed(2);
        var cardData = {
            currency: dataObj.currency,
        };

        var stripe = Stripe(dataObj.key);
        var elements = stripe.elements();

        var $modal = $('#userGrid').find('#checkoutFormModal');

        this._stripeCardNumber = elements.create('cardNumber', { 'placeholder': 'Card Number' });

        if (!webRTCUtil.isMobile()) {
            this._stripeCardNumber.on('ready', function () {
                self._stripeCardNumber.focus();
            });
        }

        this._stripeCardNumber.mount($modal.find('#cardNumber').get(0));

        this._stripeCardExpiry = elements.create('cardExpiry', { 'placeholder': 'MM/YY' });
        this._stripeCardExpiry.mount($modal.find('#cardExpiry').get(0));

        this._stripeCardCvc = elements.create('cardCvc', { 'placeholder': 'CVC' });
        this._stripeCardCvc.mount($modal.find('#cardCvc').get(0));

        var $form = $modal.find('#checkoutForm');

        var $submitBtn = $modal.find('#submitBtn');
        $submitBtn.html(submitLabel);

        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            $submitBtn.html('Pay');
            $submitBtn.removeClass('disabled');
            self._model.updateBusy(false);
        });

        $submitBtn.on('click', function () {
            pay();
        });

        $form.on('submit', function (event) {
            event.preventDefault();
            self._stripeCardNumber.blur();
            self._stripeCardExpiry.blur();
            self._stripeCardCvc.blur();
            pay();
        });

        function pay() {
            $submitBtn.html('Processing...');
            $submitBtn.addClass('disabled');

            stripe.createToken(self._stripeCardNumber, cardData).then(function (result) {
                if (result.token) {
                    $submitBtn.off('click');
                    $form.off('submit');

                    var vip = self._selectedVipUser;
                    self._selectedVipUser = null;

                    var data = {
                        vip: vip,
                        token: result.token,
                        amount: amount
                    };

                    activityMonitor.reset();
                    self._model.authorizeStripePayment(data);
                }
                else {
                    $submitBtn.html(submitLabel);
                    $submitBtn.removeClass('disabled');
                }
            });
        }
    },

    _blinkTab: function () {
        var favicon = $('#favicon').get(0);
        var faviconIndex = 0;
        var message = 'NEW VIDEO CALL REQUEST';

        this._blinkIntervalId = setInterval(blink.bind(this), 1000);

        function blink() {
            favicon.href = faviconIndex === 0 ? this._faviconPath : this._faviconFlashPath;
            faviconIndex++;
            faviconIndex %= 2;

            document.title = faviconIndex === 0 ? message.toUpperCase() : message.toLowerCase();
        }
    },

    _stopBlinkTab: function () {
        if (!this._blinkIntervalId) { return; }

        clearInterval(this._blinkIntervalId);

        this._blinkIntervalId = null;
        document.title = this._pageTitle;
        $('#favicon').get(0).href = this._faviconPath;
    },

    _onInit: function () {
        grid.setIp(this._model.userIp);
    },

    _onUsersLoaded: function (users) {
        if (!$('#userGrid').hasClass('d-none')) {
            grid.update(users);
        }
    },

    _onUpdateBusyStatus: function (user) {
        grid.updateCellBusyStatus(user);
    },

    _onUpdateAvatar: function (userId) {
        grid.updateAvatar(userId);
    },

    _onSelectVip: function (userId) {
        grid.findAndSelect(userId);
    },

    _onInitChat: function () {
        var $grid = $('#userGrid');
        this.hide();

        var $modal = $grid.find('#chatRequestSentModal');
        $modal.off('hide.bs.modal');
        $modal.modal('hide');
    },

    _onUserRoomDisconnected: function (user) {
        var self = this;
        var $grid = $('#userGrid');
        var $modal = null;

        $grid.removeClass('d-none');
        this._model.updateBusy(true);

        if (user.isVip) {
            $modal = $grid.find('#vipDisconnectedModal');
            var name = user.fullname + ' (@' + user.username + ')';
            var message = 'Sorry, but ' + name + ' has discontinued doing video calls at this moment.';

            $modal.find('#bodyText').html(message);
            $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

            $modal.on('hide.bs.modal', function () {
                $modal.off('hide.bs.modal');
                self._model.updateBusy(false);
            });
        }
        else {
            $modal = $('#messageModal');

            $modal.find('h5').html('Your partner has gone');
            $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

            setTimeout(function () {
                $modal.modal('hide');

                if ($('#dialogModal').is(':visible')) {
                    self._model.updateBusy(true);

                    $('#dialogModal').on('hide.bs.modal', function () {
                        $('#dialogModal').off('hide.bs.modal');
                        self._model.updateBusy(false);
                    });
                    return;
                }

                self._model.updateBusy(false);
            }, 2000);
        }
    },

    _onLeaveRoom: function (hasLeft) {
        $('#userGrid').removeClass('d-none');

        if (!hasLeft) {
            var self = this;
            var $modal = $('#messageModal');

            $modal.find('h5').html('Your partner has gone');
            $modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            this._model.updateBusy(true);

            setTimeout(function () {
                $modal.modal('hide');

                if ($('#dialogModal').is(':visible')) {
                    self._model.updateBusy(true);

                    $('#dialogModal').on('hide.bs.modal', function () {
                        $('#dialogModal').off('hide.bs.modal');
                        self._model.updateBusy(false);
                    });
                    return;
                }

                self._model.updateBusy(false);
            }, 2000);
        }
        else {
            this._model.updateBusy(false);
        }
    },

    _onVipChatEnded: function (vip) {
        if (this._model.isUserVip) { return; }

        this._model.updateBusy(true);
        $('#userGrid').removeClass('d-none');

        var self = this;
        var $modal = $('#userGrid').find('#vipChatAgainModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        var message = 'Do you want another video greeting with ' + vip.fullname + '?';
        var $bodyText = $modal.find('#bodyText');
        $bodyText.html(message);

        // Yes button clicked
        var $btn = $modal.find('#yesBtn');
        $btn.on('click', function () {
            $modal.modal('hide');
            self._onSelectVip(vip.userId);
        });

        // No/close button clicked
        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            $btn.off('click');

            self._model.updateBusy(false);
        });
    },

    _onChatRequestSent: function (user) {
        this._model.updateBusy(true);

        var self = this;
        var $modal = $('#userGrid').find('#chatRequestSentModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        // display user profile pic
        avatarUtils.loadAvatar(user, $modal.find('#profileImg'));

        // cancel request
        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');

            self._model.updateBusy(false);
            self._model.cancelChatRequest();
        });
    },

    _onChatRequestReceived: function (user) {
        this._model.updateBusy(true);

        var self = this;
        var $modal = $('#userGrid').find('#chatRequestModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        // display user profile pic
        avatarUtils.loadAvatar(user, $modal.find('#profileImg'));

        // deny request
        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            $btn.off('click');

            self._ringtone.stop();
            self._model.updateBusy(false);
            self._model.denyChatRequest();
        });

        // accept request
        var $btn = $modal.find('#acceptBtn');
        $btn.on('click', function () {
            $btn.off('click');
            $modal.off('hide.bs.modal');
            $modal.modal('hide');

            self._ringtone.stop();
            self._model.acceptChatRequest();
        });

        this._ringtone.play();

        if (!this._isTabActive) {
            this._blinkTab();
        }
    },

    _onChatRequestCanceled: function () {
        var $modal = $('#userGrid').find('#chatRequestModal');
        $modal.off('hide.bs.modal');
        $modal.find('#acceptBtn').off('click');
        $modal.modal('hide');

        this._ringtone.stop();
        this._stopBlinkTab();
        this._model.updateBusy(false);
    },

    _onChatRequestDenied: function () {
        var self = this;
        var $modal = $('#userGrid').find('#chatRequestSentModal');

        $modal.off('hide.bs.modal');
        $modal.modal('hide');

        $modal = $('#messageModal');

        $modal.find('h5').html('No response');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        setTimeout(function () {
            $modal.modal('hide');
            self._model.updateBusy(false);
        }, 2000);
    },

    _onChatRequestDisconnected: function () {
        var self = this;
        var $modal = null;
        $modal = $('#userGrid').find('#chatRequestSentModal');

        $modal.off('hide.bs.modal');
        $modal.modal('hide');

        $modal = $('#userGrid').find('#chatRequestModal');
        $modal.off('hide.bs.modal');
        $modal.find('#acceptBtn').off('click');
        $modal.modal('hide');


        $modal = $('#messageModal');
        $modal.find('h5').html('No response');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        this._ringtone.stop();

        setTimeout(function () {
            $modal.modal('hide');
            self._model.updateBusy(false);
        }, 2000);
    },

    _onNameSubmitted: function () {
        if (this._model.isDev) {
            $.ajax({
                url: '/s/stripe/auth_payment',
                type: 'POST',
                data: {
                    vip_id: this._selectedVipUser.userId,
                    customer_id: this._model.userId,
                    token: 'tok_visa',
                    amount: 60
                },
                success: function (response) {
                    if (response.error) {
                        alert(response.error);
                    }
                }
            });
            return;
        }

        var self = this;

        var $modal = $('#nameFormModal');
        $modal.modal('hide');
        $modal.find('button').removeClass('disabled');
        $modal.find('#inputName').attr('disabled', false);
        $modal.find('#inputName').val('');

        $modal.on('hidden.bs.modal', function () {
            $modal.off('hidden.bs.modal');

            // Show another Modal after the first Modal is totally hidden to prevent a behavior that makes the next Modal not scrollable.
            self.loadCheckoutDetails();
        });
    },

    _onAuthPaymentDone: function (data) {
        var $modal = $('#userGrid').find('#checkoutFormModal');

        this._stripeCardNumber.unmount($modal.find('#cardNumber').get(0));
        this._stripeCardExpiry.unmount($modal.find('#cardExpiry').get(0));
        this._stripeCardCvc.unmount($modal.find('#cardCvc').get(0));

        $modal.off('hide.bs.modal');
        $modal.modal('hide');

        var $submitBtn = $modal.find('#submitBtn');
        $submitBtn.html('Pay');
        $submitBtn.removeClass('disabled');

        if (data.error) {
            this.showErrorModal(data.error);
        }
    },

    onWindowResize: function () {
        if ($('#chatMain').hasClass('d-none')) { return; }

        if (!$('#userGrid').hasClass('d-none')) {
            grid.layout();
        }

        if (!$('#queue').hasClass('d-none')) {
            grid.styleNavbarFooter();
        }
    },

    onWindowFocus: function () {
        this._isTabActive = true;

        this._stopBlinkTab();
    },

    onWindowBlur: function () {
        this._isTabActive = false;
    }
};

module.exports = GridView;