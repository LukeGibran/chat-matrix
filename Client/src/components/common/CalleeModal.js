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

class CalleeModal extends Component {
    constructor(props) {
        super(props);

        this.image = React.createRef();
        this.modalDialog = React.createRef();

        this._modalStyle = {
            position: 'absolute',
            margin: 0,
            top: 0,
            left: 0,
            opacity: 0
        };
        this._timeout = null;
    }

    ////////// LIFECYCLE METHODS
    componentDidMount() {
        busy.update(true);
        this.calculateModalPosition();
        //deny request if the call was not resolved after 15s. caller will see the message 'Not available'
        this._timeout = setTimeout(() => {
            this._timeout = null;
            this.props.onDeny();
        }, 15000);
    }

    componentDidUpdate() {
        const { caller } = this.props;
        const image = this.image.current;

        if (caller === null) {
            return;
        }

        if (image !== null) {
            image.src = `/profile/${caller.avatarId}`;

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
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
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
            onAccept,
            onDeny
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
                            <Modal.Title>The person below is requesting a Video Call with you.</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <div className="d-flex justify-content-center mb-3">
                                <Button
                                    variant="primary"
                                    className="mr-3"
                                    onClick={onAccept}>
                                    Accept
                                </Button>

                                <Button
                                    style={bttn}
                                    variant="dark"
                                    onClick={onDeny}>
                                    Deny
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
                onHide={onDeny}>

                <Modal.Header closeButton>
                    <Modal.Title>The person below is requesting a Video Call with you.</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="d-flex justify-content-center mb-3">
                        <Button
                            variant="primary"
                            className="mr-3"
                            onClick={onAccept}>
                            Accept
                        </Button>

                        <Button
                            variant="danger"
                            onClick={onDeny}>
                            Deny
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

CalleeModal.propTypes = {
    caller: PropTypes.object,
    // show: PropTypes.bool,
    onAccept: PropTypes.func,
    onDeny: PropTypes.func
};

export default CalleeModal;
