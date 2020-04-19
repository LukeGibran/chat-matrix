import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { Howl, Howler } from 'howler';
import CallerModal from './CallerModal';
import CalleeModal from './CalleeModal';
import MessageModal from './MessageModal';
import GenericModal from './GenericModal';
import Video from './Video';
import busy from '../common/busy';
import ringtoneMP3 from '../../sounds/ringtone.mp3';
import faviconPNG from '../../images/favicon.png';
import favicon2PNG from '../../images/favicon_flash.png';

class Call extends Component {
    constructor(props) {
        super(props);

        this.state = {
            caller: null,
            callee: null,
            remoteStream: null,
            reportModalMessage: null,
            callEndModalMessage: null,
            paidCallEndModalMessage: null,
            isStarted: false
        };

        this.isEventsAdded = false;
        this.isPaidCall = false;

        /**
         * @type {RTCPeerConnection}
         */
        this.peer = null;

        this.ringtone = new Howl({
            src: [ringtoneMP3]
        });
        this.isTabActive = false;
        this.blinkIntervalId = null;
    }

    componentDidMount() {
        window.onfocus = () => {
            this.isTabActive = true;
            this.hideCallNotification();
        };

        window.onblur = () => {
            this.isTabActive = false;
        };

        window.onclick = () => {
            window.onclick = null;
            this.isTabActive = true;
            this.hideCallNotification();
        };
    }

    componentDidUpdate() {
        if (this.isEventsAdded) {
            return;
        }

        const {
            io,
            onStart,
            onVIPEnd
        } = this.props;

        if (io) {
            this.isEventsAdded = true;

            // Caller
            io.on('REQUEST_SENT', user => this.setState({ callee: user }));
            io.on('REQUEST_DENIED', () => this.callDenied());

            // Callee
            io.on('REQUEST_RECEIVED', user => {
                this.ringtone.play();
                this.showCallNotification();
                this.setState({ caller: user });
            });
            io.on('REQUEST_CANCELLED', () => {
                this.ringtone.stop();
                this.hideCallNotification();
                this.setState({ caller: null });
            });

            // Both parties
            io.on('REQUEST_DISCONNECTED', () => {
                if (this.state.caller !== null) {
                    this.ringtone.stop();
                    this.hideCallNotification();
                }

                this.setState({
                    caller: null,
                    callee: null
                });
            });

            io.on('INITIALIZE_CHAT', (vip, customer) => {
                this.isPaidCall = (vip !== null && customer !== null);

                if (this.isPaidCall) {
                    this.setState({
                        caller: vip,
                        callee: customer
                    });
                }
                this.setState({ isStarted: true });
                busy.update(true);
                onStart();
            });

            io.on('INITIALIZE_PEER_CONNECTION', () => this.openPeerConnection());

            io.on('SIGNAL', data => {
                if (!this.peer) {
                    return;
                }

                switch (data.type) {
                    case 'offer':
                        const offerDesc = new RTCSessionDescription(data);

                        this.peer.setRemoteDescription(offerDesc)
                            .then(() => this.peer.createAnswer())
                            .then(answer => this.peer.setLocalDescription(answer))
                            .then(() => io.emit('SIGNAL', this.peer.localDescription))
                            .catch(error => console.error(error));
                        break;

                    case 'answer':
                        const answerDesc = new RTCSessionDescription(data);

                        this.peer.setRemoteDescription(answerDesc)
                            .catch(error => console.log(error));
                        break;

                    default:
                        const candidate = new RTCIceCandidate(data);

                        this.peer.addIceCandidate(candidate)
                            .catch(error => console.log(error));
                        break;
                }
            });

            io.on('USER_LEFT_ROOM', () => this.endCall());
            io.on('USER_ROOM_DISCONNECTED', user => this.endCall(user));

            io.on('VIP_CHAT_INITIALIZED', () => {
                io.emit('CREATE_VIP_CHAT_ROOM');
            });

            io.on('VIP_CHAT_ENDED', vip => {
                this.closePeerConnection();
                this.setState({
                    caller: null,
                    callee: null,
                    remoteStream: null,
                    isStarted: false
                });
                onVIPEnd(vip);
            });

            io.on('START_NEXT_VIP_CHAT', () => {
                this.setState({ isStarted: false });
                io.emit('INITIALIZE_VIP_CHAT');
            });
        }
    }

