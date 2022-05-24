import hark from "hark";
import React from "react";
import { Component, Suspense } from "react";
import Lottie from "react-lottie";

export default class AudioWave extends Component {
  // speechEvents: hark.Harker;
  constructor(props) {
    super(props);
    this.state = {
      isUserSpeaking: false,
    };
    this.lottieOptions = {
      loop: true,
      autoplay: true,
      animationData: require("./hark.json"),
    };
    this.speechEvents = hark(new MediaStream([this.props.audioTrack]));

    this.onSpeaking = this.onSpeaking.bind(this);
    this.onStopSpeaking = this.onStopSpeaking.bind(this);
  }

  componentDidMount() {
    this.speechEvents.on("speaking", this.onSpeaking);

    this.speechEvents.on("stopped_speaking", this.onStopSpeaking);
  }

  componentWillUnmount() {
    this.speechEvents.stop();
  }

  onSpeaking() {
    this.setState({ isUserSpeaking: true });
  }

  onStopSpeaking() {
    this.setState({ isUserSpeaking: false });
  }

  render() {
    return (
      <div className="wave-wrap">
        {/* <Suspense fallback={<SmallSuspense />}> */}
        <Lottie
          options={this.lottieOptions}
          height={30}
          width={20}
          eventListeners={[]}
          isStopped={!this.state.isUserSpeaking}
          style={{ display: this.state.isUserSpeaking ? "block" : "none" }}
        />
        {/* </Suspense> */}
      </div>
    );
  }
}
