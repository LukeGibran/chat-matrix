var io = require('./io');
var utils = require('./utils');

var _modalManager_ = {
    modal: null,

    showTermsAndPrivacy: function (resolveCallback, rejectCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered modal-sm">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var body = $('<div class="modal-body text-center">');
            body.append('<p class="lead">Do you completely understand and completely agree with all of the content in the links <a href="/terms-of-use" target="_blank">here</a> and <a href="/privacy-policy" target="_blank">here</a>?</p>');
            content.append(body);

            var footer = $('<div class="modal-footer text-center">');
            content.append(footer);

            var yesBtn = $('<button class="btn btn-lg btn-success ml-auto">').html('Yes');
            footer.append(yesBtn);
            yesBtn.on('click', resolveCallback);

            var cancelBtn = $('<button class="btn btn-lg btn-danger mr-auto">').html('No');
            footer.append(cancelBtn);
            cancelBtn.on('click', rejectCallback);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });

            this.modal = modal;
        }.bind(this));
    },

    showUserMediaConfirmation: function (resolveCallback, rejectCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var header = $('<div class="modal-header">');
            content.append(header);
            header.append('<p class="lead modal-title"><strong>This is how other people will see you.</strong></p>');

            var closeBtn = $('<button type="button" class="close"><span>&times;</span></button>');
            header.append(closeBtn);
            closeBtn.on('click', rejectCallback);

            var body = $('<div class="modal-body">');
            content.append(body);

            var btns = $('<div class="d-flex justify-content-center mb-3">');
            body.append(btns);

            var continueBtn = $('<button type="button" class="btn btn-primary mr-3">').html('Continue');
            btns.append(continueBtn);
            continueBtn.on('click', resolveCallback);

            var cancelBtn = $('<button type="button" class="btn btn-danger mr-3">').html('Cancel');
            btns.append(cancelBtn);
            cancelBtn.on('click', rejectCallback);

            var div = $('<div class="position-relative w-100 bg-dark" style="padding-top:75%;">');
            body.append(div);

            var canvas = $('<canvas width=480 height=360 class="position-absolute w-100 h-100" style="top:0;">');
            div.append(canvas);

            var errorMsg = $('<div class="position-absolute align-items-center justify-content-center text-danger text-center w-100 h-100" style="top:0; background-color:rgba(0, 0, 0, 0.75); display:none">');
            errorMsg.append('<h4>Face not detected</h4>');
            div.append(errorMsg);

            var msg = $('<p class="mb-0 mt-2 text-justify">').html('Please use headphones. If you cannot hear noise from you device right now when you speak, this means your microphone is currently inactive, and nobody will be able to hear you during a video call.');
            body.append(msg);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });

            this.modal = modal;
        }.bind(this));
    },

    showMessage: function (message, isBusy) {
        isBusy = (isBusy === undefined || isBusy === null) ? true : isBusy;

        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var body = $('<div class="modal-body text-center text-dark p-4">');
            content.append(body);

            var h5 = $('<h5 class="mb-0">').html(message);
            body.append(h5);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(isBusy);

            this.modal = modal;
        }.bind(this));
    },

    showRequestSent: function (callback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var header = $('<div class="modal-header">');
            content.append(header);
            header.append('<p class="lead modal-title"><strong>Video Call request sent. Waiting for a response.</strong></p>');

            var closeBtn = $('<button type="button" class="close"><span>&times;</span></button>');
            header.append(closeBtn);
            closeBtn.on('click', callback);

            var body = $('<div class="modal-body">');
            content.append(body);

            var btnDiv = $('<div class="d-flex justify-content-center mb-3">');
            body.append(btnDiv);

            var cancelBtn = $('<button type="button" class="btn btn-danger">').html('Cancel Request');
            btnDiv.append(cancelBtn);
            cancelBtn.on('click', callback);

            var img = $('<img class="img-fluid w-100" src="/images/box.jpg" alt="">');
            body.append(img);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(true);

            this.modal = modal;
        }.bind(this));
    },

    showRequestReceived: function (resolveCallback, rejectCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var header = $('<div class="modal-header">');
            content.append(header);
            header.append('<p class="lead modal-title"><strong>The person below is requesting a Video Call with you.</strong></p>');

            var closeBtn = $('<button type="button" class="close"><span>&times;</span></button>');
            header.append(closeBtn);
            closeBtn.on('click', rejectCallback);

            var body = $('<div class="modal-body">');
            content.append(body);

            var btnDiv = $('<div class="d-flex justify-content-center mb-3">');
            body.append(btnDiv);

            var acceptBtn = $('<button type="button" class="btn btn-primary mr-3">').html('Accept');
            btnDiv.append(acceptBtn);
            acceptBtn.on('click', resolveCallback);

            var denyBtn = $('<button type="button" class="btn btn-danger">').html('Deny');
            btnDiv.append(denyBtn);
            denyBtn.on('click', rejectCallback);

            var img = $('<img class="img-fluid w-100" src="/images/box.jpg" alt="">');
            body.append(img);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(true);

            this.modal = modal;
        }.bind(this));
    },

    showConfirmVIPCall: function (resolveCallback, rejectCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var header = $('<div class="modal-header">');
            content.append(header);
            header.append('<p class="lead modal-title"><strong>VIP Video Greeting</strong></p>');

            var closeBtn = $('<button type="button" class="close"><span>&times;</span></button>');
            header.append(closeBtn);
            closeBtn.on('click', rejectCallback);

            var body = $('<div class="modal-body text-center">');
            content.append(body);

            body.append('<p class="mb-2">You are requesting a very quick greeting (via a live 1-to-1 video call) with the following VIP (Instagram account holder):</p>');

            body.append('<p><a id="instagramLink" href="#" target="_blank"><strong id="instagramLinkText"></strong></a></p>');

            body.append('<p class="mb-2">Do you completely understand and completely agree with all of the content in the link <a href="/l/links/vip-video-call-terms-and-conditions" target="_blank">here</a>?</p>');

            var footer = $('<div class="modal-footer">');
            content.append(footer);

            var flex = $('<div class="d-flex justify-content-center w-100">');
            footer.append(flex);

            var yesBtn = $('<button type="button" class="btn btn-lg btn-success mr-3 ml-auto">').html('Yes');
            flex.append(yesBtn);
            yesBtn.on('click', resolveCallback);

            var noBtn = $('<button type="button" class="btn btn-lg btn-danger mr-auto">').html('No');
            flex.append(noBtn);
            noBtn.on('click', rejectCallback);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(true);

            this.modal = modal;
        }.bind(this));
    },

    showNameForm: function (message, submitCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered modal-sm">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var body = $('<div class="modal-body text-center">');
            content.append(body);

            body.append('<p class="lead">' + message + '</p>');

            var input = $('<input type="text" maxlength="15" class="font-weight-bold w-100" autofocus>');
            body.append(input);

            var footer = $('<div class="modal-footer text-center">');
            content.append(footer);

            var submitBtn = $('<button type="button" class="btn btn-primary mx-auto">').html('Submit');
            footer.append(submitBtn);

            submitBtn.on('click', function () {
                submitCallback(input.val());
            });

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(true);

            this.modal = modal;
        }.bind(this));
    },

    showCheckoutFrom: function (cardNumber, cardExpiry, cardCvc, amount, resolveCallback, rejectCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered modal-sm">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var header = $('<div class="modal-header">');
            content.append(header);
            header.append('<p class="lead modal-title"><strong>Pay with Card</strong></p>');

            var closeBtn = $('<button type="button" class="close"><span>&times;</span></button>');
            header.append(closeBtn);
            closeBtn.on('click', rejectCallback);

            var body = $('<div class="modal-body">');
            content.append(body);

            var form = $('<form>');
            body.append(form);

            var cardNumberGroup = $('<div class="input-group mb-3">');
            form.append(cardNumberGroup);

            var cardNumberGroupPrepend = $('<div class="input-group-prepend">');
            cardNumberGroup.append(cardNumberGroupPrepend);

            var cardNumberGroupText = $('<div class="input-group-text">');
            cardNumberGroupPrepend.append(cardNumberGroupText);

            var cardNumberOISpan = $('<span class="oi oi-credit-card" title="Card Number">');
            cardNumberGroupText.append(cardNumberOISpan);

            var cardNumberSpan = $('<span id="cardNumber" class="form-control">');
            cardNumberGroup.append(cardNumberSpan);

            var formRow = $('<div class="form-row mb-3">');
            form.append(formRow);

            var cardExpiryGroup = $('<div class="col-sm-6 input-group">');
            formRow.append(cardExpiryGroup);

            var cardExpiryGroupPrepend = $('<div class="input-group-prepend">');
            cardExpiryGroup.append(cardExpiryGroupPrepend);

            var cardExpiryGroupText = $('<div class="input-group-text">');
            cardExpiryGroupPrepend.append(cardExpiryGroupText);

            var cardExpiryOISpan = $('<span class="oi oi-calendar" title="Card Expiration">');
            cardExpiryGroupText.append(cardExpiryOISpan);

            var cardExpirySpan = $('<span id="cardExpiry" class="form-control">');
            cardExpiryGroup.append(cardExpirySpan);

            var cardCvcGroup = $('<div class="col-sm-6 input-group">');
            formRow.append(cardCvcGroup);

            var cardCvcGroupPrepend = $('<div class="input-group-prepend">');
            cardCvcGroup.append(cardCvcGroupPrepend);

            var cardCvcGroupText = $('<div class="input-group-text">');
            cardCvcGroupPrepend.append(cardCvcGroupText);

            var cardCvcOISpan = $('<span class="oi oi-lock-locked pr-1" title="CVC">');
            cardCvcGroupText.append(cardCvcOISpan);

            var cardCvcSpan = $('<span id="cardCvc" class="form-control">');
            cardCvcGroup.append(cardCvcSpan);

            var submitBtn = $('<button class="btn btn-primary font-weight-bold col-sm-12 mt-3">').html('Pay $' + (amount / 100).toFixed(2));
            body.append(submitBtn);
            submitBtn.on('click', resolveCallback);

            cardNumber.mount(cardNumberSpan.get(0));
            cardExpiry.mount(cardExpirySpan.get(0));
            cardCvc.mount(cardCvcSpan.get(0));

            if (!utils.isMobile()) {
                cardNumber.on('ready', function () {
                    cardNumber.focus();
                });
            }

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(true);

            this.modal = modal;
        }.bind(this));
    },

    showVIPDisconnected: function (message, resolveCallback) {
        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered modal-sm">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var header = $('<div class="modal-header">');
            content.append(header);
            header.append('<p class="lead modal-title"><strong>VIP Call</strong></p>');

            var closeBtn = $('<button type="button" class="close"><span>&times;</span></button>');
            header.append(closeBtn);
            closeBtn.on('click', resolveCallback);

            var body = $('<div class="modal-body text-center">');
            content.append(body);

            body.append('<p class="lead mt-3">' + message + '</p>');

            var footer = $('<div class="modal-footer text-center">');
            content.append(footer);

            var okBtn = $('<button type="button" class="btn btn-primary mx-auto">').html('Okay');
            footer.append(okBtn);
            okBtn.on('click', resolveCallback);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(true);

            this.modal = modal;
        }.bind(this));
    },

    /**
     * 
     * @param {string} message 
     * @param {Function} resolveCallback 
     * @param {Function} rejectCallback 
     * @param {boolean} isBusy 
     */
    showDialog: function (message, resolveCallback, rejectCallback, isBusy) {
        isBusy = (isBusy === undefined || isBusy === null) ? true : isBusy;

        return new Promise(function (resolve, reject) {
            if (this.modal) {
                reject(new Error('Can\'t show a new modal because a modal is still open'));
                return;
            }

            var root = $('#root');

            var modal = $('<div class="modal fade">');
            root.append(modal);

            var dialog = $('<div class="modal-dialog modal-dialog-centered modal-sm">');
            modal.append(dialog);

            var content = $('<div class="modal-content">');
            dialog.append(content);

            var body = $('<div class="modal-body text-center">');
            content.append(body);

            body.append('<p class="lead mt-3">' + message + '</p>');

            var footer = $('<div class="modal-footer text-center">');
            content.append(footer);

            var yesBtn = $('<button type="button" class="btn btn-lg btn-success ml-auto">').html('Yes');
            footer.append(yesBtn);
            yesBtn.on('click', resolveCallback);

            var noBtn = $('<button type="button" class="btn btn-lg btn-danger mr-auto">').html('No');
            footer.append(noBtn);
            noBtn.on('click', rejectCallback);

            modal.modal({ backdrop: 'static', keyboard: false, focus: true });
            modal.one('shown.bs.modal', function () {
                resolve();
            });
            io.updateBusy(isBusy);

            this.modal = modal;
        }.bind(this));
    },

    /**
     * @param isBusy {boolean}
     */
    close: function (isBusy) {
        isBusy = (isBusy === undefined || isBusy === null) ? false : isBusy;

        return new Promise(function (resolve, reject) {
            if (!this.modal) {
                reject(new Error('No modal to close'));
                return;
            }

            var modal = this.modal;
            this.modal = null;

            var buttons = modal.find('button');

            for (var i = 0, len = buttons.length; i < len; i++) {
                $(buttons[i]).off();
            }

            modal.one('hidden.bs.modal', function () {
                modal.modal('dispose');
                modal.remove();
                resolve();
            });

            io.updateBusy(isBusy);
            modal.modal('hide');
        }.bind(this));
    },

    findInModal: function (selector) {
        if (this.modal) {
            return this.modal.find(selector);
        }

        return null;
    }
};

module.exports = _modalManager_;