import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import busy from '../common/busy';
import boxImage from '../../images/box.jpg';

const imageRootStyle = {
    width: '100%',
    paddingTop: '75%',
    position: 'relative'
};

const imageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#dee3e7'
};

const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    opacity: 0.5,
    zIndex: 1040
};

const modalRootStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1040
};

const bttn = {
    backgroundColor: '#C5C8C8',
    borderColor: '#C5C8C8'
};

class CallerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isProfileImageLoaded: false
        };

        this.image = React.createRef();
        this.modalDialog = React.createRef();

        // default modal style
        this._modalStyle = {
            position: 'absolute',
            margin: 0,
            top: 0,
            left: 0,
            opacity: 0
        };
    }

    ////////// LIFECYCLE METHODS
    componentDidMount() {
        busy.update(true);
        this.calculateModalPosition();
    }

    componentDidUpdate() {
        const { callee } = this.props;
        const image = this.image.current;

        if (callee === null) {
            return;
        }

        if (image !== null) {
            image.src = `/profile/${callee.avatarId}`;

            image.onload = () => {
                image.onload = null;
                image.onerror = null;
            };

            image.onerror = () => {
                image.onload = null;
                image.onerror = null;
                image.src = boxImage;
            };
        }
    }

    componentWillUnmount() {
        busy.update(false);
    }

    calculateModalPosition() {
        const modalDialog = this.modalDialog.current;

        if (modalDialog) {
            const top = (modalDialog.offsetHeight > window.innerHeight ?
                0 : (window.innerHeight - modalDialog.offsetHeight) / 2);

            this._modalStyle = {
                position: 'absolute',
                margin: 'auto',
                top: top,
                left: 0,
                bottom: 0,
                right: 0,
                opacity: 1
            };

            this.forceUpdate();
        }
    }

    render() {
        const {
            // show,
            onCancel
        } = this.props;

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>
                        <Modal.Header>
                            <Modal.Title>Video Call request sent. Waiting for a response.</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <div className="d-flex justify-content-center mb-3">
                                <Button
                                    style={bttn}
                                    variant="dark"
                                    onClick={onCancel}>
                                    Cancel Request
                                </Button>
                            </div>

                            <div style={imageRootStyle}>
                                <img
                                    ref={this.image}
                                    alt=""
                                    crossOrigin="anonymous"
                                    src={null}
                                    style={imageStyle}
                                    className="" />
                            </div>
                        </Modal.Body>
                    </Modal.Dialog>
                </div>
            </Fragment>
        );

        /* return (
            <Modal
                centered
                keyboard={false}
                backdrop="static"
                show={show}
                onEnter={() => busy.update(true)}
                onExit={() => busy.update(false)}
                onHide={onCancel}>

                <Modal.Header closeButton>
                    <Modal.Title>Video Call request sent. Waiting for a response.</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="d-flex justify-content-center mb-3">
                        <Button
                            variant="danger"
                            onClick={onCancel}>
                            Cancel Request
                        </Button>
                    </div>

                    <div style={imageRootStyle}>
                        <img
                            ref={this.image}
                            alt=""
                            crossOrigin="anonymous"
                            src={null}
                            style={imageStyle}
                            className="" />
                    </div>
                </Modal.Body>
            </Modal>
        ); */
    }
}

CallerModal.propTypes = {
    callee: PropTypes.object,
    // show: PropTypes.bool,
    onCancel: PropTypes.func
};

export default CallerModal;
