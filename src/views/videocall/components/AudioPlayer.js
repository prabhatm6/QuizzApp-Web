import React from "react";
import { Component } from "react";


export default class AudioPlayer extends Component {
  constructor(props) {
    super(props);
    this.audioPlayer = React.createRef();
  }

  componentDidMount() {
    if (
      this.audioPlayer !== null &&
      this.audioPlayer.current !== null &&
      this.props.track &&
      this.props.track !== null
    ) {
      this.audioPlayer.current.srcObject = new MediaStream([this.props.track]);
    } else if (
      this.audioPlayer !== null &&
      this.audioPlayer.current !== null &&
      (!this.props.track || this.props.track === null)
    ) {
      this.audioPlayer.current.srcObject = null;
    }
  }

  render() {
    return <audio playsInline autoPlay ref={this.audioPlayer}></audio>;
  }
}
