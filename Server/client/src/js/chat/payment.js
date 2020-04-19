var eventSource = require('./event-source');
var request = require('./request');
var guest = require('./guest');

var _selectedUser;

var _payment_ = {
    init: function () {
        eventSource.on(eventSource.AUTHORIZE_PAYMENT, _onAuthPayment);
        eventSource.on(eventSource.SELECT_USER, _onSelectUser);
        eventSource.on(eventSource.NAME_SUBMITTED, _onNameSubmitted);
    }
};

////////////// EVENTS
function _onAuthPayment(data) {
    data = data || {
        vip_id: _selectedUser.userId,
        customer_id: guest.id,
        token: 'tok_visa',
        amount: 60
    };

    request.post('/s/stripe/auth_payment', data)
        .then(function (response) {
            if (response.success === true) {
                eventSource.emitter.emit(eventSource.AUTHORIZE_PAYMENT_DONE);
            }
            else {
                throw new Error('Stripe payment authorization failed');
            }
        })
        .catch(function (error) {
            console.warn(error);
        });
}

function _onSelectUser(user) {
    _selectedUser = user;
}

function _onNameSubmitted() {
    request.get('/s/stripe/checkout_details', { vip_id: _selectedUser.userId })
        .then(function (response) {
            if (response.error) {
                throw new Error(response.error);
            }

            eventSource.emitter.emit(eventSource.GOT_CHECKOUT_DETAILS, response);
        })
        .catch(function (error) {
            console.warn(error);
        });
}

module.exports = _payment_;