/* eslint-disable  */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import busy from '../common/busy';
import utils from '../common/utils';
import axios from 'axios';

const stripe = window.Stripe;

const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    opacity: 0.5,
    zIndex: 1040
};

const modalRootStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1040
};

class CheckoutFormModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isProcessing: false,
            isStripeElementsReady: false,
            stripe: null,
            cardNumberError:'',
            cardCVCError: '',
            cardExpiryError: ''
        };

        this.cardNumber = React.createRef();
        this.cardExpiry = React.createRef();
        this.cardCVC = React.createRef();
        this.modalDialog = React.createRef();
        this.stripe = null;
        this.stripeCardNumber = null;
        this.stripeCardExpiry = null;
        this.stripeCardCVC = null;

        this._modalStyle = {
            position: 'absolute',
            width: '30rem',
            margin: 0,
            top: 0,
            left: 0,
            opacity: 0
        };
    }

    componentDidMount() {
        busy.update(true);
        this.handleEnter();
        this.calculateModalPosition();
    }

    componentWillUnmount() {
        busy.update(false);
        this.handleExit();
    }

    calculateModalPosition() {
        const modalDialog = this.modalDialog.current;
        const top = (modalDialog.offsetHeight > window.innerHeight ?
            0 : (window.innerHeight - modalDialog.offsetHeight) / 2);
        if (modalDialog) {
            this._modalStyle = {
                position: 'absolute',
                width: '20rem',
                margin: 'auto',
                top: top,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 1
            };

            this.forceUpdate();
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.cardNumber.trim() === ''){
            this.state.cardNumberError = 'is-invalid';
        }
        if (this.cardCVC.trim() === ''){
            this.state.cardCVCError = 'is-invalid';
        }
        if (this.cardExpiry.trim() === ''){
            this.state.cardExpiryError = 'is-invalid';
        }
        const { details, vip, userID } = this.props;
        
        this.setState({ isProcessing: true });
        this.stripe.createPaymentMethod('card', this.stripeCardNumber)
            .then(result => {
                if (result.error) {
                    console.log(result.error);
                    this.setState({ isProcessing: false });
                }
                else {
                    axios.post(`${utils.serverURL}/s/stripe/auth_payment`,
                        {
                            vip_id: vip.userId,
                            customer_id: userID,
                            payment_method_id: result.paymentMethod.id,
                            amount: details.amount
                        }
                    )
                        .then((result) => {
                            this.handleServerResponse(result.data);
                            busy.update(true);
                        }
                        );
                }
            });
    }

    handleServerResponse (response) {
        if (response.error) {
            // Show error from server
            console.log(response.error);
        }
        else if (response.requires_action) {
            // Use Stripe.js to handle required card action
            this.handleAction(response);
        }
        else {
            // Show success message
            console.log('payment success');
            this.props.onSubmit(response);
        }
    }

    handleAction (response) {
        const self = this;
        const { details, vip, userID } = this.props;
        this.stripe.handleCardAction(
            response.payment_intent_client_secret
        ).then(function (result) {
            if (result.error) {
                // Show error
                console.log(result.error);
            }
            else {
                // The card action has been handled
                // The PaymentIntent can be confirmed again on the server
                axios.post(`${utils.serverURL}/s/stripe/auth_payment`,
                    {
                        vip_id: vip.userId,
                        customer_id: userID,
                        amount: details.amount,
                        payment_intent_id: result.paymentIntent.id
                    }
                ).then((confirmResult) => {
                    return confirmResult.data;
                }).then(response => {
                    console.log('payment success');
                    self.handleServerResponse(response);
                });
            }
        });
    }

    handleEnter = () => {
        this.setState({ isProcessing: false });

        const { details } = this.props;

        if (details === null) {
            return;
        }

        const cardNumber = this.cardNumber.current;
        const cardExpiry = this.cardExpiry.current;
        const cardCVC = this.cardCVC.current;

        this.stripe = stripe(details.key);
        const elements = this.stripe.elements();

        const elementStyle = {
            base: {
                fontSize: '16px',
                fontSmoothing: 'antialiased'
            },
            invalid: {
                color: "#fa755a"
            }
        };

        this.stripeCardNumber = elements.create('cardNumber', { placeholder: 'Card Number', style: elementStyle });
        this.stripeCardNumber.mount(cardNumber);

        this.stripeCardNumber.on('ready', () => {
            if (!utils.isMobile) {
                this.stripeCardNumber.focus();
            }

            this.setState({ isStripeElementsReady: true });
        });

        this.stripeCardExpiry = elements.create('cardExpiry', { placeholder: 'MM/YY', style: elementStyle });
        this.stripeCardExpiry.mount(cardExpiry);

        this.stripeCardCVC = elements.create('cardCvc', { placeholder: 'CVC', style: elementStyle });
        this.stripeCardCVC.mount(cardCVC);
    }

    handleExit = () => {
        const cardNumber = this.cardNumber.current;
        const cardExpiry = this.cardExpiry.current;
        const cardCVC = this.cardCVC.current;
        this.stripe = null;

        this.stripeCardNumber.unmount(cardNumber);
        this.stripeCardExpiry.unmount(cardExpiry);
        this.stripeCardCVC.unmount(cardCVC);

        this.stripeCardNumber = null;
        this.stripeCardExpiry = null;
        this.stripeCardCVC = null;
    }

    render() {
        const {
            isProcessing,
            isStripeElementsReady
        } = this.state;

        const {
            // show,
            details,
            onCancel
        } = this.props;

        let submitLabel = (details !== null) ? `Pay $${parseFloat(details.amount / 100).toFixed(2)}` : 'Pay';

        if (isProcessing) {
            submitLabel = 'Processing...';
        }

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>
                        <Modal.Header
                            closeButton
                            onHide={onCancel}>
                            <Modal.Title>Pay with Card <a href="/payment-info">{'\u24D8'}</a></Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center p-2">
                            <Form onSubmit={this.handleSubmit}>
                                <InputGroup className="mb-2">
                                    <span ref={this.cardNumber} className={"form-control"+this.state.cardNumberError}/>
                                </InputGroup>
                                <InputGroup className="mb-2">
                                    <span ref={this.cardExpiry} className={"form-control"+this.state.cardExpiryError}/>
                                    <span ref={this.cardCVC} className={"form-control"+this.state.cardCVCError} />
                                </InputGroup>
                                <Button variant="primary" type="submit"
                                    className="font-weight-bold w-100"
                                    disabled={isProcessing || !isStripeElementsReady}>
                                    {submitLabel}
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal.Dialog>
                </div>
            </Fragment>
        );
    }
}

CheckoutFormModal.propTypes = {
    details: PropTypes.object,
    vip: PropTypes.object,
    userID: PropTypes.string,
    // show: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
};

export default CheckoutFormModal;
