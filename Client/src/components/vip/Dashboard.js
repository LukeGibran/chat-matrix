import React from 'react';
import PropTypes from 'prop-types';
import { Navbar, Button } from 'react-bootstrap';
import SelfVideo from '../common/SelfVideo';
import utils from '../common/utils';

const rootStyle = {
    overflow: 'auto!important'
};

const titleRootStyle = {
    fontFamily: 'Gotham Rounded',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontSize: '1.25em'
};

const footerStyle = {
    paddingTop: '1em',
    paddingBottom: '1em'
};

const copyrightStyle = {
    fontSize: '0.75em'
};

const bttn = {
    backgroundColor: '#C5C8C8',
    borderColor: '#C5C8C8'
};

const bttn1 = {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF'
};

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this._timeout = null;
    }

    componentDidUpdate() {
        const { queue } = this.props;
        if (queue !== null) {
            this._timeout = setTimeout(() => {
                this._timeout = null;
                window.open('https://instagram.com/accounts/logout', '_blank');
                window.location.assign(`${utils.serverURL}/v/vip/logout`);
            }, 120000);
        }
    }

    componentWillUnmount() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }

    render () {
        const {
            user,
            queue,
            stream,
            onLogOut,
            onDoVideoCalls
        } = this.props;

        return (
            <div style={rootStyle}>
                <Navbar
                    expand="lg"
                    variant="light"
                    bg="light"
                    fixed="top">
                    <div
                        style={titleRootStyle}
                        className="m-0 text-secondary">
                        THE CHAT MATRIX
                    </div>

                    <Button
                        style={bttn}
                        variant="secondary"
                        className="ml-auto"
                        onClick={onLogOut}>
                        Log Out
                    </Button>
                </Navbar>

                <div className="d-flex flex-column align-items-center text-center py-5 mx-2 mx-md-5">
                    <div className="pt-4 my-3">
                        <p className="lead m-0"><strong>Hi {user.full_name}!</strong></p>
                    </div>

                    {queue == null &&
                        <div className="my-3">
                            <p className="m-0">
                                <small>
                                    Nobody is waiting to do a video call with you at the moment.
                                    When, at least, one person is waiting to do a video call with you,
                                    a green "Do Video Calls now" button will appear here.
                                </small>
                            </p>
                        </div>
                    }

                    {queue !== null &&
                        <div className="mb-3">
                            <p className="m-0 pb-1">
                                <small>
                                    This is how you will look when you do video calls:
                                </small>
                            </p>

                            <SelfVideo stream={stream} />

                            <Button style={bttn1} variant="primary" size="lg"
                                className="mt-3" onClick={onDoVideoCalls}>
                                Do Video Calls now
                            </Button>
                        </div>
                    }

                    <div className="my-3">
                        <p className="m-0">
                            <small>
                                Share this <a href={`/${user.username}`}>link</a> on all of your social media now, and then wait here while your fans start queuing up. You might find this <a href="https://www.huffingtonpost.com/2015/02/25/get-instagram-likes_n_6751614.html" target="_blank" rel="noopener noreferrer">link</a> useful.
                            </small>
                        </p>
                    </div>

                    <div className="my-3">
                        <p className="m-0">
                            <small>
                                The time length of each video call will be 1 second.
                                The name of the person you will do a video call with will appear
                                during the video call. <b>Say "Hi [Name]!"</b>.
                                If you cannot see the person during a video call,
                                still say "Hi [Name]!" because they can still see and hear you.
                                When you press the green "Do Video Calls now" button,
                                up to 10 video calls will happen automatically, one after another.
                                Please use headphones to prevent echoing during video calls.
                                Please take measures to prevent causing harm to your health.
                                You will be automatically logged out if you do not video call 
                                the next person within 2 minutes.
                            </small>
                        </p>
                    </div>

                    <div className="my-3">
                        <p>
                            <small>
                                Access information about your earnings <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">here</a>. The following <a href="/terms-of-use" target="_blank">Terms of Use</a>, <a href="/privacy-policy" target="_blank">Privacy Policy</a> and <a href="/vip/terms-and-conditions" target="_blank">Terms & Conditions</a> apply to you. Find out what personal data we store about you <a href="/vip/data" target="_blank">here</a> (subject access request).
                            </small>
                        </p>
                    </div>
                </div>

                <footer style={footerStyle} className="fixed-bottom bg-light text-secondary">
                    <div style={copyrightStyle} className="text-center">
                        Copyright ©. All rights reserved.
                    </div>
                </footer>
            </div >
        );
    }
}

Dashboard.propTypes = {
    user: PropTypes.object,
    queue: PropTypes.array,
    stream: PropTypes.object,
    onLogOut: PropTypes.func,
    onDoVideoCalls: PropTypes.func
};

export default Dashboard;
