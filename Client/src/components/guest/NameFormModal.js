import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'react-bootstrap';
import busy from '../common/busy';
import utils from '../common/utils';

let nameCache = null;

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

class NameFormModal extends Component {
    constructor(props) {
        super(props);
        this.input = React.createRef();
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
        this.handleOnEnter();
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
                bottom: 0,
                right: 0,
                opacity: 1
            };

            this.forceUpdate();
        }
    }

    handleOnEnter = () => {
        busy.update(true);
        const input = this.input.current;

        if (!input) {
            return;
        }

        if (nameCache) {
            input.value = nameCache;
        }

        if (!utils.isMobile) {
            input.focus();
        }
        else {
            input.blur(); 
        }
    }

    handleSubmit = (event) => {
        const input = this.input.current;
        nameCache = input.value;
        event.preventDefault();
        // user can use default name
        if (!input.value) {
            input.value = 'Dude';
        }
        this.props.onSubmit(input.value);
    }

    render() {
        const {
            user,
            onCancel
        } = this.props;

        const fullname = (user !== null ? user.fullname : '');
        const message = `Please enter your name below. This will be passed onto ${fullname}. 
        Your name is temporarily stored by The Chat Matrix.`;

        return (
            <Fragment>
                <div style={backdropStyle} />

                <div style={modalRootStyle}>
                    <Modal.Dialog
                        size="sm"
                        ref={this.modalDialog}
                        className="px-1"
                        style={this._modalStyle}>
                        <Modal.Header closeButton onHide={onCancel} />
                        <Modal.Body className="text-center">
                            <p className="lead">{message}</p>

                            <Form onSubmit={this.handleSubmit}>
                                <Form.Control ref={this.input}
                                    
                                    placeholder="Name" className="font-weight-bold mb-2"
                                    maxLength={15} autoFocus />

                                <Button variant="primary" type="submit"
                                    className="w-100">
                                    Submit
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal.Dialog>
                </div>
            </Fragment >
        );
    }

    /* render() {
        const {
            user,
            show
        } = this.props;

        const fullname = (user !== null ? user.fullname : '');
        const message = `Please enter your name below. This will be passed onto ${fullname}. 
        Your name is temporarily stored by The Chat Matrix.`;

        return (
            <Modal
                centered
                keyboard={false}
                backdrop="static"
                size="sm"
                show={show}
                onEnter={this.handleOnEnter}
                onExit={() => busy.update(false)}>

                <Modal.Body className="text-center">
                    <p className="lead">{message}</p>

                    <Form onSubmit={this.handleSubmit}>
                        <Form.Control ref={this.input}
                            required type="text"
                            placeholder="Name" className="font-weight-bold mb-2"
                            maxLength={15} autoFocus />

                        <Button variant="primary" type="submit"
                            className="w-100">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>

            </Modal>
        );
    } */
}

NameFormModal.propTypes = {
    user: PropTypes.object,
    show: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
};

export default NameFormModal;
