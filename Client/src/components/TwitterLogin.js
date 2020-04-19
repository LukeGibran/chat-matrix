/* eslint-disable  */
import React from "react";
import TwitterLogin from "react-twitter-login";
 
export default props => {
  const authHandler = (err, data) => {
    console.log(err, data);
  };
 
  return (
    <TwitterLogin
      consumerKey={process.env.CONSUMER_KEY}
      consumerSecret={process.env.CONSUMER_SECRET}
      authCallback={authHandler}
      callbackUrl={process.env.CALLBACK_URL}
    />
  );
};