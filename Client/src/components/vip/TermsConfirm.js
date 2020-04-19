import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

class TermsConfirm extends Component {
    handleYesClick = () => {
        this.props.history.push('/vip/stripe-confirm');
    }

    handleNoClick = () => {
        window.open('https://instagram.com/accounts/logout', '_blank');
        window.location.href = `${utils.serverURL}/v/vip/logout`;
    }

    render() {
        return (
            <div className="d-flex justify-content-center align-items-lg-center h-100">
                <Card className="mb-5">
                    <Card.Body>
                        <p className="card-text text-center">
                            Do you completely understand and completely agree with all of the content in the
                            links <a href="/terms-of-use" target="_blank">here</a>,
                            <a href="/privacy-policy" target="_blank"> here</a> and
                            <a href="/vip-terms-and-conditions" target="_blank"> here</a>?
                        </p>

                        <div className="d-flex justify-content-center">
                            <Button style={bttn1} variant="primary" className="mr-3"
                                onClick={this.handleYesClick}>
                                Yes
                            </Button>
                            <Button style={bttn} variant="secondary" onClick={this.handleNoClick}>
                                No
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

TermsConfirm.propTypes = {
    history: PropTypes.object
};

export default TermsConfirm;
