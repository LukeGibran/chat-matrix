import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import ioClient from 'socket.io-client';
import randToken from 'rand-token';
import avatarUploader from '../common/avatar-uploader';
import activityMonitor from '../common/activity-monitor';
import Dashboard from './Dashboard';
import UserMedia from '../common/UserMedia';
import FaceFinder from '../common/FaceFinder';
import Call from '../common/Call';
import UserMediaBlockedModal from './UserMediaBlockedModal';
import utils from '../common/utils';
import GenericModal from '../common/GenericModal';
// eslint-disable-next-line
import { Howl, Howler } from 'howler';
import ringtoneMP3 from '../../sounds/ringtone.mp3';

class VIPDashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0,
            windowHeight: 0,
            isUserMediaAllowed: true,
            isAskForUserMediaAccess: false,
            isCallStarted: false,
            user: null,
            userIP: null,
            stream: null,
            avatar: null,
            avatarID: null,
            io: null,
            queue: null,
            browserDetect: false,
            message: null
        };
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
        this.isDoingVideoCalls = false;
        this.ringtone = new Howl({
            src: [ringtoneMP3]
        });
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);

        let user;

        axios.get(`${utils.serverURL}/v/vip/user`)
            .then(response => {
                const data = response.data;

                if (typeof data === 'object') {
                    user = data;
                    return axios.get(`${utils.serverURL}/c/client/ip`);
                }
                else {
                    throw new Error('Invalid Object user');
                }
            })
            .then(response => {
                this.setState({
                    user: user,
                    userIP: response.data,
                    isAskForUserMediaAccess: true, // set to true to trigger user media access confirmation
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight
                });
            })
            .catch(error => {
                console.log(error);
                this.props.history.push('/b823a745/e4a6c13b');
            });
        //event listener for internet disconnect
        window.addEventListener('offline', this.handleConnectionChange);
        this.browserDetectHandler();
    }

    componentWillUnmount() {
        activityMonitor.onTimeout = null;
        activityMonitor.stop();

        const { io } = this.state;

        if (io) {
            io.off('QUEUE_JOINED');
            io.off('QUEUE_LEFT');
            io.close();
        }

        window.removeEventListener('resize', this.handleWindowResize);
    }

    // detect non-chrome browsers
    browserDetectHandler() {
        const message = <h5 className="mb-0">Please use The Chat Matrix in the <a href="https://www.google.com/chrome/">Google Chrome</a> web browser.</h5>;
        this.setState({ message: message });
        if (utils.browserPCDetect) {
            this.setState({ browserDetect: true });
        }
    }

    //internet disconnects
    handleConnectionChange(event) {
        if (event.type === 'offline') {
            setTimeout(() => {
                localStorage.setItem('connectChange', 'offline');
                this.props.history.push('/b823a745/e4a6c13b');
                this.handleLogOut();
            }, 2000);
        }
    }

    handleWindowResize = () => {
        this.setState({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });
    }

    handleLogOut = () => {
        window.open('https://instagram.com/accounts/logout', '_blank');
        window.location.assign(`${utils.serverURL}/v/vip/logout`);
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
            return this.handleLogOut();
        }

        const avatarID = this.state.user.id + '_' + randToken.generate(16);

        avatarUploader.upload(dataURL, avatarID)
            .then(() => this.setState({
                avatar: dataURL,
                avatarID: avatarID
            }))
            .then(() => this.openSocketConnection())
            .catch(error => console.log(error));
    }

    handleDoVideoCalls = () => {
        if (this.isDoingVideoCalls) {
            return;
        }
        this.isDoingVideoCalls = true;
        this.state.io.emit('INITIALIZE_VIP_CHAT');
    }

    handleCallStart = () => {
        this.setState({ isCallStarted: true });
    }

    handleCallExit = () => {
        this.setState({ isCallStarted: false });
    }

    handleVIPCallEnd = () => {
        this.isDoingVideoCalls = false;

        activityMonitor.reset();
        this.setState({ isCallStarted: false });
    }

    openSocketConnection = () => {
        const {
            isUserMediaAllowed,
            user,
            userIP,
            avatarID
        } = this.state;
        console.log('User ID:', user.id);
        console.log('User IP:', userIP);
        const io = ioClient(utils.serverURL);

        io.once('connect', () => {
            this.setState({ io });
            const aUser = {
                userId: user.id,
                vip: true,
                IP: userIP,
                username: user.username,
                fullname: user.full_name,
                userMediaAllowed: isUserMediaAllowed,
                avatarId: avatarID,
                followedBy: user.counts.followed_by,
                follows: user.counts.follows,
                profilePicture: user.profile_picture
            };

            io.emit('ADD_USER', aUser);
        });

        io.once('connect_error', error => { 
            console.log(error);
        });

        io.once('disconnect', reason => { 
            //reasons to log VIP out
            console.log(reason);
            if (reason === 'transport close') {
                this.handleLogOut();
            }
            if (reason === 'io server disconnect') {
                this.props.history.push('/b823a745/e4a6c13b');
            }
        });

        io.once('ADDED', () => {
            activityMonitor.onTimeout = () => {
                this.handleLogOut();
            };
            activityMonitor.reset();
            io.emit('UPDATE_AVATAR');// I think this is not needed
        });

        io.on('QUEUE_JOINED', users => {
            activityMonitor.stop();
            this.ringtone.play();
            const queue = users.map(user => ({
                userId: user.userId,
                username: user.username,
                userfullname: user.fullname
            }));
            this.setState({ queue });
        });

        io.on('QUEUE_LEFT', (users, user) => {
            let queue = null;
            this.ringtone.stop();
            if (users.length > 0) {
                queue = users.map(user => ({
                    userId: user.userId,
                    username: user.username
                }));
            }
            else if (!this.state.isCallStarted) {
                activityMonitor.reset();
            }

            this.setState({ queue });
        });
    }

    render() {
        const {
            windowWidth,
            windowHeight,
            isUserMediaAllowed,
            isAskForUserMediaAccess,
            isCallStarted,
            user,
            userIP,
            stream,
            avatar,
            io,
            queue,
            browserDetect,
            message
        } = this.state;

        if (!isUserMediaAllowed) {
            return <UserMediaBlockedModal show onLogOut={this.handleLogOut} isUserMediaAllowed={isUserMediaAllowed} />;
        }

        const userID = (user !== null ? user.id : null);

        return (
            <Container fluid>
                {user !== null && isCallStarted === false &&
                    <Dashboard
                        user={user}
                        queue={queue}
                        stream={stream}
                        onLogOut={this.handleLogOut}
                        onDoVideoCalls={this.handleDoVideoCalls} />
                }

                <Call
                    queue={queue}
                    isUserVIP
                    userID={userID}
                    userIP={userIP}
                    io={io} 
                    localStream={stream}
                    windowWidth={windowWidth}
                    windowHeight={windowHeight}
                    onStart={this.handleCallStart}
                    onExit={this.handleCallExit}
                    onVIPEnd={this.handleVIPCallEnd} />

                <UserMedia
                    isAsk={isAskForUserMediaAccess}
                    onGetUserMedia={this.handleGetUserMedia} />

                <FaceFinder
                    avatar={avatar}
                    stream={stream}
                    isVIP
                    onFind={this.handleFaceFind} />

                {browserDetect && message && (
                    <GenericModal
                        message={message}
                        resolveLabel="Log Out"
                        onResolve={this.handleLogOut}
                    />
                )}
            </Container>
        );
    }
}

VIPDashboard.propTypes = {
    history: PropTypes.object
};

export default VIPDashboard;
