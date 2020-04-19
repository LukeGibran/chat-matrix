var eventSource = require('./event-source');
var modalMngr = require('./modal-manager');
var gridView = require('./views/grid-view');
var videoCallView = require('./views/video-call-view');
var queueView = require('./views/queue-view');
var userMedia = require('./user-media');
var faceFinder = require('./face-finder');
var utils = require('./utils');
var io = require('./io');
var guest = require('./guest');

var _isDev = false;//(window.location.hostname === 'localhost');
var _selectedUser;
var _cachedName;

var _viewManger_ = {
    init: function () {
        gridView.add(guest.id, guest.ip);

        eventSource.on(eventSource.TERMS_AND_PRIVACY_LOADED, _onTermsAndPrivacyLoaded);
        eventSource.on(eventSource.USERS_UPDATED, _onUsersUpdated);

        eventSource.on(eventSource.SELECT_USER, _onSelectUser);
        eventSource.on(eventSource.REPORT_USER, _onReportUser);
        eventSource.on(eventSource.CANCEL_REQUEST, _onCancelRequest);
        eventSource.on(eventSource.ACCEPT_REQUEST, _onAcceptRequest);
        eventSource.on(eventSource.DENY_REQUEST, _onDenyRequest);

        eventSource.on(eventSource.REQUEST_SENT, _onRequestSent);
        eventSource.on(eventSource.REQUEST_RECEIVED, _onRequestReceived);
        eventSource.on(eventSource.REQUEST_CANCELLED, _onRequestCancelled);
        eventSource.on(eventSource.REQUEST_DENIED, _onRequestDenied);
        eventSource.on(eventSource.REQUESTED_USER_DISCONNECTED, _onRequestedUserDisconnected);

        eventSource.on(eventSource.INITIALIZE_CHAT, _onInitChat);
        eventSource.on(eventSource.END_CALL, _onEndCall);
        eventSource.on(eventSource.PEER_ENDED_CALL, _onPeerEndedCall);
        eventSource.on(eventSource.PEER_DISCONNECTED, _onPeerDisconnected);

        eventSource.on(eventSource.GOT_CHECKOUT_DETAILS, _onGotCheckoutDetails);
    }
};

function handleExpiredTermsAndPrivacy() {
    modalMngr.showTermsAndPrivacy(
        function () {
            modalMngr.close();
            eventSource.emitter.emit(eventSource.TERMS_AND_PRIVACY_ACCEPTED);
        },
        function () {
            modalMngr.close();
            // eventSource.emitter.emit(eventSource.TERMS_AND_PRIVACY_REJECTED);
            location.href = '/';
        }
    );
}

function handleUserMediaConfirmation(stream) {
    modalMngr.showUserMediaConfirmation(resolve, reject)
        .then(function () {
            faceFinder.find(stream, modalMngr.findInModal('canvas').get(0));
        })
        .then(function () {
            return utils.isVideoReady(faceFinder.getVideoObject());
        });

    var errorDiv = modalMngr.findInModal('.text-danger');
    var timeout;

    function resolve() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        errorDiv.hide();
        var numDetections = 1;//faceFinder.numDetections;

        if (numDetections === 1) {
            var dataURL = faceFinder.capture();

            cleanup();
            eventSource.emitter.emit(eventSource.UPLOAD_AVATAR, dataURL);
        }
        else if (numDetections > 1) {
            errorDiv.css({ 'display': 'flex' });
            errorDiv.find('h4').html('Only one person can be in the camera view.');

            timeout = setTimeout(function () {
                timeout = null;
                errorDiv.hide();
            }, 2000);
        }
        else if (numDetections === 0) {// no face detected
            reject();
        }
    }

    function reject() {
        cleanup();
        userMedia.dispose();
        eventSource.emitter.emit(eventSource.USER_MEDIA_NOT_ALLOWED);
    }

    function cleanup() {
        if (timeout) {
            clearTimeout(timeout);
        }

        faceFinder.stop();
        modalMngr.close();
    }
}

