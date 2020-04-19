import React from 'react';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';


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

class MessageModal extends Component {
    constructor(props) {
        super(props);

        this.modalDialog = React.createRef();

        // default modal style
        this._modalStyle = {
            position: 'absolute',
            minWidth: '18rem',
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
            let top = 0;

            if (modalDialog.offsetHeight <= window.innerHeight) {
                top = (window.innerHeight - modalDialog.offsetHeight) / 2;
            }

            this._modalStyle = {
                position: 'absolute',
                minWidth: '20rem',
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
            message
        } = this.props;

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>
                        <Modal.Body className="text-center text-dark p-4">
                            <h5 className="mb-0">{message}</h5>
                        </Modal.Body>
                    </Modal.Dialog>
                </div>
            </Fragment>
        );
    }
}

MessageModal.propTypes = {
    // show: PropTypes.bool,
    message: PropTypes.string
};

export default MessageModal;
