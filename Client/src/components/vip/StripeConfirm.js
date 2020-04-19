import React, { Component } from 'react';
import { Card, Button } from 'react-bootstrap';
import utils from '../common/utils';

const bttn = {
    backgroundColor: '#C5C8C8',
    borderColor: '#C5C8C8'
};

const bttn1 = {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF'
};

class StripeConfirm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isProcessing: false
        };
    }

    handleYesClick = () => {
        this.setState({ isProcessing: true });
        window.location.href = `${utils.serverURL}/s/stripe/oauth`;
    }

    handleNoClick = () => {
        this.setState({ isProcessing: true });
        window.open('https://instagram.com/accounts/logout', '_blank');

        window.location.href = `${utils.serverURL}/v/vip/logout`;
    }

    render() {
        const isProcessing = this.state.isProcessing;

        return (
            <div className="d-flex justify-content-center align-items-lg-center h-100">
                <Card className="mb-5">
                    <Card.Body>
                        <p className="card-text text-center">
                            Do you agree with all of the information below?
                        </p>

                        <div className="d-flex justify-content-center mb-3">
                            <Button style={bttn1} variant="success" className="mr-3"
                                disabled={isProcessing} onClick={this.handleYesClick}>
                                Yes
                            </Button>
                            <Button style={bttn} variant="danger" onClick={this.handleNoClick}
                                disabled={isProcessing}>
                                No
                            </Button>
                        </div>

                        {isProcessing &&
                            <p className="card-text text-center text-primary">
                                Please wait a few moments...
                            </p>
                        }

                        <p className="card-text text-center">
                            To receive payments, you need to create an account with Stripe (https://stripe.com).
                            Stripe is a very reputable company (which is backed by three PayPal co-founders)
                            that operates side-by-side with The Chat Matrix so that you can receive payments.
                        </p>

                        <p className="card-text text-center">
                            You will now be taken to create an account with Stripe.
                        </p>

                        <p className="card-text text-center">
                            When you create an account with Stripe, you will be asked to give a "business address"
                            and phone number. Please do not give your home/personal address as your "business address",
                            and please do not give your personal phone number.
                            These two pieces of information will be accessible to the people that you will do
                            video calls with! Our guess is that Stripe will not ask you to verify the "business address"
                            and phone number you give to them.
                        </p>

                        <p className="card-text text-center">
                            If you are unsure about anything when you are creating an account with Stripe,
                            you can contact them at support@stripe.com.
                        </p>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default StripeConfirm;