function handleConfirmVIPCall(vip) {
    /////////////////////////////////
    if (_isDev) {
        io.updateBusy(true);
        eventSource.once(eventSource.QUEUE_JOINED, _onQueueJoined);
        eventSource.once(eventSource.LEAVE_QUEUE, _onLeaveQueue);
        eventSource.once(eventSource.VIP_CALLS_DISCONTINUED, _onVipCallsDiscontinued);
        eventSource.once(eventSource.REMOTE_VIDEO_READY, _onRemoteVideoReady);
        eventSource.once(eventSource.VIP_CALL_ENDED, _onVipCallEnded);
        eventSource.emitter.emit(eventSource.AUTHORIZE_PAYMENT);
        return;
    }
    /////////////////////////////////

    modalMngr.showConfirmVIPCall(
        function () {
            modalMngr.close()
                .then(function () {
                    return modalMngr.showNameForm('Please enter your name below. This will be passed onto ' + vip.fullname + '. Your name is temporarily stored by The Chat Matrix.', submit);
                })
                .then(function () {
                    var input = modalMngr.findInModal('input');

                    if (_cachedName) {
                        input.val(_cachedName);
                    }

                    if (!utils.isMobile()) {
                        input.focus();
                    }

                    input.keypress(function (event) {
                        if (event.which === 13) {
                            submit(input.val());
                        }
                    });
                });
        },
        function () {
            modalMngr.close();
        }
    );

    function submit(value) {
        if (value.length > 0) {
            var input = modalMngr.findInModal('input');
            input.blur();
            input.off();
            modalMngr.close();

            if (!_cachedName) {
                _cachedName = value;
            }

            io.submitName(value);
        }
    }
}

////////////// EVENTS
function _onTermsAndPrivacyLoaded(data) {
    if (data.expired) {
        handleExpiredTermsAndPrivacy();
    }
    else {
        eventSource.off(eventSource.TERMS_AND_PRIVACY_LOADED, _onTermsAndPrivacyLoaded);

        ////// DEV
        if (_isDev) {
            guest.userMediaAllowed = true;
            eventSource.emitter.emit(eventSource.AVATAR_UPLOADED);
            return;
        }
        ////// END DEV

        var timeout;
        if (utils.isMobile()) {
            timeout = setTimeout(function () {
                window.location.reload();
            }, 10000);
        }

        modalMngr.showMessage('Please allow Camera and Microphone access and please use headphones to prevent echoing.')
            .then(function () {
                return userMedia.get();
            })
            .then(function (stream) {
                modalMngr.close()
                    .then(function () {
                        handleUserMediaConfirmation(stream);
                    })
                    .catch(function (error) {
                        console.warn(error);
                    });

                eventSource.emitter.emit(eventSource.USER_MEDIA_ALLOWED);
            })
            .catch(function () {
                modalMngr.close();
                eventSource.emitter.emit(eventSource.USER_MEDIA_NOT_ALLOWED);
            })
            .finally(function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
            });
    }
}

function _onUsersUpdated() {
    io.getUsers();
}

function _onSelectUser(user) {
    _selectedUser = user;

    if (user.isVip) {
        handleConfirmVIPCall(_selectedUser);
    }
    else {
        io.sendRequest(_selectedUser);
    }
}

function _onReportUser(user) {
    io.reportUser(user);
}

function _onCancelRequest() {
    io.cancelRequest();
}

function _onAcceptRequest() {
    io.acceptRequest();
}

function _onDenyRequest() {
    io.denyRequest();
}

function _onRequestSent(user) {
    modalMngr.showRequestSent(function () {
        modalMngr.close();
        eventSource.emitter.emit(eventSource.CANCEL_REQUEST);
    });

    utils.loadAvatar(modalMngr.findInModal('img'), user);
}

function _onRequestReceived(user) {
    modalMngr.showRequestReceived(
        function () {
            modalMngr.close();
            eventSource.emitter.emit(eventSource.ACCEPT_REQUEST);
        },
        function () {
            modalMngr.close();
            eventSource.emitter.emit(eventSource.DENY_REQUEST);
        }
    );

    utils.loadAvatar(modalMngr.findInModal('img'), user);
}

function _onRequestCancelled() {
    modalMngr.close();
}

function _onRequestDenied() {
    modalMngr.close(true)
        .then(function () {
            return modalMngr.showMessage('No response');
        })
        .then(function () {
            setTimeout(function () {
                modalMngr.close();
            }, 2000);
        });
}

function _onRequestedUserDisconnected() {
    modalMngr.close(true)
        .then(function () {
            return modalMngr.showMessage('No response');
        })
        .then(function () {
            setTimeout(function () {
                modalMngr.close();
            }, 2000);
        });
}

function _onInitChat(vip, customer, caller, callee) {
    if (vip) {
        console.log('VIP call initialized');
        queueView.remove();
    }
    else {
        // user.isCaller is not yet updated when this listener is called so must use this to check if this user is the caler
        // this listener is called first before user module's listener is called
        if (guest.id === caller.userId) {
            modalMngr.close();
        }

        gridView.remove();
    }

    videoCallView.add(guest.id, vip, customer, caller, callee);

    userMedia.get()
        .then(function () {
            io.initUserMedia();
        })
        .catch(function (error) {
            console.warn(error);
        });
}

