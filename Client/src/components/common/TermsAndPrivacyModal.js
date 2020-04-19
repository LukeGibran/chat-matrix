import React from 'react';
import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

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

class TermsAndPrivacyModal extends Component {
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
        this.calculateModalPosition();
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
            onYes,
            onNo
        } = this.props;

        const termsLink = <a href="/terms-of-use" target="_blank">here</a>;
        const privacyLink = <a href="/privacy-policy" target="_blank">here</a>;

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        size="sm"
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>
                        <Modal.Body className="text-center">
                            <p className="lead">
                                Do you completely understand and completely agree with all of the content in
                                the links {termsLink} and {privacyLink}?
                            </p>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button style={bttn1} variant="primary" size="lg"
                                className="ml-auto w-100"
                                onClick={onYes}>
                                Yes
                            </Button>
                            <Button variant="dark" size="lg" style={bttn}
                                className="mr-auto w-100" // before it sais ''mr-auto w-100, the same on yes''
                                onClick={onNo}>
                                No
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </div>

            </Fragment>
        );
    }
}

TermsAndPrivacyModal.propTypes = {
    onYes: PropTypes.func,
    onNo: PropTypes.func
};

export default TermsAndPrivacyModal;
