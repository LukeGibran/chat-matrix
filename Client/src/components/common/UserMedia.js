import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from '../common/utils';
import MessageModal from './MessageModal';

class UserMedia extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowMessage: false
        };

        this._messageTimeout = null;
    }

    componentDidMount() {
        const messageTimeoutMs = (utils.isMobile ? 1000 : 1000);

        this._messageTimeout = setTimeout(() => {
            this.setState({ isShowMessage: true });
        }, messageTimeoutMs);

        navigator.mediaDevices
            .getUserMedia(utils.userMediaConstraints)
            .then(stream => {
                clearTimeout(this._messageTimeout);
                this.props.onGetUserMedia(stream, null);
            })
            .catch(error => {
                this.props.onGetUserMedia(null, error);
                setTimeout(() => {
                    window.location.href = '/';
                }, 20000);
            })
            .finally(() => this.setState({ isShowMessage: false }));
    }

    componentWillUnmount() {
        clearTimeout(this._messageTimeout);
        this._messageTimeout = null;
    }

    render() {
        const isShowMessage = this.state.isShowMessage;
        const msg = 'Please allow Camera and Microphone access and please use headphones to prevent echoing.';

        if (!isShowMessage) {
            return null;
        }
        return <MessageModal message={msg} />;
    }
}

UserMedia.propTypes = {
    // isAsk: PropTypes.bool,
    onGetUserMedia: PropTypes.func
};

export default UserMedia;