function _onEndCall() {
    videoCallView.remove();
    gridView.add(guest.id, guest.ip);
    io.getUsers();
}

function _onPeerEndedCall() {
    videoCallView.remove();
    gridView.add(guest.id, guest.ip);
    io.getUsers();

    modalMngr.showMessage('Your partner has gone')
        .then(function () {
            setTimeout(function () {
                modalMngr.close();
            }, 2000);
        });
}

function _onPeerDisconnected(aUser) {
    videoCallView.remove();
    gridView.add(guest.id, guest.ip);
    io.getUsers();

    if (aUser.isVip) {
        console.log('show VIP disconnected modal');
    }
    else {
        modalMngr.showMessage('Your partner has gone')
            .then(function () {
                setTimeout(function () {
                    modalMngr.close();
                }, 2000);
            });
    }
}

function _onGotCheckoutDetails(response) {
    var stripe = Stripe(response.key);
    var elements = stripe.elements();
    var cardNumber = elements.create('cardNumber', { 'placeholder': 'Card Number' });
    var cardExpiry = elements.create('cardExpiry', { 'placeholder': 'MM/YY' });
    var cardCvc = elements.create('cardCvc', { 'placeholder': 'CVC' });
    var amount = response.amount;
    var isTokenOk = false;

    modalMngr.showCheckoutFrom(cardNumber, cardExpiry, cardCvc, amount, pay, cancel)
        .then(function () {
            modalMngr.findInModal('form').on('submit', function (event) {
                event.preventDefault();
                pay();
            });
        });

    function pay() {
        if (isTokenOk) {
            return;
        }

        modalMngr.findInModal('.btn-primary').addClass('disabled');

        stripe.createToken(cardNumber, { currency: response.currency })
            .then(function (result) {
                if (result.token) {
                    isTokenOk = true;
                    var data = {
                        vip_id: _selectedUser.userId,
                        customer_id: guest.id,
                        token: result.token.id,
                        amount: amount
                    };

                    cleanup();
                    eventSource.once(eventSource.QUEUE_JOINED, _onQueueJoined);
                    eventSource.once(eventSource.LEAVE_QUEUE, _onLeaveQueue);
                    eventSource.once(eventSource.VIP_CALLS_DISCONTINUED, _onVipCallsDiscontinued);
                    eventSource.once(eventSource.REMOTE_VIDEO_READY, _onRemoteVideoReady);
                    eventSource.once(eventSource.VIP_CALL_ENDED, _onVipCallEnded);
                    eventSource.emitter.emit(eventSource.AUTHORIZE_PAYMENT, data);
                }
                else {
                    throw new Error('Error in creating Stripe token');
                }
            })
            .catch(function (error) {
                console.warn(error);
                modalMngr.findInModal('.btn-primary').removeClass('disabled');
            });
    }

    function cancel() {
        cleanup();
        modalMngr.close();
    }

    function cleanup() {
        modalMngr.findInModal('form').off();
        cardNumber.unmount(modalMngr.findInModal('#cardNumber').get(0));
        cardExpiry.unmount(modalMngr.findInModal('#cardExpiry').get(0));
        cardCvc.unmount(modalMngr.findInModal('#cardCvc').get(0));

        var stripeIFrames = $('iframe');

        for (var i = 0, len = stripeIFrames.length; i < len; i++) {
            $(stripeIFrames[i]).remove();
        }
    }
}

function _onQueueJoined(users, vip) {
    modalMngr.close(true)
        .catch(function (error) {
            console.warn(error);
        });

    gridView.remove();
    queueView.add(guest.id, users, vip);
}

function _onLeaveQueue() {
    eventSource.off(eventSource.VIP_CALLS_DISCONTINUED, _onVipCallsDiscontinued);

    queueView.remove();
    io.leaveQueue();
    io.updateBusy(false);
    gridView.add(guest.id, guest.ip);
    io.getUsers();
}

function _onVipCallsDiscontinued() {
    eventSource.off(eventSource.LEAVE_QUEUE, _onLeaveQueue);

    queueView.remove();
    gridView.add(guest.id, guest.ip);
    io.getUsers();
}

function _onRemoteVideoReady() {
    io.remoteVideoReady();
}

function _onVipCallEnded(vip) {
    videoCallView.remove();
    gridView.add(guest.id, guest.ip);
    io.getUsers();

    modalMngr.showDialog('Do you want another video greeting with ' + vip.fullname + '?',
        function () {
            modalMngr.close()
                .then(function () {
                    _onSelectUser(vip);
                });
        },
        function () {
            modalMngr.close();
        }
    );
}

module.exports = _viewManger_;