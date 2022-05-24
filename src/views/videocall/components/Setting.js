import React, { Component } from "react";
import "../css/setting.css";
import VideoHandler from "../utilities/VideoHandler";
import { GetDevicesType } from "vani-meeting-client/lib/user-media-handler/UserMediaHandler";

export default class Setting extends Component {
  constructor() {
    super();
    this.state = {
      cameraDevices: [],
      micDevices: [],
      mic: undefined,

    }
    this.handleMicChange = this.handleMicChange.bind(this);
    this.handleCameraChange = this.handleCameraChange.bind(this);
  }
  async componentDidMount() {
    console.log("componentDidMount");
    this.setState({
      micDevices: await VideoHandler.getInstance()
        .getMeetingHandler()
        .getDevices(GetDevicesType.AudioIn),
      cameraDevices: await VideoHandler.getInstance()
        .getMeetingHandler()
        .getDevices(GetDevicesType.VideoIn)
      , mic: VideoHandler.getInstance().getMeetingRequest().audioInDevice,
      camera: VideoHandler.getInstance().getMeetingRequest().cameraDevice,

    });
  }
  dismissOutside = (e) => {
    e.target === this.setting && this.props.toggleSetting();
  };

  handleMicChange(e) {
    VideoHandler.getInstance().getMeetingRequest().audioInDevice = e.target.value;
    VideoHandler.getInstance()
      .getMeetingHandler()
      .startLocalStream(false, true)
    this.setState({

      mic: VideoHandler.getInstance().getMeetingRequest().audioInDevice,
      camera: VideoHandler.getInstance().getMeetingRequest().cameraDevice,

    });
  }

  handleCameraChange(e) {
    VideoHandler.getInstance().getMeetingRequest().cameraDevice = e.target.value;
    VideoHandler.getInstance()
      .getMeetingHandler()
      .startLocalStream(true, false)
    this.setState({

      mic: VideoHandler.getInstance().getMeetingRequest().audioInDevice,
      camera: VideoHandler.getInstance().getMeetingRequest().cameraDevice,

    });
  }
  render() {
    return (
      <div
        className="setting-wrap"
        style={{
          display: this.props.showSetting ? "flex" : "none",
        }}
        onClick={(e) => {
          this.dismissOutside(e);
        }}
        ref={(ref) => (this.setting = ref)}
      >
        <div className="setting-dlg">
          <select
            onChange={this.handleMicChange}
            value={this.state.mic}
            className="setting-select"
          >
            {this.state.micDevices.map((audioDevice, index) => (
              <option key={audioDevice.id} value={audioDevice.id}>
                {audioDevice.label}
              </option>
            ))}
            {/* <option>Microphone 1</option> */}
          </select>
          <select
            onChange={this.handleCameraChange}
            value={this.state.camera}
            className="setting-select"
          >
            {this.state.cameraDevices.map((videoDevice, index) => (
              <option key={videoDevice.id} value={videoDevice.id}>
                {videoDevice.label}
              </option>
            ))}
            {/* <option>Video 1</option> */}
          </select>
        </div>
      </div>
    );
  }
}