    componentWillUnmount() {
        const { io } = this.state;
        this.isEventsAdded = false;
        this.isPaidCall = false;

        window.onfocus = null;
        window.onblur = null;
        window.onclick = null;

        if (io) {
            io.off('REQUEST_SENT');
            io.off('REQUEST_DENIED');
            io.off('REQUEST_DISCONNECTED');
            io.off('REQUEST_RECEIVED');
            io.off('REQUEST_CANCELLED');
            io.off('INITIALIZE_CHAT');
            io.off('INITIALIZE_PEER_CONNECTION');
            io.off('SIGNAL');
            io.off('USER_LEFT_ROOM');
            io.off('USER_ROOM_DISCONNECTED');
            io.off('VIP_CHAT_INITIALIZED');
            io.off('VIP_CHAT_ENDED');
            io.off('START_NEXT_VIP_CHAT');
        }

        this.ringtone.stop();
        this.hideCallNotification();

        if (this.peer !== null) {
            this.closePeerConnection();
        }
    }

    handleCallCancel = () => {
        this.props.io.emit('CANCEL_REQUEST');
        this.setState({ callee: null });
    }

    handleCallAccept = () => {
        this.ringtone.stop();
        this.props.onAccept();
    }

    handleCallDeny = () => {
        this.ringtone.stop();
        this.props.io.emit('DENY_REQUEST');
        this.setState({ caller: null });
    }
    //show message modal when the callee rejects the call
    callDenied = () => {
        busy.update(true);
        this.setState({
            callee: null,
            remoteStream: null,
            reportModalMessage: null,
            paidCallEndModalMessage: null,
            callEndModalMessage: 'Not available',
            isStarted: false
        });

        // close message modal after 2 seconds
        setTimeout(() => {
            this.setState({ callEndModalMessage: null });
            busy.update(false);
        }, 2000);
    }

    handleCallExit = () => {
        this.handleGenericModalResolve();
    }

    handleCallReport = () => {
        this.setState({
            reportModalMessage: 'Report this user for bad behavior?'
        });
    }

    handleGenericModalResolve = () => {
        const {
            caller,
            callee,
            reportModalMessage
        } = this.state;

        const { io } = this.props;
        const reportedUser = caller || callee;

        this.closePeerConnection();
        this.setState({
            caller: null,
            callee: null,
            remoteStream: null,
            reportModalMessage: null,
            callEndModalMessage: null,
            paidCallEndModalMessage: null,
            isStarted: false
        });
        busy.update(false);
        this.props.onExit();
        io.emit('LEAVE_ROOM');

        if (reportModalMessage !== null) {
            io.emit('REPORT_USER', reportedUser);
        }
    }

    handleGenericModalReject = () => {
        this.setState({
            reportModalMessage: null
        });
    }

    handleLocalVideoReady = () => {
        this.props.io.emit('USER_MEDIA_INITIALIZED');
    }

    handleRemoteVideoReady = () => {
        if (this.isPaidCall) {
            this.props.io.emit('VIP_REMOTE_STREAM_RECEIVED');
        }
    }

