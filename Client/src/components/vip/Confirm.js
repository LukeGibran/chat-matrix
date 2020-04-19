import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Button } from 'react-bootstrap';
import utils from '../common/utils';

const countries1 = [
    'Australia', 
    'Austria', 
    'Belgium', 
    'Canada', 
    'Denmark',
    'Estonia',
    'Finland',
    'France', 
    'Germany',
    'Greece',
    'Hong Kong', 
    'Ireland', 
    'Italy',
    'Japan',
    'Latvia',
    'Lithuania'
];

const countries2 = [
    'Luxembourg', 
    'Malaysia',
    'Netherlands', 
    'New Zealand', 
    'Norway',
    'Poland',
    'Portugal',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Spain', 
    'Sweden', 
    'Switzerland', 
    'United Kingdom', 
    'United States'
];

const bttn = {
    backgroundColor: '#C5C8C8',
    borderColor: '#C5C8C8'
};

const bttn1 = {
    backgroundColor: '#007BFF', 
    borderColor: '#007BFF'
};

class Confirm extends Component {
    handleYesClick = () => {
        this.props.history.push('/vip/terms-confirm');
    }

    handleNoClick = () => {
        window.open('https://instagram.com/accounts/logout', '_blank');
        window.location.href = `${utils.serverURL}/v/vip/logout`;
    }

    render() {
        const items = countries1.map(item => <li key={item}>{item}</li>);
        const items2 = countries2.map(item => <li key={item}>{item}</li>);

        return (
            <div className="d-flex justify-content-center align-items-lg-center h-100">
                <Card>
                    <Card.Body>
                        <p className="card-text text-center">
                            Do you want to be a VIP and earn money by doing video calls with people?
                        </p>

                        <div className="d-flex justify-content-center">
                            <Button style={bttn1} variant="success" className="mr-3"
                                onClick={this.handleYesClick}>
                                Yes
                            </Button>
                            <Button style={bttn} variant="danger" onClick={this.handleNoClick}>
                                No
                            </Button>
                        </div>

                        <p className="mt-3 text-center">
                            <small>
                                To be a VIP, you need a bank account in one of the countries listed below.
                            </small>
                        </p>

                        <div className="d-flex justify-content-center">
                            <ul>{items}</ul>
                            <ul>{items2}</ul>
                        </div>

                        <p className="text-center m-0">
                            <small>
                                More countries will be added in the future. If you do not have a bank account in one of the countries above, you may be able to open a business bank account in the United States with <a href="https://stripe.com/atlas" target="_blank" rel="noopener noreferrer">Stripe Atlas</a>.
                            </small>
                        </p>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

Confirm.propTypes = {
    history: PropTypes.object
};

export default Confirm;
