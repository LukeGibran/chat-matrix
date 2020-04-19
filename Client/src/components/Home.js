import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import utils from './common/utils';
import GenericModal from './common/GenericModal';
import MessageModal from './common/MessageModal';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isCheckingLogInStatus: true,
            browserPCDetect: false,
            browserAndroidDetect: false,
            message: null,
            internetDisconnect: false,
            internetDisconnectMessage: 'Your internet has disconnected',
            internetReconnect: false,
            internetReconnectMessage: 'Your internet has reconnected'
        };
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
    }

    componentDidMount() {
        axios.get(`${utils.serverURL}/v/vip/user`)
            .then(response => {
                const data = response.data;

                if (typeof data === 'object') {
                    if (data.id && data.accessToken) {
                        this.props.history.push('/vip');
                    }
                    else {
                        this.setState({ isCheckingLogInStatus: false });
                    }
                }
                else {
                    this.setState({ isCheckingLogInStatus: false });
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({ isCheckingLogInStatus: false });
            });
        this.browserPCDetectHandler();
        this.browserAndroidDetectHandler();
        window.addEventListener('online', this.handleConnectionChange);
        //handle internet disconnect
        if (localStorage.getItem('connectChange') === 'offline') {
            this.setState({ internetDisconnect: true });
            setTimeout(() => {
                this.setState({ internetDisconnect: false });
                localStorage.removeItem('connectChange');
            }, 2000);
        }
    }
    //handle internet reconnect
    handleConnectionChange(event) {
        if (event.type === "online") {
            this.setState({ internetReconnect: true });
            setTimeout(() => {
                this.setState({ internetReconnect: false });
            }, 2000);
        }
    }

    // detect non-chrome browsers for PC ..handler
    browserPCDetectHandler() {
        const message = <h5 className="mb-0">Please use The Chat Matrix in the <a href="https://www.google.com/chrome/">Google Chrome</a> web browser.</h5>;
        this.setState({ message: message });
        if (utils.browserPCDetect) {
            this.setState({ browserPCDetect: true });
        }
    }

    // detect non-chrome browsers for Android ..handler
    browserAndroidDetectHandler() {
        const message = <h5 className="mb-0">Please use The Chat Matrix in the <a href="https://www.google.com/chrome/">Google Chrome</a> web browser.</h5>;
        this.setState({ message: message });
        if (utils.browserAndroidDetect) {
            this.setState({ browserAndroidDetect: true });
        }
    }

    render() {
        if (this.state.isCheckingLogInStatus) {
            return null;
        }
        const {
            browserPCDetect,
            browserAndroidDetect,
            message,
            internetDisconnect,
            internetDisconnectMessage,
            internetReconnect,
            internetReconnectMessage
        } = this.state;
        const rootClasses = `home d-flex flex-column align-items-center justify-content-center 
            text-center text-white px-2`;

        return (
            <div className="home-root">
                <div className={rootClasses}>
                    <div className="title mb-4">THE CHAT MATRIX</div>
                    <div className="lead mb-4"><strong>1-to-1 video calls</strong></div>
                    <div className="lead mb-4"><strong>Simply select a person you want a video call with</strong></div>

                    <Link to="/chat" id="start-button"
                        className="btn btn-warning btn-lg mt-md-3 mt-sm-1 mt-0 mb-md-4 mb-sm-1 mb-0 pt-3">
                        Start Now
                    </Link>

                    <div className="mt-4 mb-4">
                        <ButtonGroup>
                            <Link to="/terms-of-use">
                                <small>Terms of Use</small>
                            </Link>
                            <Link to="/privacy-policy" className="px-3">
                                <small>Privacy Policy</small>
                            </Link>
                            <Link to="/contact">
                                <small>Contact Us</small>
                            </Link>
                            <Link to="/report-bug" className="px-3">
                                <small>Report Bug</small>
                            </Link>
                        </ButtonGroup>
                    </div>

                    <footer>
                        <div className="text-center text-white">
                            <small>Copyright ©. All rights reserved.</small>
                        </div>
                    </footer>
                </div>
                {browserPCDetect && message && (
                    <GenericModal
                        message={message}
                        resolveLabel="Okay"
                        onResolve={() => {
                            this.setState({ message: null });
                        }}
                    />
                )}

                {browserAndroidDetect && message && (
                    <MessageModal
                        message={message}
                    />
                )}

                {internetDisconnect && (
                    <MessageModal
                        message={internetDisconnectMessage}
                    />
                )}

                {internetReconnect && (
                    <MessageModal
                        message={internetReconnectMessage}
                    />
                )}

            </div>
        );
    }
}

Home.propTypes = {
    history: PropTypes.object
};

export default Home;