    openPeerConnection() {
        if (this.peer) {
            return;
        }
        console.log('open peer connection');

        const {
            userID,
            io,
            localStream
        } = this.props;

        const {
            callee,
            caller
        } = this.state;

        let isCaller = false;

        if (this.isPaidCall) {
            isCaller = (caller.userId === userID);
        }
        else {
            isCaller = (callee !== null);
        }
        // randy?
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'turn:' + process.env.SERVER,
                    username: 'randy',
                    credential: 'reyes'
                }
            ]
        });

        this.peer.onicecandidate = event => {
            if (event.candidate) {
                io.emit('SIGNAL', event.candidate);
            }
        };

        this.peer.onremovestream = () => this.closePeerConnection();

        this.peer.oniceconnectionstatechange = () => {
            switch (this.peer.iceConnectionState) {
                case 'closed':
                case 'failed':
                case 'disconnected':
                    this.closePeerConnection();
                    break;
                default:
                    break;
            }
        };

        this.peer.onicegatheringstatechange = () => {
            if (this.peer.iceGatheringState === 'complete') {
                console.log('peer connection success');
            }
        };

        this.peer.onsignalingstatechange = () => {
            if (this.peer.signalingState === 'closed') {
                this.closePeerConnection();
            }
        };

        this.peer.onnegotiationneeded = () => {
            this.peer.onnegotiationneeded = null;

            if (isCaller) {
                console.log('create offer');
                this.peer.createOffer()
                    .then(offer => this.peer.setLocalDescription(offer))
                    .then(() => io.emit('SIGNAL', this.peer.localDescription))
                    .catch(error => console.log(error));
            }
        };

        if (this.peer.addTrack !== undefined) {
            localStream.getTracks().forEach(track => this.peer.addTrack(track, localStream));
            this.peer.ontrack = event => this.setState({ remoteStream: event.streams[0] });
        }
        else {
            this.peer.addStream(localStream);
            this.peer.onaddstream = event => this.setState({ remoteStream: event.stream });
        }
    }

    closePeerConnection() {
        if (!this.peer) {
            return;
        }
        console.log('close peer connection');

        this.peer.onaddstream = null; // For older implementations
        this.peer.ontrack = null; // For newer ones
        this.peer.onremovestream = null;
        this.peer.onnicecandidate = null;
        this.peer.oniceconnectionstatechange = null;
        this.peer.onsignalingstatechange = null;
        this.peer.onicegatheringstatechange = null;
        this.peer.onnotificationneeded = null;

        this.peer.close();
        this.peer = null;
    }

    endCall(user) {
        this.setState({
            caller: null,
            callee: null,
            remoteStream: null,
            reportModalMessage: null,
            paidCallEndModalMessage: null,
            callEndModalMessage: 'Your partner has gone',
            isStarted: false
        });
        busy.update(true);

        // close message modal after 2 seconds
        setTimeout(() => {
            this.setState({ callEndModalMessage: null });
            busy.update(false);
        }, 2000);

        this.closePeerConnection();
        this.props.onExit();
    }

    showCallNotification() {
        if (this.isTabActive) {
            return;
        }

        var favicon = document.getElementById('favicon');
        var index = 0;
        var message = 'NEW VIDEO CALL REQUEST';

        function blink() {
            favicon.href = (index === 0) ? favicon2PNG : faviconPNG;
            document.title = (index === 0) ? message.toUpperCase() : message.toLowerCase();
            index++;
            index %= 2;
        }

        this.blinkIntervalId = setInterval(blink, 1000);
        blink();
    }

    hideCallNotification() {
        if (this.blinkIntervalId !== null) {
            clearInterval(this.blinkIntervalId);
            this.blinkIntervalId = null;
        }

        document.getElementById('favicon').href = faviconPNG;
        document.title = 'The Chat Matrix: 1-to-1 video calls';
    }

    render() {
        const {
            caller,
            callee,
            remoteStream, // remote stream is retrieved by this component
            isStarted,
            reportModalMessage,
            callEndModalMessage,
            paidCallEndModalMessage
        } = this.state;

        const {
            isUserVIP,
            userIP,
            localStream,
            windowWidth,
            windowHeight
        } = this.props;

        let isCanReport = false;
        let vip = null;
        let customer = null;

        if (caller !== null) {
            if (caller.isVip) {
                vip = caller;
            }
            else {
                customer = caller;
            }

            isCanReport = caller.IP !== userIP;
        }

        if (callee !== null) {
            if (callee.isVip) {
                vip = callee;
            }
            else {
                customer = callee;
            }

            isCanReport = callee.IP !== userIP;
        }

        const callEndMsg = callEndModalMessage || paidCallEndModalMessage;
        const genericMsg = reportModalMessage;
        const isShowCallerModal = (!isUserVIP && callee !== null && isStarted === false);
        const isShowCalleeModal = (!isUserVIP && caller !== null && isStarted === false);
        const isShowMessageModal = (callEndModalMessage !== null || paidCallEndModalMessage !== null);
        const isShowGenericModal = (reportModalMessage !== null);

        return (
            <Fragment>
                {isShowCallerModal && (
                    <CallerModal
                        callee={callee}
                        onCancel={this.handleCallCancel} />
                )}

                {isShowCalleeModal && (
                    <CalleeModal
                        caller={caller}
                        onDeny={this.handleCallDeny}
                        onAccept={this.handleCallAccept} />
                )}

                {isShowMessageModal && !isUserVIP && (
                    <MessageModal message={callEndMsg} />
                )}

                {isShowGenericModal && (
                    <GenericModal
                        message={genericMsg}
                        onResolve={this.handleGenericModalResolve}
                        onReject={this.handleGenericModalReject} />
                )}

                {isStarted && (
                    <Video
                        isUserVIP={isUserVIP}
                        isStarted={isStarted}
                        windowWidth={windowWidth}
                        windowHeight={windowHeight}
                        localStream={localStream}
                        remoteStream={remoteStream}
                        vip={vip}
                        customer={customer}
                        isCanReport={isCanReport}
                        isPaidCall={this.isPaidCall}
                        onExit={this.handleCallExit}
                        onReport={this.handleCallReport}
                        onLocalVideoReady={this.handleLocalVideoReady}
                        onRemoteVideoReady={this.handleRemoteVideoReady} />
                )}
            </Fragment>
        );
    }
}

Call.propTypes = {
    userID: PropTypes.string,
    userIP: PropTypes.string,
    isUserVIP: PropTypes.bool,
    io: PropTypes.object,
    localStream: PropTypes.object,
    windowWidth: PropTypes.number,
    windowHeight: PropTypes.number,
    onStart: PropTypes.func,
    onVIPEnd: PropTypes.func,
    onAccept: PropTypes.func,
    onExit: PropTypes.func
};

export default Call;
