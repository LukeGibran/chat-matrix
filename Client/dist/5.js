(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{727:function(e,t,n){"use strict";var o=null,r={setIO:function(e){o=e},update:function(e){null!==o&&o.emit("UPDATE_BUSY_STATUS",e)}};t.a=r},728:function(e,t,n){"use strict";var o=n(1),r=n.n(o),a=n(6),c=n.n(a),i=n(311),l=n(715),s=n(727);function u(e){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function f(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function m(e,t){return(m=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function p(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,o=h(e);if(t){var r=h(this).constructor;n=Reflect.construct(o,arguments,r)}else n=o.apply(this,arguments);return b(this,n)}}function b(e,t){return!t||"object"!==u(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function h(e){return(h=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var d={position:"fixed",top:0,left:0,bottom:0,right:0,backgroundColor:"#000",opacity:.5,zIndex:1040},y={position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:1040},v={backgroundColor:"#C5C8C8",borderColor:"#C5C8C8"},g=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&m(e,t)}(u,e);var t,n,a,c=p(u);function u(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,u),(t=c.call(this,e)).modalDialog=r.a.createRef(),t._modalStyle={position:"absolute",margin:0,top:0,left:0,opacity:0},t}return t=u,(n=[{key:"componentDidMount",value:function(){s.a.update(!0),this.calculateModalPosition()}},{key:"componentWillUnmount",value:function(){s.a.update(!1)}},{key:"calculateModalPosition",value:function(){var e=this.modalDialog.current;if(e){var t=e.offsetHeight>window.innerHeight?0:(window.innerHeight-e.offsetHeight)/2;this._modalStyle={position:"absolute",margin:"auto",top:t,left:0,bottom:0,right:0,opacity:1},this.forceUpdate()}}},{key:"render",value:function(){var e=this.props,t=e.message,n=e.resolveLabel,a=e.rejectLabel,c=e.onResolve,s=e.onReject;return r.a.createElement(o.Fragment,null,r.a.createElement("div",{style:d}),r.a.createElement("div",{style:y},r.a.createElement(i.a.Dialog,{size:"sm",ref:this.modalDialog,className:"px-1",style:this._modalStyle},r.a.createElement(i.a.Body,{className:"text-center text-dark"},r.a.createElement("p",{className:"lead mt-3"},t)),r.a.createElement(i.a.Footer,null,void 0!==c&&r.a.createElement(l.a,{size:"lg",variant:"primary",className:"ml-auto w-100",onClick:c},n||"Yes"),void 0!==s&&r.a.createElement(l.a,{style:v,size:"lg",variant:"dark",className:"mr-auto w-100",onClick:s},a||"No")))))}}])&&f(t.prototype,n),a&&f(t,a),u}(o.Component);g.propTypes={message:c.a.string,resolveLabel:c.a.string,rejectLabel:c.a.string,onResolve:c.a.func,onReject:c.a.func},t.a=g},746:function(e,t,n){"use strict";n.r(t),function(e){var o=n(1),r=n.n(o),a=n(716),c=n(207),i=n(141),l=n(728),s=n(206),u=n(699),f=n.n(u);function m(e){return(m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function p(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function b(e,t){return(b=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function h(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,o=v(e);if(t){var r=v(this).constructor;n=Reflect.construct(o,arguments,r)}else n=o.apply(this,arguments);return d(this,n)}}function d(e,t){return!t||"object"!==m(t)&&"function"!=typeof t?y(e):t}function y(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function v(e){return(v=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}n(700).config();var g=function(t){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&b(e,t)}(d,t);var n,o,u,m=h(d);function d(e){var t,n,o,r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,d),t=m.call(this,e),n=y(t),r=function(){window.location.href="/chat"},(o="handleVIPLogin")in n?Object.defineProperty(n,o,{value:r,enumerable:!0,configurable:!0,writable:!0}):n[o]=r,t.state={browserPCDetect:!1,browserAndroidDetect:!1,message:null,internetDisconnect:!1,internetDisconnectMessage:"Your internet has disconnected",internetReconnect:!1,internetReconnectMessage:"Your internet has reconnected"},t.handleConnectionChange=t.handleConnectionChange.bind(y(t)),t.onFailed=t.onFailed.bind(y(t)),t.onSuccess=t.onSuccess.bind(y(t)),t}return n=d,(o=[{key:"componentDidMount",value:function(){var e=this;this.browserPCDetectHandler(),this.browserAndroidDetectHandler(),window.addEventListener("online",this.handleConnectionChange),"offline"===localStorage.getItem("connectChange")&&(this.setState({internetDisconnect:!0}),setTimeout((function(){e.setState({internetDisconnect:!1}),localStorage.removeItem("connectChange")}),2e3))}},{key:"handleConnectionChange",value:function(e){var t=this;"online"===e.type&&(this.setState({internetReconnect:!0}),setTimeout((function(){t.setState({internetReconnect:!1}),window.location.reload()}),2e3))}},{key:"browserPCDetectHandler",value:function(){var e=r.a.createElement("h5",{className:"mb-0"},"Please use The Chat Matrix in the"," ",r.a.createElement("a",{href:"https://www.google.com/chrome/"},"Google Chrome")," web browser.");this.setState({message:e}),i.a.browserPCDetect&&this.setState({browserPCDetect:!0})}},{key:"browserAndroidDetectHandler",value:function(){var e=r.a.createElement("h5",{className:"mb-0"},"Please use The Chat Matrix in the"," ",r.a.createElement("a",{href:"https://www.google.com/chrome/"},"Google Chrome")," web browser.");this.setState({message:e}),i.a.browserAndroidDetect&&this.setState({browserAndroidDetect:!0})}},{key:"onSuccess",value:function(e){e.json().then((function(e){alert(JSON.stringify(e))}))}},{key:"onFailed",value:function(e){alert(e)}},{key:"render",value:function(){var t=this,n=this.state,o=n.browserPCDetect,u=n.browserAndroidDetect,m=n.message,p=n.internetDisconnect,b=n.internetDisconnectMessage,h=n.internetReconnect,d=n.internetReconnectMessage;return"".concat(i.a.serverURL,"/api/v1/auth/twitter"),"".concat(i.a.serverURL,"/api/v1/auth/twitter/reverse"),r.a.createElement("div",{className:"home-root"},r.a.createElement(f.a,{consumerKey:e.env.CONSUMER_KEY,consumerSecret:e.env.CONSUMER_SECRET,authCallback:function(e,t){console.log(e,t)},callbackUrl:e.env.CALLBACK_URL}),r.a.createElement("div",{className:"home d-flex flex-column align-items-center justify-content-center text-center text-white px-2"},r.a.createElement("div",{className:"title mb-4"},"THE CHAT MATRIX"),r.a.createElement("div",{className:"lead mb-4"},r.a.createElement("strong",null,"1-to-1 video calls")),r.a.createElement("div",{className:"lead mb-4"},r.a.createElement("strong",null,"Simply select a person you want a video call with")),r.a.createElement(c.b,{to:"/chat",id:"start-button",className:"btn btn-warning btn-lg mt-md-3 mt-sm-1 mt-0 mb-md-4 mb-sm-1 mb-0 pt-3"},"Start Now"),r.a.createElement("div",{className:"mt-4 mb-4"},r.a.createElement(a.a,null,r.a.createElement(c.b,{to:"/terms-of-use"},r.a.createElement("small",null,"Terms of Use")),r.a.createElement(c.b,{to:"/privacy-policy",className:"px-3"},r.a.createElement("small",null,"Privacy Policy")),r.a.createElement(c.b,{to:"/contact"},r.a.createElement("small",null,"Contact Us")),r.a.createElement(c.b,{to:"/report-bug",className:"px-3"},r.a.createElement("small",null,"Report Bug")))),r.a.createElement("footer",null,r.a.createElement("div",{className:"text-center text-white"},r.a.createElement("small",null,"Copyright ©. All rights reserved.")))),o&&m&&r.a.createElement(l.a,{message:m,resolveLabel:"Okay",onResolve:function(){t.setState({message:null})}}),u&&m&&r.a.createElement(s.a,{message:m}),p&&r.a.createElement(s.a,{message:b}),h&&r.a.createElement(s.a,{message:d}))}}])&&p(n.prototype,o),u&&p(n,u),d}(o.Component);t.default=g}.call(this,n(25))}}]);