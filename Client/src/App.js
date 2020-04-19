import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "open-iconic/font/css/open-iconic-bootstrap.css";
import Home from "./components/Home";
import HomePrivate from "./components/HomePrivate";
import Guest from "./components/guest/Guest";
import VIPDashboard from "./components/vip/VIPDashboard";
import Confirm from "./components/vip/Confirm";
import TermsConfirm from "./components/vip/TermsConfirm";
import StripeConfirm from "./components/vip/StripeConfirm";
import Data from "./components/vip/Data";
import Unqualified from "./components/vip/Unqualified";
import Unqualified2 from "./components/vip/Unqualified2";
import TermsOfUse from "./components/TermsOfUse";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Contact from "./components/Contact";
import ReportBug from "./components/ReportBug";
import VIPProfile from "./components/guest/VIPProfile";
import NotFound from "./components/NotFound";
import utils from "./components/common/utils";
import MessageModal from "./components/common/MessageModal";
import PaymentInfo from "./components/common/PaymentInfo";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/chat" exact component={Guest} />
          <Route path="/vip" exact component={VIPDashboard} />
          <Route path="/terms-of-use" exact component={TermsOfUse} />
          <Route path="/privacy-policy" exact component={PrivacyPolicy} />
          <Route path="/contact" exact component={Contact} />
          <Route path="/reportBug" exact component={ReportBug} />
          <Route path="/payment-info" exact component={PaymentInfo} />
          <Route path="/vip/confirm" exact component={Confirm} />
          <Route path="/vip/terms-confirm" exact component={TermsConfirm} />
          <Route path="/vip/stripe-confirm" exact component={StripeConfirm} />
          <Route path="/vip/terms-and-conditions" exact component={NotFound} />
          <Route path="/vip/data" exact component={Data} />
          <Route path="/vip/unqualified" exact component={Unqualified} />
          <Route path="/vip/unqualified_beta" exact component={Unqualified2} />
          <Route path="/b823a745/e4a6c13b" exact component={HomePrivate} />
          <Route path="/:username" exact component={VIPProfile} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    );
  }
}

export default App;
