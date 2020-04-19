import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import randToken from 'rand-token';
import ioClient from 'socket.io-client';
import queryString from 'query-string';
import busy from '../common/busy';
import utils from '../common/utils';
import avatarUploader from '../common/avatar-uploader';
import activityMonitor from '../common/activity-monitor';
import TermsAndPrivacyModal from '../common/TermsAndPrivacyModal';
import UserMedia from '../common/UserMedia';
import FaceFinder from '../common/FaceFinder';
import Users from '../guest/Users';
import Call from '../common/Call';
import Queue from '../guest/Queue';
import ConfirmVIPCallModal from '../guest/ConfirmVIPCallModal';
import NameFormModal from '../guest/NameFormModal';
import CheckoutFormModal from '../guest/CheckoutFormModal';
import GenericModal from '../common/GenericModal';
import MessageModal from '../common/MessageModal';

class Guest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0,
            windowHeight: 0,
            isTermsAndPrivacyAsked: false,
            isUserMediaAllowed: false,
            isAskForUserMediaAccess: false,
            isCallStarted: false,
            isVIPCallConfirmed: false,
            isNameSubmitted: false,
            userID: null,
            username: 'guest',
            userIP: null,
            avatar: null,
            io: null,
            stream: null,
            vip: null,
            checkoutDetails: null,
            stripeToken: null,
            queue: null,
            vipLeftMessage: null,
            vipCallEndMessage: null,
            message: null
        };
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
        this.tempVIP = null;
        this._isMounted = false;
        this._isShowNameForm = false;
        this._isSelectedUser = false;
    }

    componentDidMount() {
        this._isMounted = true;
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('blur', this.handleWindowBlur);

        this.checkLogInStatus();
        window.addEventListener('offline', this.handleConnectionChange);
        this.browserAndroidDetectHandler();
    }

    componentDidUpdate() {
        const {
            isTermsAndPrivacyExpired,
            isUserMediaAllowed,
            isAskForUserMediaAccess,
            io
        } = this.state;

        if (isTermsAndPrivacyExpired === false && isAskForUserMediaAccess === false &&
            isUserMediaAllowed === false && io === null) {
            this.openSocketConnection();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        activityMonitor.onTimeout = null;
        activityMonitor.stop();
        
        const { io } = this.state;

        if (io !== null) {
            io.off('NAME_SUBMITTED');
            io.off('QUEUE_JOINED');
            io.off('QUEUE_LEFT');
            io.close();
        }

        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('blur', this.handleWindowBlur);
    }

    // prevent non-chrome android users from usergrid
    browserAndroidDetectHandler() {
        const message = <h5 className="mb-0">Please use The Chat Matrix in the <a href="https://www.google.com/chrome/">Google Chrome</a> web browser.</h5>;
        this.setState({ message: message });
        if (utils.browserAndroidDetect) {
            this.setState({ browserAndroidDetect: true });
        }
    }
    // show modal dialogue when the internet disconnects
    handleConnectionChange(event) {
        if (event.type === "offline") {
            setTimeout(() => {
                localStorage.setItem('connectChange', 'offline');
                this.props.history.push('/');
            }, 2000);
        }
    }

    handleWindowResize = () => {
        this.setState({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });
    }

    handleWindowBlur = () => {
        if (!utils.isMobile && !this._isShowNameFormModal && !this._isShowCheckoutForm) {
            //this.props.history.push('/');
        }
    }

    handleUserSelect = (user) => {
        if (this._isSelectedUser) {
            return;
        }

        this._isSelectedUser = true;

        const {
            io
        } = this.state;

        if (user.isVip) {
            this.setState({ vip: user });
        }
        else {
            io.emit('SEND_REQUEST', user);
        }
    }

    handleCallAccept = () => {
        const {
            io
        } = this.state;

        io.emit('ACCEPT_REQUEST');
    }

    handleCallStart = () => {
        activityMonitor.stop();
        this.setState({ isCallStarted: true });
    }

    handleCallExit = () => {
        const { io } = this.state;
        activityMonitor.reset();
        this.setState({ 
            isCallStarted: false,
            isVIPCallConfirmed: false,
            isNameSubmitted: false,
            vip: null,
            queue: null
        });
        io.emit('LEAVE_QUEUE');
        io.emit('LOAD_USERS');
    }

    handleVIPCallYes = () => {
        this.setState({ isVIPCallConfirmed: true });
    }

    handleVIPCallNo = () => {
        this._isSelectedUser = false;

        this.setState({ vip: null });
    }

    handleNameSubmit = (name) => {
        activityMonitor.stop();
        this.state.io.emit('SUBMIT_NAME', name);
        this.setState({ isNameSubmitted: true });
    }
    // cancel name submit
    handleNameCancel = () => {
        this._isShowNameForm = false;
        this._isSelectedUser = false;
        activityMonitor.reset();
        this.setState({
            isVIPCallConfirmed: false,
            isNameSubmitted: false,
            vip: null,
            queue: null
        });
    }

    handlePaySubmit = (response) => {
        this._isSelectedUser = false;

        this.setState({ stripeToken: response.success });
    }

    handlePayCancel = () => {
        this._isSelectedUser = false;

        activityMonitor.reset();
        this.setState({
            isVIPCallConfirmed: false,
            isNameSubmitted: false,
            vip: null,
            checkoutDetails: null,
            stripeToken: null
        });
    }

    handleQueueExit = (event) => {
        const { io } = this.state;

        event.preventDefault();
        activityMonitor.reset();
        this.setState({
            isVIPCallConfirmed: false,
            isNameSubmitted: false,
            vip: null,
            checkoutDetails: null,
            stripeToken: null,
            queue: null
        });
        busy.update(false);
        io.emit('LEAVE_QUEUE');
        io.emit('LOAD_USERS');
    }

    handleVIPCallEnd = (vip) => {
        this.tempVIP = this.state.vip;

        activityMonitor.reset();
        this.setState({
            isCallStarted: false,
            isVIPCallConfirmed: false,
            isNameSubmitted: false,
            vip: null,
            checkoutDetails: null,
            stripeToken: null,
            queue: null,
            vipCallEndMessage: `Do you want another video greeting with ${vip.fullname}?`
        });
    }

    handleVIPCallAgainYes = () => {
        this.setState({ vipCallEndMessage: null });

        if (this.tempVIP) {
            const vip = this.tempVIP;
            this.tempVIP = null;

            this.handleUserSelect(vip);
        }
    }

    handleVIPCallAgainNo = () => {
        this.tempVIP = null;
        this.setState({ vipCallEndMessage: null });
    }

    handleTermsAndPrivacyYes = () => {
        this.setState({ isTermsAndPrivacyAsked: true });
    }

    handleTermsAndPrivacyNo = () => {
        this.props.history.push('/');
    }

    handleGetUserMedia = (stream, error) => {
        if (error) {
            console.log(error);
            this.setState({
                isAskForUserMediaAccess: false,
                isUserMediaAllowed: false,
                stream: null
            });

            return;
        }

        this.setState({
            isAskForUserMediaAccess: false,
            isUserMediaAllowed: true,
            stream: stream
        });
    }

    handleFaceFind = (dataURL) => {
        if (!dataURL) {
            this.setState({
                // set this to false so that the app behaves as if the user blocked user media access(mic, cam)
                isUserMediaAllowed: false,
                avatar: 'NO_AVATAR'
            });

            return console.log('no avatar');
        }

        avatarUploader.upload(dataURL, this.state.userID)
            .then(() => this.setState({ avatar: dataURL }))
            .then(() => this.openSocketConnection())
            .catch(error => console.log(error));
    }

    openSocketConnection = () => {
        const {
            userID,
            userIP,
            isUserMediaAllowed
        } = this.state;

        const io = ioClient(utils.serverURL);

        io.once('connect', () => {
            console.log('User ID:', userID);
            console.log('User IP:', userIP);

            this.setState({ io });
            busy.setIO(io);

            const user = {
                userId: userID,
                username: 'guest',
                IP: userIP,
                userMediaAllowed: isUserMediaAllowed,
                vip: false,
                avatarId: (isUserMediaAllowed ? userID : null)
            };

            io.emit('ADD_USER', user);
        });

        io.once('connect_error', error => { 
            console.log(error);
        });

        io.once('disconnect', reason => {
            io.emit('LEAVE_QUEUE');
            this.props.history.push('/');
        });

        io.once('ADDED', () => {
            activityMonitor.onTimeout = () => {
                window.location.href = '/';
            };
            activityMonitor.reset();

            io.emit('LOAD_USERS');
        });

        io.on('NAME_SUBMITTED', async () => {
            await axios.get(`${utils.serverURL}/s/stripe/checkout_details`,
                {
                    params: {
                        vip_id: this.state.vip.userId
                    }
                })
                .then(response => {
                    this.setState({ checkoutDetails: response.data });
                })
                .catch(error => console.log(error));
        });

        io.on('QUEUE_JOINED', users => {
            activityMonitor.stop();

            const queue = users.map(user => ({
                userId: user.userId,
                username: user.username
            }));

            this.setState({ queue });
        });

        io.on('QUEUE_LEFT', (users, user) => {
            if (user.isVip) {
                this.setState({
                    isVIPCallConfirmed: false,
                    isNameSubmitted: false,
                    vip: null,
                    checkoutDetails: null,
                    stripeToken: null,
                    queue: null,
                    vipLeftMessage: `Sorry, but ${user.fullname} (@${user.username}) has discontinued doing video calls 
                        at this moment. No payment has been taken from your card on this occasion.`
                });
            }
            else {
                let queue = null;

                if (users.length > 0) {
                    queue = users.map(user => ({
                        userId: user.userId,
                        username: user.username
                    }));
                }

                this.setState({ queue });
            }
        });

        io.on('USERS_LOADED', this.checkVIPCallRedirect);

        io.on('REQUEST_SENT', () => {
            this._isSelectedUser = false;
        });
    }

    checkVIPCallRedirect = users => {
        const { io } = this.state;

        if (users.length > 0) {
            io.off('USERS_LOADED', this.checkVIPCallRedirect);

            const query = queryString.parse(this.props.location.search);
            const vipID = query.call_vip;

            if (vipID) {
                const vip = users.find(user => user.userId === vipID);

                if (vip) {
                    this.handleUserSelect(vip);
                }
            }
        }
    }

    async checkLogInStatus() {
        await axios.get(`${utils.serverURL}/v/vip/user`)
            .then(response => {
                const data = response.data;

                if (typeof data === 'object') {
                    if (data.id && data.accessToken) {
                        this.props.history.push('/vip');
                    }
                    else {
                        this.initInitialStates();
                    }
                }
                else {
                    this.initInitialStates();
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    async initInitialStates() {
        await axios.get(`${utils.serverURL}/c/client/ip`)
            .then(response => {
                this.setState({
                    userID: randToken.uid(20),
                    userIP: response.data,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight
                });
            })
            .catch(error => console.log(error));
    }

    render() {
        const {
            windowWidth,
            windowHeight,
            isTermsAndPrivacyAsked,
            isUserMediaAllowed,
            isCallStarted,
            isVIPCallConfirmed,
            isNameSubmitted,
            userID,
            userIP,
            avatar,
            io,
            stream,
            vip,
            checkoutDetails,
            stripeToken,
            queue,
            vipLeftMessage,
            vipCallEndMessage,
            browserAndroidDetect,
            message
        } = this.state;

        const rootStyle = {
            overflow: 'hidden'
        };

        this._isShowNameForm = (vip !== null && isVIPCallConfirmed && isNameSubmitted === false);
        this._isShowCheckoutForm = (vip && isVIPCallConfirmed && checkoutDetails && (!stripeToken || !queue));

        const isShowConfirmVIPCall = (vip !== null && isVIPCallConfirmed === false);

        return (
            <Container
                style={rootStyle}
                fluid>

                <UserMedia onGetUserMedia={this.handleGetUserMedia} />

                {!isTermsAndPrivacyAsked && isUserMediaAllowed && (
                    <TermsAndPrivacyModal
                        onYes={this.handleTermsAndPrivacyYes}
                        onNo={this.handleTermsAndPrivacyNo} />
                )}

                {isTermsAndPrivacyAsked && (
                    <FaceFinder
                        avatar={avatar}
                        stream={stream}
                        isVIP={false}
                        onFind={this.handleFaceFind} />
                )}

                {
                    isCallStarted === false && queue === null && (
                        <Users
                            io={io}
                            guestID={userID}
                            guestIP={userIP}
                            windowWidth={windowWidth}
                            windowHeight={windowHeight}
                            onSelect={this.handleUserSelect} />)
                }

                {
                    queue !== null && (
                        <Queue
                            userID={userID}
                            vip={vip}
                            stream={stream}
                            users={queue}
                            onExit={this.handleQueueExit} />)
                }

                <Call
                    isUserVIP={false}
                    userID={userID}
                    userIP={userIP}
                    io={io}
                    localStream={stream}
                    windowWidth={windowWidth}
                    windowHeight={windowHeight}
                    onAccept={this.handleCallAccept}
                    onStart={this.handleCallStart}
                    onExit={this.handleCallExit}
                    onVIPEnd={this.handleVIPCallEnd} />

                {isShowConfirmVIPCall && vipLeftMessage === null && (
                    <ConfirmVIPCallModal
                        user={vip}
                        onYes={this.handleVIPCallYes}
                        onNo={this.handleVIPCallNo} />
                )}

                {this._isShowNameForm && (
                    <NameFormModal
                        user={vip}
                        onSubmit={this.handleNameSubmit}
                        onCancel={this.handleNameCancel} />
                )}

                {this._isShowCheckoutForm && (
                    <CheckoutFormModal
                        vip={vip}
                        userID={userID}
                        details={checkoutDetails}
                        onSubmit={this.handlePaySubmit}
                        onCancel={this.handlePayCancel} />
                )}

                {vipLeftMessage !== null && (
                    <GenericModal
                        message={vipLeftMessage}
                        resolveLabel="Okay"
                        onResolve={() => this.setState({ vipLeftMessage: null })} />
                )}

                {vipCallEndMessage !== null && (
                    <GenericModal
                        message={vipCallEndMessage}
                        resolveLabel="Yes"
                        rejectLabel="No"
                        onResolve={this.handleVIPCallAgainYes}
                        onReject={this.handleVIPCallAgainNo} />
                )}

                {browserAndroidDetect && message && (
                    <MessageModal
                        message={message}
                    />
                )}
            </Container>
        );
    }
}

Guest.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
};

export default Guest;
