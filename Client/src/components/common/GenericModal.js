import React from 'react';
import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import busy from '../common/busy';
//import utils from '../common/utils';

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

class GenericModal extends Component {
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
        //this.timer();
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
            message,
            resolveLabel,
            rejectLabel,
            onResolve,
            onReject
        } = this.props;

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        size="sm"
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>
                        <Modal.Body className="text-center text-dark">
                            <p className="lead mt-3">{message}</p>
                        </Modal.Body>

                        <Modal.Footer>
                            {onResolve !== undefined &&
                                <Button size="lg" variant="primary"
                                    className="ml-auto w-100" onClick={onResolve}>
                                    {resolveLabel || 'Yes'}
                                </Button>
                            }

                            {onReject !== undefined &&
                                <Button style={bttn} size="lg" variant="dark"
                                    className="mr-auto w-100" onClick={onReject}>
                                    {rejectLabel || 'No'}
                                </Button>
                            }
                        </Modal.Footer>

                    </Modal.Dialog>
                </div>
            </Fragment>
        );
    }
}

/* function GenericModal(props) {
    const {
        show,
        message,
        resolveLabel,
        rejectLabel,
        onResolve,
        onReject
    } = props;

    return (
        <Modal
            centered
            keyboard={false}
            backdrop="static" size="sm"
            onEnter={() => busy.update(true)} onExit={() => busy.update(false)}
            show={show}>

            <Modal.Body className="text-center text-dark">
                <p className="lead mt-3">{message}</p>
            </Modal.Body>

            <Modal.Footer>
                {onResolve !== undefined &&
                    <Button size="lg" variant="success"
                        className="ml-auto w-100" onClick={onResolve}>
                        {resolveLabel || 'Yes'}
                    </Button>
                }

                {onReject !== undefined &&
                    <Button size="lg" variant="danger"
                        className="mr-auto w-100" onClick={onReject}>
                        {rejectLabel || 'No'}
                    </Button>
                }
            </Modal.Footer>

        </Modal>
    );
} */

GenericModal.propTypes = {
    // show: PropTypes.bool,
    message: PropTypes.string,
    resolveLabel: PropTypes.string,
    rejectLabel: PropTypes.string,
    onResolve: PropTypes.func,
    onReject: PropTypes.func
};

export default GenericModal;
