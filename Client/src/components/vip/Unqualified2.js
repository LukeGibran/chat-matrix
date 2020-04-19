import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import utils from '../common/utils';

class Unqualified2 extends Component {
    constructor(props) {
        super(props);

        this._timeout = null;
    }

    componentDidMount() {
        this._timeout = setTimeout(() => {
            this._timeout = null;
            window.open('https://instagram.com/accounts/logout', '_blank');
            window.location.assign(`${utils.serverURL}/v/vip/logout`);
        }, 10000);
    }

    componentWillUnmount() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }

    render() {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <Card>
                    <Card.Body>
                        <h2 className="card-text text-center">
                            <strong>We are currently in beta, and are limiting the number of people
                                 that can register as a VIP. Please try again next month to see if you
                                  can register as a VIP. Thank you for your patience.</strong>
                        </h2>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

Unqualified2.propTypes = {
    history: PropTypes.object
};

export default Unqualified2;
