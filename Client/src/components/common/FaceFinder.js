/* eslint-disable  */
import PropTypes from "prop-types";
import queryString from "query-string";
import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import pico from "../../lib/pico";
import AvatarCaptureModal from "./AvatarCaptureModal";
import utils from "./utils";
import * as nsfwjs from "nsfwjs";

const faceFinderUrl =
  "https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder";

const videoRootStyle = {
  opacity: 0,
  width: 480,
  height: 360,
  position: "absolute",
  top: 0,
  left: 0
};

const videoStyle = {
  width: 480,
  height: 360
};

const UserVideo = React.forwardRef((props, ref) => (
  <div style={videoRootStyle}>
    <video ref={ref} playsInline autoPlay style={videoStyle} />
  </div>
));

function getJSONP(url, success) {
  var ud = "_" + +new Date(),
    script = document.createElement("script"),
    head = document.getElementsByTagName("head")[0] || document.documentElement;

  window[ud] = function(data) {
    head.removeChild(script);
    success && success(data);
  };

  script.src = url.replace("callback=?", "callback=" + ud);
  head.appendChild(script);
}

getJSONP(
  "https://soundcloud.com/oembed?url=http%3A//soundcloud.com/forss/flickermood&format=js&callback=?",
  function(data) {
    console.log(data);
  }
);
class FaceFinder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPicoReady: false,
      isButtonDisabled: true,
      error: null
    };

    this.canvas = React.createRef();
    this.video = React.createRef();

    this.updateMemory = null;
    this.classifyRegion = null;
    this.animationFrameId = null;
    this.numFacesFound = 0;
    this.isVideoReady = false;
    this.isFindingFace = false;
    this.isAnalyzing = false;
    this.errorTimeout = null;

    this._isMounted = false;
    this._detectFace = true;
  }

  componentDidMount() {
    const query = queryString.parse(this.props.location.search);

    this._isMounted = true;
    // this._detectFace =
    //   query.detect_face !== undefined && query.detect_face !== null;
    this.updateMemory = pico.instantiate_detection_memory(5);

    fetch(faceFinderUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        if (!this._isMounted) {
          return;
        }

        const bytes = new Int8Array(buffer);
        this.classifyRegion = pico.unpack_cascade(bytes);

        this.setState({ isPicoReady: true });
      });
  }

  componentDidUpdate() {
    if (this.isFindingFace || this.isAnalyzing) {
      return;
    }

    const { stream } = this.props;
    const canvas = this.canvas.current;
    const video = this.video.current;

    if (stream && video && !this.isVideoReady) {
      video.srcObject = stream;

      utils
        .isVideoReady(video)
        .then(() => {
          this.isVideoReady = true;
          this.setState({ isButtonDisabled: false });
        })
        .catch(error => console.log(error));
      return;
    }

    if (this.isVideoReady && canvas) {
      this.isFindingFace = true;
      const ctx = canvas.getContext("2d");

      const loop = () => {
        this.findFace(video, ctx);

        this.animationFrameId = requestAnimationFrame(loop);
      };

      loop();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.isVideoReady = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  findFace(video, ctx) {
    let sx = 0;
    let sy = 0;
    const sWidth = video.videoWidth;
    let sHeight = video.videoHeight;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    if (sHeight > sWidth) {
      sHeight = Math.round(sWidth * 0.75);
      sy = Math.round((video.videoHeight - sHeight) / 2);
    }

    ctx.drawImage(
      video,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    const rgba = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const image = {
      pixels: this.rgbaToGrayscale(rgba, canvasHeight, canvasWidth),
      nrows: canvasHeight,
      ncols: canvasWidth,
      ldim: canvasWidth
    };


    const params = {
      shiftfactor: 0.1,
      scalefactor: 1.1,
      minsize: 100,
      maxsize: 1000
    };

    let dets = pico.run_cascade(image, this.classifyRegion, params);
    dets = this.updateMemory(dets);
    dets = pico.cluster_detections(dets, 0.2);

    this.numFacesFound = 0;

    for (let i = 0; i < dets.length; ++i) {
      if (dets[i][3] > 50.0) {
        this.numFacesFound++;

        const xCenter = dets[i][1];
        const yCenter = dets[i][0];
        const size = dets[i][2];
        const x = xCenter - size / 2;
        const y = yCenter - size / 2;

        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        ctx.stroke();
      }
    }
  }

  capture() {
    const imageWidth = 320;
    const imageHeight = 320;
    const video = this.video.current;
    const canvas = document.createElement("canvas");
    const sx = 0;
    let sy = 0;
    const sWidth = video.videoWidth;
    let sHeight = video.videoHeight;

    if (sHeight > sWidth) {
      sHeight = Math.round(sWidth * 0.75);
      sy = Math.round((video.videoHeight - sHeight) / 2);
    }

    canvas
      .getContext("2d")
      .drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

    var outCanvas = document.createElement("canvas");
    outCanvas.width = imageWidth;
    outCanvas.height = imageHeight;

    outCanvas.getContext("2d").drawImage(canvas, 0, 0, imageWidth, imageHeight);
    
    return outCanvas;
  }


  rgbaToGrayscale(rgba, nrows, ncols) {
    const gray = new Uint8Array(nrows * ncols);

    for (let r = 0; r < nrows; ++r) {
      for (let c = 0; c < ncols; ++c) {
        gray[r * ncols + c] =
          (2 * rgba[r * 4 * ncols + 4 * c + 0] +
            7 * rgba[r * 4 * ncols + 4 * c + 1] +
            1 * rgba[r * 4 * ncols + 4 * c + 2]) /
          10;
      }
    }

    return gray;
  }

 sendCapturedAvatar(avatar) {
    this.isFindingFace = false;
    cancelAnimationFrame(this.animationFrameId);
    this.props.onFind(avatar);
  }


 checkNudity(avatar) {
  this.isAnalyzing = true;
    // Load model from my S3.
    // See the section hosting the model files on your site.
    nsfwjs.load().then( (model)=> {
      model.classify(avatar).then( predictions => {
          this.isAnalyzing= false;
          // Classify the image
          if ((parseFloat(predictions[1].probability) > 0.5)){
            this.setState({
              isButtonDisabled: true,
              error: "Inappropriate. \n Please try again."
            });
            this.errorTimeout = setTimeout(() => {
              this.errorTimeout = null;
              this.setState({
                error: null,
                isButtonDisabled: false
              });
            }, 5000);
          }
          else {
            this.sendCapturedAvatar(avatar.toDataURL("image/jpeg"));
          }
        } );
})
}

  handleModalContinue = () => {
    if (this.state.isButtonDisabled) {
      return;
    }
    const { isVIP } = this.props;
    const capturedAvatar = this.capture();
    // if face detection is disabled, it continues
    if (!this._detectFace) {
      // if face detection is disabled, it sends null avatar
      this.sendCapturedAvatar(null);
    } else {
      // does an action depending on the number of faces
      if (this.numFacesFound === 1 ) {     
       this.checkNudity(capturedAvatar);
       if (!this.isAnalyzing){
         console.log(" no esta analizando ");
        /* if ( !this.nudity) {
          this.sendCapturedAvatar(capturedAvatar.toDataURL("image/jpeg"));
        } */
    }
    else{
      console.log("please wait while we analyze your photo");
    }
      } else if (this.numFacesFound > 1) { // ty is true at first, i don't want execution before ty analisis
        this.setState({
          isButtonDisabled: true,
          error: "Only one person can be in the camera view."
        });

        this.errorTimeout = setTimeout(() => {
          this.errorTimeout = null;

          this.setState({
            error: null,
            isButtonDisabled: false
          });
        }, 5000);
      } else if (this.numFacesFound === 0 ) {
        if (isVIP) {
          this.setState({
            isButtonDisabled: true,
            error: "Face not detected.\nPlease try again."
          });

          this.errorTimeout = setTimeout(() => {
            this.errorTimeout = null;
            this.setState({
              error: null,
              isButtonDisabled: false
            });
          }, 5000);
        } else {
          this.setState({
            isButtonDisabled: true
          });

          this.errorTimeout = setTimeout(() => {
            this.errorTimeout = null;
            this.setState({
              error: null,
              isButtonDisabled: false
            });
          }, 5000);
        }
      }
    }
  };

  handleModalCancel = () => {
    if (this.state.isButtonDisabled) {
      return;
    }
  };

  render() {
    const { isPicoReady, isButtonDisabled, error} = this.state;

    const { stream, avatar, isVIP } = this.props;

    if (isPicoReady === false || stream === null) {
      return null;
    }

    return (
      <Fragment>
        {!avatar && <UserVideo ref={this.video} />}

        {this.isVideoReady && !avatar && (
          <AvatarCaptureModal
            isVIP={isVIP}
            canvasRef={this.canvas}
            stream={stream}
            disabled={isButtonDisabled}
            onContinue={this.handleModalContinue}
            onCancel={this.handleModalCancel}
            error={error}
          />
        )}
      </Fragment>
    );
  }
}

FaceFinder.propTypes = {
  avatar: PropTypes.string,
  stream: PropTypes.object,
  location: PropTypes.object,
  isVIP: PropTypes.bool,
  onFind: PropTypes.func
};

export default withRouter(FaceFinder);
