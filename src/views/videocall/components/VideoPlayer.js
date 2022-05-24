import React from "react";
import { Component } from "react";


export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.videoPlayer = React.createRef();
  }

  componentDidMount() {
    console.log("componentDidMount");

    if (
      this.videoPlayer !== null &&
      this.videoPlayer.current !== null &&
      this.props.track &&
      this.props.track !== null
    ) {
      this.videoPlayer.current.srcObject = new MediaStream([this.props.track]);
    } else if (
      this.videoPlayer !== null &&
      this.videoPlayer.current !== null &&
      (!this.props.track || this.props.track === null)
    ) {
      this.videoPlayer.current.srcObject = null;
    }
  }

  render() {
    return (
      <video
      className = {this.props.isLocal ? 'flip video' : 'video'} 
        playsInline
        autoPlay
        muted
        ref={this.videoPlayer}
      ></video>
    );
  }
}
