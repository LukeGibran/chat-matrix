import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from './utils';

const videoRootStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: '11.5em',
    height: '11.5em'
};

class SelfVideo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoWidth: 240,
            videoHeight: 180,
            rootWidth: 180,
            rootHeight: 180
        };

        this.root = React.createRef();
        this.video = React.createRef();
        this.isVideoReady = false;
    }

    componentDidMount() {
        const { stream } = this.props;
        const video = this.video.current;
        const root = this.root.current;

        if (this.isVideoReady === true || stream === null ||
            video === null || root === null) {
            return;
        }

        video.srcObject = stream;

        utils.isVideoReady(video)
            .then(() => {
                this.isVideoReady = true;

                this.setState({
                    videoWidth: video.videoWidth,
                    videoHeight: video.videoHeight,
                    rootWidth: root.offsetWidth,
                    rootHeight: root.offsetHeight
                });
            });
    }

    componentWillUnmount() {
        this.isVideoReady = false;
    }

    render() {
        const {
            videoWidth,
            videoHeight,
            rootWidth,
            rootHeight
        } = this.state;

        const isLandscape = (videoWidth > videoHeight);
        const scale = isLandscape ?
            Math.ceil((rootWidth / 56.25) * 100) / videoWidth :
            rootWidth / videoWidth;

        const videoStyle = {
            position: 'absolute',
            width: videoWidth,
            height: videoHeight,
            top: (rootHeight - videoHeight * scale) / 2,
            left: (rootWidth - videoWidth * scale) / 2,
            transformOrigin: '0 0',
            transform: `scale(${scale})`
        };

        return (
            <div ref={this.root} style={videoRootStyle}
                className="mx-auto">
                <video ref={this.video}
                    autoPlay playsInline
                    className="bg-secondary" style={videoStyle}>
                    Your browser does not support the video tag
                </video>
            </div>
        );
    }
}

SelfVideo.propTypes = {
    stream: PropTypes.object
};

export default SelfVideo;
