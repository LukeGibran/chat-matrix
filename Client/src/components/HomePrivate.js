/* eslint-disable  */
import React, { Component } from "react";
import { ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
//import twitterIcon from '../images/twitter-icon.png';
import utils from "./common/utils";
import GenericModal from "./common/GenericModal";
import MessageModal from "./common/MessageModal";
import TwitterLogin from "react-twitter-login";


require("dotenv").config();


const vipLoginStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  padding: 0,
  margin: 0,
  cursor: "pointer"
};

class HomePrivate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      browserPCDetect: false,
      browserAndroidDetect: false,
      message: null,
      internetDisconnect: false,
      internetDisconnectMessage: "Your internet has disconnected",
      internetReconnect: false,
      internetReconnectMessage: "Your internet has reconnected"
    };
    this.handleConnectionChange = this.handleConnectionChange.bind(this);
    // ver
    this.onFailed = this.onFailed.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
  }

  componentDidMount() {
    this.browserPCDetectHandler();
    this.browserAndroidDetectHandler();
    window.addEventListener("online", this.handleConnectionChange);
    if (localStorage.getItem("connectChange") === "offline") {
      this.setState({ internetDisconnect: true });
      setTimeout(() => {
        this.setState({ internetDisconnect: false });
        localStorage.removeItem("connectChange");
      }, 2000);
    }
  }

  // show modal dialogue when the internet reconnects
  handleConnectionChange(event) {
    if (event.type === "online") {
      this.setState({ internetReconnect: true });
      setTimeout(() => {
        this.setState({ internetReconnect: false });
        window.location.reload();
      }, 2000);
    }
  }

  handleVIPLogin = () => {
    window.location.href = "/chat";
    /*     window.location.href = `https://api.instagram.com/oauth/authorize
        ?client_id=${process.env.INSTAGRAM_CLIENT_ID}
        &redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}
        &scope=user_profile,user_media
        &response_type=code`; */
    // window.location.href = `${utils.serverURL}/a/auth/instagram`;
  };

  // detect non-chrome browsers for PC
  browserPCDetectHandler() {
    const message = (
      <h5 className="mb-0">
        Please use The Chat Matrix in the{" "}
        <a href="https://www.google.com/chrome/">Google Chrome</a> web browser.
      </h5>
    );
    this.setState({ message: message });
    if (utils.browserPCDetect) {
      this.setState({ browserPCDetect: true });
    }
  }

  browserAndroidDetectHandler() {
    const message = (
      <h5 className="mb-0">
        Please use The Chat Matrix in the{" "}
        <a href="https://www.google.com/chrome/">Google Chrome</a> web browser.
      </h5>
    );
    this.setState({ message: message });
    if (utils.browserAndroidDetect) {
      this.setState({ browserAndroidDetect: true });
    }
  }

  // ver onsuccess y onfailed
  onSuccess(response) {
    response.json().then(body => {
      alert(JSON.stringify(body));
    });
  }

  onFailed(error) {
    alert(error);
  }

  ////////// LIFECYCLE METHODS
  render() {
    const {
      browserPCDetect,
      browserAndroidDetect,
      message,
      internetDisconnect,
      internetDisconnectMessage,
      internetReconnect,
      internetReconnectMessage
    } = this.state;
    const styles =
      "home d-flex flex-column align-items-center justify-content-center text-center text-white px-2";

    const customHeader = {};
    customHeader["Test"] = "test-header";
    const loginUrl =  `${utils.serverURL}/api/v1/auth/twitter`;
    const requestTokenUrl = `${utils.serverURL}/api/v1/auth/twitter/reverse`;
      const authHandler = (err, data) => {
        console.log(err, data);
      };
     
     
    return (
      <div className="home-root">
         <TwitterLogin
          consumerKey={process.env.CONSUMER_KEY}
          consumerSecret={process.env.CONSUMER_SECRET}
          authCallback={authHandler}
          callbackUrl={process.env.CALLBACK_URL}
        />

  

        <div className={styles}>
          <div className="title mb-4">THE CHAT MATRIX</div>
          <div className="lead mb-4">
            <strong>1-to-1 video calls</strong>
          </div>
          <div className="lead mb-4">
            <strong>Simply select a person you want a video call with</strong>
          </div>

          <Link
            to="/chat"
            id="start-button"
            className="btn btn-warning btn-lg mt-md-3 mt-sm-1 mt-0 mb-md-4 mb-sm-1 mb-0 pt-3"
          >
            Start Now
          </Link>
          
<div className="mt-4 mb-4">
                        <ButtonGroup>
                            <Link to="/terms-of-use">
                                <small>Terms of Use</small>
                            </Link>
                            <Link to="/privacy-policy" className="px-3">
                                <small>Privacy Policy</small>
                            </Link>
                            <Link to="/contact">
                                <small>Contact Us</small>
                            </Link>
                            <Link to="/report-bug" className="px-3">
                                <small>Report Bug</small>
                            </Link>
                        </ButtonGroup>
                    </div>

          <footer>
            <div className="text-center text-white">
              <small>Copyright ©. All rights reserved.</small>
            </div>
          </footer>
        </div>
        {browserPCDetect && message && (
          <GenericModal
            message={message}
            resolveLabel="Okay"
            onResolve={() => {
              this.setState({ message: null });
            }}
          />
        )}

        {browserAndroidDetect && message && <MessageModal message={message} />}

        {internetDisconnect && (
          <MessageModal message={internetDisconnectMessage} />
        )}

        {internetReconnect && (
          <MessageModal message={internetReconnectMessage} />
        )}
      </div>
    );
  }
}

export default HomePrivate;
