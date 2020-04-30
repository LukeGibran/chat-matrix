import React, { Component, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "open-iconic/font/css/open-iconic-bootstrap.css";
const Home = lazy(() => import("./components/Home"));
const HomePrivate = lazy(() => import("./components/HomePrivate"));
const Guest = lazy(() => import("./components/guest/Guest"));
const VIPDashboard = lazy(() => import("./components/vip/VIPDashboard"));
const Confirm = lazy(() => import("./components/vip/Confirm"));
const TermsConfirm = lazy(() => import("./components/vip/TermsConfirm"));
const StripeConfirm = lazy(() => import("./components/vip/StripeConfirm"));
const Data = lazy(() => import("./components/vip/Data"));
const Unqualified = lazy(() => import("./components/vip/Unqualified"));
const Unqualified2 = lazy(() => import("./components/vip/Unqualified2"));
const TermsOfUse = lazy(() => import("./components/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const Contact = lazy(() => import("./components/Contact"));
const ReportBug = lazy(() => import("./components/ReportBug"));
const VIPProfile = lazy(() => import("./components/guest/VIPProfile"));
const NotFound = lazy(() => import("./components/NotFound"));
const PaymentInfo = lazy(() => import("./components/common/PaymentInfo"));
import utils from "./components/common/utils";
import MessageModal from "./components/common/MessageModal";

class App extends Component {
    render() {
        if (!utils.isWebRTCSupported) {
            const message = utils.isIOS ?
                `Your current web browser is not supported. 
                    Please use the Safari web browser. 
                    If you are already using Safari, you may need to update your iOS 
                    software or use another device instead.` :
                `Your current web browser is not supported. 
                    Please update your browser or use a different browser. 
                    You may need to use another device instead.`;

            return <MessageModal message={message} />;
        }

        return (
            <Router>
                <Suspense fallback={<div>Loading...</div>}>
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
                        <Route
                            path="/vip/terms-and-conditions"
                            exact
                            component={NotFound}
                        />
                        <Route path="/vip/data" exact component={Data} />
                        <Route path="/vip/unqualified" exact component={Unqualified} />
                        <Route
                            path="/vip/unqualified_beta"
                            exact
                            component={Unqualified2}
                        />
                        <Route path="/b823a745/e4a6c13b" exact component={HomePrivate} />
                        <Route path="/:username" exact component={VIPProfile} />
                        <Route component={NotFound} />
                    </Switch>
                </Suspense>
            </Router>
        );
    }
}

export default App;
