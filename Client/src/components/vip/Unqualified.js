import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import utils from '../common/utils';

class Unqualified extends Component {
    constructor(props) {
        super(props);

        this._timeout = null;
    }

    componentDidMount() {
        this._timeout = setTimeout(() => {
            this._timeout = null;
            window.open('https://instagram.com/accounts/logout', '_blank');
            window.location.assign(`${utils.serverURL}/v/vip/logout`);
        }, 3000);
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
                            <strong>Sorry, you do not have enough influence to be a VIP yet.</strong>
                        </h2>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

Unqualified.propTypes = {
    history: PropTypes.object
};

export default Unqualified;
