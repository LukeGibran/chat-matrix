import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Image, Navbar, Button } from 'react-bootstrap';
import camMicAccessPNG from '../../images/cam_mic_access.png';

const titleRootStyle = {
    fontFamily: 'Gotham Rounded',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontSize: '1.25em'
};

const bttn = {
    backgroundColor: '#C5C8C8',
    borderColor: '#C5C8C8'
};

class UserMediaBlockedModal extends React.Component {
    componentDidMount() {
        const { isUserMediaAllowed, onLogOut } = this.props;
        setTimeout(() => {
            if (!isUserMediaAllowed) {
                onLogOut();
            }
        }, 5000);
    }

    render () {
        const { show, onLogOut } = this.props;
        return (
            <Modal
                centered
                keyboard={false}
                backdrop="static"
                show={show}>
                <Navbar
                    expand="lg"
                    variant="light"
                    bg="light"
                    fixed="top">
                    <div
                        style={titleRootStyle}
                        className="m-0 text-secondary">
                        THE CHAT MATRIX
                    </div>

                    <Button
                        style={bttn}
                        variant="secondary"
                        className="ml-auto"
                        onClick={onLogOut}>
                        Log Out
                    </Button>
                </Navbar>
                <Modal.Body className="text-justify">
                    <p>
                        Please allow camera access and microphone access
                        (by changing your browser settings for this website),
                        then <b>reload</b> this page.
                        You can usually give access by first pressing the far left area of
                        your browser's address bar. The area to press is marked red in the picture below.
                    </p>

                    <Image
                        fluid
                        src={camMicAccessPNG}
                        className="w-100" />
                </Modal.Body>

            </Modal>
        );
    }
}

UserMediaBlockedModal.propTypes = {
    show: PropTypes.bool,
    onLogOut: PropTypes.func,
    isUserMediaAllowed: PropTypes.bool
};

export default UserMediaBlockedModal;
