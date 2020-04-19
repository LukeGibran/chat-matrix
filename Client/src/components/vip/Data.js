import React, { Component } from 'react';
import axios from 'axios';
import utils from '../common/utils';

class StripeConfirm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null
        };
    }

    componentDidMount() {
        axios.get(`${utils.serverURL}/l/links/data`)
            .then(response => {
                const user = response.data;

                if (user && user.id) {
                    this.setState({ user });
                }
            })
            .catch(error => console.log(error));
    }

    render() {
        const { user } = this.state;

        if (!user) {
            return null;
        }

        return (
            <div className="px-3 px-md-5 py-3">
                <p>
                    We process and store personal data about you, only to the extent that it is necessary,
                     so that The Chat Matrix can function properly. We store the following personal data about you:
                </p>

                <ul>
                    <li>
                        Your Instagram profile information, your Instagram profile data,
                        your Instagram profile picture and your Instagram User ID.
                        All of these can already be accessed by members of the public by visiting Instagram.
                    </li>
                    <li>
                        Your Stripe account ID, which is <b>{user.stripeId}</b>
                    </li>
                </ul>
            </div>
        );
    }
}

export default StripeConfirm;
