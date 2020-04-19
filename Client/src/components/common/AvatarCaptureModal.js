/* eslint-disable */

import React from "react";
import { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import utils from "../common/utils";

const canvasDivStyle = {
  paddingTop: "75%"
};

const canvasStyle = {
  top: 0
};

const errorDivStyle = {
  whiteSpace: "pre-line",
  top: 0,
  backgroundColor: "rgba(0, 0, 0, 0.75)"
};

const errorDivClasses = `position-absolute d-flex align-items-center justify-content-center 
    text-danger text-center w-100 h-100`;

const bttn = {
  backgroundColor: "#C5C8C8",
  borderColor: "#C5C8C8"
};

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  backgroundColor: "#000",
  opacity: 0.5,
  zIndex: 1040
};

const modalRootStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 1040
};

const DrawingCanvas = React.forwardRef((props, ref) => (
  <canvas
    ref={ref}
    width={480}
    height={360}
    style={canvasStyle}
    className="position-absolute w-100 h-100"
  />
));

class AvatarCaptureModal extends Component {
  constructor(props) {
    super(props);

    this.modalDialog = React.createRef();

    this._modalStyle = {
      position: "absolute",
      margin: 0,
      top: 0,
      left: 0,
      opacity: 0
    };

    this._timeout = null;
  }

  componentDidMount() {
    const { isVIP } = this.props;
    this.calculateModalPosition();
    this._timeout = setTimeout(() => {
      this._timeout = null;
      if (isVIP) {
        window.open("https://instagram.com/accounts/logout", "_blank");
        window.location.href = `${utils.serverURL}/v/vip/logout`;
      } else {
        window.location.href = "/";
      }
    }, 120000);
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }

  calculateModalPosition() {
    const modalDialog = this.modalDialog.current;
    const top =
      modalDialog.offsetHeight > window.innerHeight
        ? 0
        : (window.innerHeight - modalDialog.offsetHeight) / 2;
    if (modalDialog) {
      this._modalStyle = {
        position: "absolute",
        top: top,
        margin: "auto",
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
      canvasRef,
      // show,
      disabled,
      error,
      onContinue,
      onCancel
    } = this.props;

    return (
      <Fragment>
        <div style={backdropStyle} />

        <div style={modalRootStyle}>
          <Modal.Dialog
            ref={this.modalDialog}
            className="px-1"
            style={this._modalStyle}
          >
            <Modal.Header>
              <Modal.Title>This is how other people will see you.</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <div className="d-flex justify-content-center mb-3">
                <Button
                  style={bttn}
                  variant="dark"
                  className="mr-3"
                  disabled={disabled}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={disabled}
                  onClick={onContinue}
                >
                  Continue
                </Button>
              </div>

              <div
                style={canvasDivStyle}
                className="position-relative w-100 bg-dark"
              >
                <DrawingCanvas ref={canvasRef} />

                {error && (
                  <div className={errorDivClasses} style={errorDivStyle}>
                    <h4>{error}</h4>
                  </div>
                )}
              </div>

              <div>
                  <p className="mb-0 mt-2 text-justify">
                    Please use headphones. If you cannot hear noise from your
                    device right now when you speak, this means your microphone
                    is currently inactive, and nobody will be able to hear you
                    during a video call.{" "}
                  </p>

              </div>
            </Modal.Body>
          </Modal.Dialog>
        </div>
      </Fragment>
    );
  }
}

AvatarCaptureModal.propTypes = {
  error: PropTypes.string,
  // show: PropTypes.bool,
  isVIP: PropTypes.bool,
  canvasRef: PropTypes.object,
  location: PropTypes.object,
  disabled: PropTypes.bool,
  onCancel: PropTypes.func,
  onContinue: PropTypes.func
};

export default AvatarCaptureModal;
