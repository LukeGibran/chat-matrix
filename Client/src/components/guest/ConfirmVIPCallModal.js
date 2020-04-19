import React from 'react';
import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import busy from '../common/busy';

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

const bttn1 = {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF'
};

class ConfirmVIPCallModal extends Component {
    constructor(props) {
        super(props);

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

    componentDidMount() {
        busy.update(true);
        this.calculateModalPosition();
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
                right: 0,
                bottom: 0,
                opacity: 1
            };

            this.forceUpdate();
        }
    }

    render() {
        const {
            user,
            // show,
            onYes,
            onNo
        } = this.props;

        let instagramURL = '';
        let href = '';

        if (user !== null) {
            instagramURL = `instagram.com/${user.username}`;
            href = `https://www.${instagramURL}`;
        }

        const vipTermsLink = <a href="/l/links/vip-video-call-terms-and-conditions" target="_blank">here</a>;

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>

                        <Modal.Header>
                            <Modal.Title>VIP Video Greeting</Modal.Title>
                        </Modal.Header>

                        <Modal.Body className="text-center">
                            <p className="mb-2">
                                You are requesting a very quick greeting (via a live 1-to-1 video call) with
                                the following VIP (Instagram account holder):
                            </p>

                            <p>
                                <a href={href} target="_blank"
                                    rel="noopener noreferrer" >
                                    <strong>{instagramURL}</strong>
                                </a>
                            </p>

                            <p className="mb-2">
                                Do you completely understand and completely agree with all of
                                the content in the link {vipTermsLink}?
                            </p>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button style={bttn1} variant="primary" size="lg"
                                className="mr-3 ml-auto w-100" onClick={onYes}>
                                Yes
                            </Button>

                            <Button style={bttn} variant="dark" size="lg"
                                className="mr-auto w-100" onClick={onNo}>
                                No
                            </Button>
                        </Modal.Footer>
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
                onExit={() => busy.update(false)}>

                <Modal.Header>
                    <Modal.Title>VIP Video Greeting</Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center">
                    <p className="mb-2">
                        You are requesting a very quick greeting (via a live 1-to-1 video call) with
                        the following VIP (Instagram account holder):
                    </p>

                    <p>
                        <a href={href} target="_blank"
                            rel="noopener noreferrer" >
                            <strong>{instagramURL}</strong>
                        </a>
                    </p>

                    <p className="mb-2">
                        Do you completely understand and completely agree with all of
                        the content in the link {vipTermsLink}?
                    </p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="success" size="lg"
                        className="mr-3 ml-auto w-100" onClick={onYes}>
                        Yes
                    </Button>

                    <Button variant="danger" size="lg"
                        className="mr-auto w-100" onClick={onNo}>
                        No
                    </Button>
                </Modal.Footer>
            </Modal>
        ); */
    }
}

ConfirmVIPCallModal.propTypes = {
    user: PropTypes.object,
    // show: PropTypes.bool,
    onYes: PropTypes.func,
    onNo: PropTypes.func
};

export default ConfirmVIPCallModal;
