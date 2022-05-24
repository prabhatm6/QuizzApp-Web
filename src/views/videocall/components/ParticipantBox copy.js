import React, { Component } from "react";
import { MdMicOff, MdMic, MdOutlinePeople, MdVideocam, MdVideocamOff } from "react-icons/md";
import { toast } from "react-toastify";
import { VaniEvent, MessagePayload } from "vani-meeting-client";
import VideoHandler from "../utilities/VideoHandler"
export default class ParticipantBox extends Component {
  constructor(props) {
    super(props);

    this.participant = props.participant;
    this.state = {
      isAudioBlocked: !this.participant.isAudioEnable,
      isVideoBlocked: !this.participant.isVideoEnable
    }
    this.onAudioVideoStatusUpdated = this.onAudioVideoStatusUpdated.bind(this)
    this.blockUnblockUserVideo = this.blockUnblockUserVideo.bind(this)
    this.blockUnblockUserMic = this.blockUnblockUserMic.bind(this)
  }
  componentDidMount() {
    VideoHandler.getInstance().getMeetingHandler().getEventEmitter().on(VaniEvent.OnAudioVideoStatusUpdated, this.onAudioVideoStatusUpdated)
  }
  componentWillUnmount() {
    VideoHandler.getInstance().getMeetingHandler().getEventEmitter().off(VaniEvent.OnAudioVideoStatusUpdated, this.onAudioVideoStatusUpdated)

  }
  onAudioVideoStatusUpdated(participant) {
    if (participant.userId === this.participant.userId) {
      this.setState({
        isAudioBlocked: !this.participant.isAudioEnable,
        isVideoBlocked: !this.participant.isVideoEnable
      })
    }

  }
  blockUnblockUserMic() {
    console.log("blockUnblockUserMic");
    if (this.state.isAudioBlocked) {
      toast("Audio is already muted")
      // VideoHandler.getInstance().getMeetingHandler().unmute(this.participant.userId)
    }
    else {

      const messagePayload = new MessagePayload(
        "PauseAudio",
        this.participant.userId
      );
      messagePayload.type = "PauseAudio";
      VideoHandler.getInstance()
        .getMeetingHandler()
        .sendMessage(messagePayload);
        this.setState({ isAudioBlocked: !this.state.isAudioBlocked })

    }
  }
  blockUnblockUserVideo() {
    console.log("blockUnblockUserVideo");
    if (this.state.isVideoBlocked) {
      toast("Video is already paused")
      // VideoHandler.getInstance().getMeetingHandler().resumeCamera(this.participant.userId)

    }
    else {
      const messagePayload = new MessagePayload(
        "PauseVideo",
        this.participant.userId
      );
      messagePayload.type = "PauseVideo";
      VideoHandler.getInstance()
        .getMeetingHandler()
        .sendMessage(messagePayload);
        this.setState({ isVideoBlocked: !this.state.isVideoBlocked })

    }
  }
  render() {
    return (
      <div className="box_info">
        <div className="box_name">
          <MdOutlinePeople color="#000" size={25} />
          <p>{this.participant.userData.name}</p>
        </div>
        {(VideoHandler.getInstance().getMeetingRequest().isAdmin && VideoHandler.getInstance().getMeetingRequest().userId !== this.participant.userId) &&

          <div className="box_actions">
            {this.state.isVideoBlocked ?
              <MdVideocamOff onClick={this.blockUnblockUserVideo}
                size={25}
                style={{
                  marginLeft: 5,
                }}
              /> : <MdVideocam onClick={this.blockUnblockUserVideo}
                size={25}
                style={{
                  marginLeft: 5,
                }}
              />}

            {this.state.isAudioBlocked ?
              <MdMicOff onClick={this.blockUnblockUserMic}
                size={25}
                style={{
                  marginLeft: 5,
                }}
              /> : <MdMic onClick={this.blockUnblockUserMic}
                size={25}
                style={{
                  marginLeft: 5,
                }}
              />}
          </div>}
      </div>
    );
  }
}
