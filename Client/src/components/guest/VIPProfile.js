import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ioClient from 'socket.io-client';
import axios from 'axios';
import randToken from 'rand-token';
import utils from '../common/utils';

const imgStyle = {
    width: 150,
    height: 150
};

const bttn1 = {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF'
};

class VIPProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            vip: null,
            vipAvatarID: null,
            isOnline: false,
            isFound: true
        };
    }

    componentDidMount() {
        const { username } = this.props.match.params;
        const io = ioClient(utils.serverURL);

        io.once('connect', () => {
            const user = {
                userId: randToken.uid(20),
                username: 'guest',
                IP: null,
                userMediaAllowed: false,
                vip: false,
                avatarId: null
            };

            io.emit('ADD_USER', user);
        });

        io.once('ADDED', () => {
            axios.get(`${utils.serverURL}/v/vip/user`)
                .then(response => {
                    const user = response.data;

                    // check if a current user is logged in
                    if (user && user.id) {
                        this.props.history.push('/vip');
                    }
                    else {
                        axios.get(`${utils.serverURL}/u/info/${username}`)
                            .then(response => {
                                if (response.data.error) {
                                    return this.setState({ isFound: false });
                                }

                                this.setState({ vip: response.data });
                            })
                            .then(() => io.emit('CHECK_VIP_STATUS', username))
                            .catch(error => {
                                console.log(error);
                                this.setState({ isFound: false });
                            });
                    }
                })
                .catch(error => console.log(error));
        });

        io.on('VIP_STATUS', (isOnline, user) => {
            this.setState({
                isOnline: isOnline,
                vipAvatarID: (user ? user.avatarId : null)
            });
        });
    }

    handleVideoCall = () => {
        const { vip } = this.state;

        this.props.history.push(`/chat?call_vip=${vip.instagram_id}`);
    }

    handleViewVIPs = () => {
        this.props.history.push('/chat');
    }

    render() {
        const {
            vip,
            vipAvatarID,
            isOnline,
            isFound
        } = this.state;

        const { username } = this.props.match.params;
        let imgURL = (vipAvatarID ? `profile/${vipAvatarID}` : null);

        if (vip && !isOnline) {
            imgURL = vip.instagram_profile_picture;
        }

        return (
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <div className="border text-center px-4 px-md-5 py-3 py-md-4">
                    {vip && isFound && (
                        <Fragment>
                            <p className="lead mb-0">
                                <strong>{vip.instagram_full_name}</strong>
                            </p>

                            <p className="lead mb-0">
                                <strong>{vip.instagram_username}</strong>
                            </p>

                            <p className="lead">
                                {vip.instagram_followed_by} Instagram followers
                            </p>

                            <img
                                alt=""
                                crossOrigin="anonymous"
                                src={imgURL}
                                style={imgStyle} />

                            {isOnline && (
                                <div className="pb-2 pb-md-3">
                                    <p className="lead text-success">
                                        <strong>ONLINE</strong>
                                    </p>

                                    <Button
                                        style={bttn1}
                                        variant="primary"
                                        size="lg"
                                        onClick={this.handleVideoCall}>
                                        Video call this VIP
                                    </Button>
                                </div>
                            )}

                            {!isOnline && (
                                <div className="pb-2 pb-md-3">
                                    <p className="lead text-danger">
                                        <strong>OFFLINE</strong>
                                    </p>
                                </div>
                            )}
                        </Fragment>
                    )}

                    {!vip && isFound && (
                        <p className="lead mb-0">Loading...</p>
                    )}

                    {!isFound && (
                        <p className="lead mb-0">VIP <strong>"{username}"</strong> was not found</p>
                    )}
                </div>
            </div>
        );
    }
}

VIPProfile.propTypes = {
    match: PropTypes.object,
    history: PropTypes.object
};

export default VIPProfile;
