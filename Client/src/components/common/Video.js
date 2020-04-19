import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import utils from './utils';
import reportImage from '../../images/button-report.png';
import exitImage from '../../images/button-exit.png';

const rootStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
};

const remoteVideoRootStyle = {
    position: 'relative',
    height: '100%',
    overflow: 'hidden'
};

class Video extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowTip: false,
            isShowButtons: false,
            localVideoWidth: 0,
            localVideoHeight: 0,
            remoteVideoWidth: 0,
            remoteVideoHeight: 0
        };

        this.isLocalVideoReady = false;
        this.isRemoteVideoReady = false;
        this.localVideoRoot = React.createRef();
        this.remoteVideoRoot = React.createRef();
        this.customerName = React.createRef();
        this.waterMark = React.createRef();
        this.exitButton = React.createRef();
        this.reportButton = React.createRef();

        this.tipTimeout = null;
        this.buttonsTimeout = null;
    }

    componentDidUpdate() {
        const {
            isStarted,
            localStream,
            remoteStream,
            onLocalVideoReady,
            onRemoteVideoReady
        } = this.props;

        const localVideo = (this.localVideoRoot.current !== null ? this.localVideoRoot.current.firstChild : null);
        const remoteVideo = (this.remoteVideoRoot.current !== null ? this.remoteVideoRoot.current.firstChild : null);

        if (isStarted === false) {
            this.isLocalVideoReady = false;
            this.isRemoteVideoReady = false;

            if (localVideo && localVideo.srcObject !== null) {
                localVideo.srcObject = null;
            }
            if (remoteVideo && remoteVideo.srcObject !== null) {
                remoteVideo.srcObject = null;
            }
            return;
        }

        if (localVideo !== null && localStream !== null && !this.isLocalVideoReady) {
            localVideo.srcObject = localStream;

            utils.isVideoReady(localVideo)
                .then(() => {
                    this.isLocalVideoReady = true;

                    this.setState({
                        localVideoWidth: localVideo.videoWidth,
                        localVideoHeight: localVideo.videoHeight
                    });
                    onLocalVideoReady();
                })
                .catch(error => console.log(error));
        }

        if (remoteVideo !== null && remoteStream !== null && !this.isRemoteVideoReady) {
            remoteVideo.srcObject = remoteStream;

            utils.isVideoReady(remoteVideo)
                .then(() => {
                    this.isRemoteVideoReady = true;

                    this.setState({
                        remoteVideoWidth: remoteVideo.videoWidth,
                        remoteVideoHeight: remoteVideo.videoHeight
                    });
                    onRemoteVideoReady();
                })
                .then(() => {
                    this.showTip();
                    this.delayShowButtons();
                })
                .catch(error => console.log(error));
        }

        const exitButton = this.exitButton.current;
        const reportButton = this.reportButton.current;

        if (exitButton !== null) {
            exitButton.addEventListener('click', this.handleExitClick);
        }

        if (reportButton !== null) {
            reportButton.addEventListener('click', this.handleReportClick);
        }
    }

    componentWillUnmount() {
        const exitButton = this.exitButton.current;
        const reportButton = this.reportButton.current;

        if (exitButton !== null) {
            exitButton.removeEventListener('click', this.handleExitClick);
        }

        if (reportButton !== null) {
            reportButton.removeEventListener('click', this.handleReportClick);
        }

        clearTimeout(this.tipTimeout);
        clearTimeout(this.buttonsTimeout);

        this.tipTimeout = null;
        this.buttonsTimeout = null;
    }

    showTip() {
        if (this.tipTimeout) {
            return;
        }

        this.setState({ isShowTip: true });
        this.tipTimeout = setTimeout(() => {
            this.setState({ isShowTip: false });
        }, 2000);
    }

    delayShowButtons() {
        if (this.buttonsTimeout) {
            return;
        }

        this.buttonsTimeout = setTimeout(() => {
            this.setState({ isShowButtons: true });
        }, 2000);
    }

    handleReportClick = () => {
        this.props.onReport();
    }

    handleExitClick = () => {
        this.props.onExit();
    }

    render() {
        const {
            isShowTip,
            isShowButtons,
            localVideoWidth,
            localVideoHeight,
            remoteVideoWidth,
            remoteVideoHeight
        } = this.state;

        const {
            vip,
            customer,
            isUserVIP,
            windowWidth,
            windowHeight,
            localStream,
            remoteStream,
            isCanReport,
            isPaidCall
        } = this.props;

        const localVideoRoot = this.localVideoRoot.current;
        const remoteVideoRoot = this.remoteVideoRoot.current;
        const isDeviceLandscape = (windowWidth > windowHeight);

        ///// remote video
        const isShowRemoteVideo = (remoteStream !== null && this.isRemoteVideoReady);
        let remoteVideoStyle = { display: 'none' };
        let actualRemoteVideoWidth = 0;
        let remoteVideoX = 0;
        let remoteVideoY = 0;

        if (isShowRemoteVideo && remoteVideoRoot !== null) {
            const rootWidth = remoteVideoRoot.offsetWidth;
            const rootHeight = remoteVideoRoot.offsetHeight;
            const isLandscape = (remoteVideoWidth > remoteVideoHeight);
            let scale = 1;

            if (isDeviceLandscape) {
                scale = isLandscape ?
                    rootHeight / remoteVideoHeight :
                    Math.ceil(rootHeight * 1.333333333333333) / remoteVideoWidth;
            }
            else {
                scale = rootHeight / remoteVideoHeight;
            }

            actualRemoteVideoWidth = remoteVideoWidth * scale;
            remoteVideoX = (rootWidth - actualRemoteVideoWidth) / 2;
            remoteVideoY = (rootHeight - remoteVideoHeight * scale) / 2;

            remoteVideoStyle = {
                position: 'absolute',
                display: 'block',
                width: remoteVideoWidth,
                height: remoteVideoHeight,
                top: remoteVideoY,
                left: remoteVideoX,
                transformOrigin: '0 0',
                transform: `scale(${scale})`
            };
        }

        ///// local video
        const isShowLocalVideo = (localStream !== null && this.isLocalVideoReady);
        let localVideoStyle = { display: 'none' };

        if (isShowRemoteVideo && isShowLocalVideo && localVideoRoot !== null) {
            const rootWidth = localVideoRoot.offsetWidth;
            const rootHeight = localVideoRoot.offsetHeight;
            const isLandscape = (localVideoWidth > localVideoHeight);
            const scale = isLandscape ?
                Math.ceil((rootWidth / 56.25) * 100) / localVideoWidth :
                rootWidth / localVideoWidth;

            localVideoStyle = {
                position: 'absolute',
                display: 'block',
                width: localVideoWidth,
                height: localVideoHeight,
                top: (rootHeight - localVideoHeight * scale) / 2,
                left: (rootWidth - localVideoWidth * scale) / 2,
                transformOrigin: '0 0',
                transform: `scale(${scale})`
            };
        }

        const localVideoRootStyle = {
            position: 'absolute',
            overflow: 'hidden',
            width: '6.5em',
            height: '6.5em',
            bottom: 0,
            left: (remoteVideoX < 0 ? 0 : remoteVideoX)
        };

        ///// customer name
        const nameWidth = (actualRemoteVideoWidth <= windowWidth ? actualRemoteVideoWidth : windowWidth);
        const nameStyle = {
            position: 'absolute',
            backgroundColor: 'rgba(0, 1, 0, 0.5)',
            width: nameWidth,
            top: 0,
            left: (remoteVideoX < 0 ? 0 : remoteVideoX),
            opacity: (nameWidth > 0 ? 1 : 0)
        };

        ///// water mark
        const waterMark = this.waterMark.current;
        let waterMarkWidth = 1;
        let waterMarkHeight = 1;
        let waterMarkX = 0;
        let waterMarkY = 0;
        let waterMarkScale = 1;

        if (waterMark !== null) {
            const localVideoRootWidth = localVideoRoot.offsetWidth;
            const localVideoRootHeight = localVideoRoot.offsetHeight;
            const localVideoRootY = localVideoRoot.offsetTop;
            waterMarkWidth = waterMark.offsetWidth;
            waterMarkHeight = waterMark.offsetHeight;

            waterMarkX = localVideoRootWidth;
            waterMarkY = (localVideoRootHeight - waterMarkHeight) / 1.5 + localVideoRootY;

            if (waterMarkX + waterMarkWidth > windowWidth) {
                const availableWidth = windowWidth - localVideoRootWidth;
                waterMarkScale = (availableWidth / waterMarkWidth);
            }
        }

        const waterMarkStyle = {
            position: 'absolute',
            opacity: 0.65,
            top: waterMarkY,
            left: waterMarkX,
            transformOrigin: '0 0',
            transform: `scale(${waterMarkScale})`
        };

        ///// back/exit
        const customerName = this.customerName.current;
        const exitRight = remoteVideoX <= 0 ?
            0 :
            windowWidth - actualRemoteVideoWidth - remoteVideoX;
        let posTop = 0;

        if (isPaidCall && customerName) {
            posTop = customerName.offsetHeight;
        }

        const exitStyle = {
            position: 'absolute',
            width: '2.75em',
            height: '2.75em',
            top: posTop,
            right: exitRight,
            cursor: 'pointer'
        };

        ///// report
        const reportStyle = {
            position: 'absolute',
            width: '2.75em',
            height: '2.75em',
            top: posTop,
            left: (remoteVideoX > 0 ? remoteVideoX : 0),
            cursor: 'pointer'
        };

        ///// tip/message
        const tipStyle = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0
        };

        return (
            <div style={rootStyle} className="bg-white">
                <div
                    ref={this.remoteVideoRoot}
                    style={remoteVideoRootStyle}>
                    <video
                        autoPlay
                        playsInline
                        style={remoteVideoStyle}
                        className="bg-secondary">
                        Your browser does not support the video tag
                    </video>
                </div>

                <div
                    ref={this.localVideoRoot}
                    style={localVideoRootStyle}
                    className="ml-2 mb-2">
                    <video
                        autoPlay
                        playsInline
                        muted
                        style={localVideoStyle}
                        className="bg-dark">
                        Your browser does not support the video tag
                    </video>
                </div>

                {isPaidCall && (
                    <Fragment>
                        {isUserVIP && (
                            <div ref={this.customerName}
                                style={nameStyle}
                                className="text-center text-light pt-1">
                                <h2>{customer.fullname}</h2>
                            </div>
                        )}

                        {isUserVIP === false && (
                            <div ref={this.waterMark}
                                style={waterMarkStyle} className="text-light pl-3 pr-2">
                                <h4 className="m-0">{`@${vip.username}`}</h4>
                                <h2 className="m-0"><strong>thechatmatrix.com</strong></h2>
                            </div>
                        )}
                    </Fragment>
                )}

                {isShowButtons && (isPaidCall === false || isUserVIP) && (
                    <img
                        ref={this.exitButton}
                        alt=""
                        src={exitImage}
                        style={exitStyle}
                        className="mt-3 mr-3" />
                )}

                {isShowButtons && isCanReport && (
                    <img
                        ref={this.reportButton}
                        src={reportImage}
                        alt=""
                        style={reportStyle}
                        className="mt-3 ml-3" />
                )}

                {isShowTip && !isPaidCall && (
                    <div style={tipStyle}>
                        <div className="d-flex flex-column justify-content-center align-items-center h-100">
                            <Alert variant="light" className="text-center text-dark">
                                <strong>Please use headphones to prevent echoing.</strong>
                            </Alert>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

Video.propTypes = {
    localStream: PropTypes.object,
    remoteStream: PropTypes.object,
    windowHeight: PropTypes.number,
    windowWidth: PropTypes.number,
    isStarted: PropTypes.bool,
    isUserVIP: PropTypes.bool,
    isCanReport: PropTypes.bool,
    isPaidCall: PropTypes.bool,
    onLocalVideoReady: PropTypes.func,
    onRemoteVideoReady: PropTypes.func,
    onReport: PropTypes.func,
    onExit: PropTypes.func,
    customer: PropTypes.object,
    vip: PropTypes.object
};

export default Video;
