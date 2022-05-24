import React, { Component } from "react";
import VisibilitySensor from "react-visibility-sensor";
import { VaniEvent } from "vani-meeting-client";
import { Track, TrackKind } from "vani-meeting-client/lib/model/Track";
import { MdMicOff } from 'react-icons/md'
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";
import VideoHandler from "../utilities/VideoHandler";
import AudioWave from "./AudioWave";
// const AudioWave = React.lazy(() => import("./AudioWave"));

export default class VideoBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videoTrack: undefined,
      audioTrack: undefined,
      isAudioEnable: true,
      isVideoEnable: true
    };

    this.videoHolderModel = props.videoHolderModel;
    this.onAudioVideoStatusUpdated = this.onAudioVideoStatusUpdated.bind(this)
    this.registerEventHandler = this.registerEventHandler.bind(this);
    this.unregisterEventHandler = this.unregisterEventHandler.bind(this);
    this.onTrack = this.onTrack.bind(this);
    this.onTrackEnded = this.onTrackEnded.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }
  componentDidMount() {
    this.registerEventHandler();
    if (this.videoHolderModel) {
      if (
        this.videoHolderModel.participant.userId ===
        VideoHandler.getInstance().getMeetingRequest().userId
      ) {
        this.isLocal = true;
      }
      console.log(this.videoHolderModel.participant.userId);
      const tracks = VideoHandler.getInstance()
        .getMeetingHandler()
        .getTracksByParticipantId(this.videoHolderModel.participant.userId);

      tracks.forEach((track) => {
        this.onTrack(track);
      });
      this.onAudioVideoStatusUpdated (this.videoHolderModel.participant)
    }
  }
  componentWillUnmount() {
    this.unregisterEventHandler();
  }
  registerEventHandler() {
    VideoHandler.getInstance()
      .getMeetingHandler()
      .getEventEmitter()
      .on(VaniEvent.OnTrack, this.onTrack);
    VideoHandler.getInstance()
      .getMeetingHandler()
      .getEventEmitter()
      .on(VaniEvent.OnAudioVideoStatusUpdated, this.onAudioVideoStatusUpdated);
    VideoHandler.getInstance()
      .getMeetingHandler()
      .getEventEmitter()
      .on(VaniEvent.OnTrackEnded, this.onTrackEnded);
  }
  unregisterEventHandler() {
    VideoHandler.getInstance()
      .getMeetingHandler()
      .getEventEmitter()
      .off(VaniEvent.OnTrack, this.onTrack);
    VideoHandler.getInstance()
      .getMeetingHandler()
      .getEventEmitter()
      .off(VaniEvent.OnTrackEnded, this.onTrackEnded);
    VideoHandler.getInstance()
      .getMeetingHandler()
      .getEventEmitter()
      .off(VaniEvent.OnAudioVideoStatusUpdated, this.onAudioVideoStatusUpdated);
  }
  onAudioVideoStatusUpdated(participant) {
    if (participant.userId === this.videoHolderModel.participant.userId) {
      this.setState({
        isAudioEnable: participant.isAudioEnable,
        isVideoEnable: participant.isVideoEnable,
      });
    }
  }
  onTrackEnded(track) {
    if (track.participant.userId === this.videoHolderModel.participant.userId) {
      if (this.videoHolderModel.videoHolderModelType === "Main") {
        if (track.trackKind === TrackKind.Video) {
          this.setState({ videoTrack: undefined });
        } else if (track.trackKind === TrackKind.Audio) {
          this.setState({ audioTrack: undefined });
        }
      }
    }
  }

  onTrack(track) {
    console.log("onTrack  123");

    if (track.participant.userId === this.videoHolderModel.participant.userId) {
      if (
        this.videoHolderModel.videoHolderModelType === "Main" &&
        (track.trackKind === TrackKind.Video ||
          track.trackKind === TrackKind.Audio)
      ) {
        if (track.trackKind === TrackKind.Audio) {
          this.setState({ audioTrack: track });
        } else if (track.trackKind === TrackKind.Video) {
          // WebrtcCallHandler.getInstance().getMeetingHandler().updateSpatialForTrack(track,0)
          this.setState({ videoTrack: track });
          // if (!track.isLocalTrack) {
          //   this.props.isFullScreenView
          //     ? VideoHandler.getInstance()
          //         .getMeetingHandler()
          //         .updateSpatialForTrack(track, 1)
          //     : VideoHandler.getInstance()
          //         .getMeetingHandler()
          //         .updateSpatialForTrack(track, 0);
          // }
        }
      } else if (
        this.videoHolderModel.videoHolderModelType === "Screenshare" &&
        (track.trackKind === TrackKind.ScreenshareVideo ||
          track.trackKind === TrackKind.ScreenshareAudio)
      ) {
        if (
          !track.isLocalTrack &&
          track.trackKind === TrackKind.ScreenshareAudio
        ) {
          this.setState({ audioTrack: track });
        } else if (track.trackKind === TrackKind.ScreenshareVideo) {
          this.setState({ videoTrack: track });
        }
      }
    }
  }

  onVisibilityChange(isVisible) {
    // if (!this.isLocal) {
    //   console.log("isVisible ", isVisible);
    //   // this.setState({ isBoxVisible: isVisible });
    //   if (!isVisible) {
    //     if (this.state.videoTrack) {
    //       VideoHandler.getInstance()
    //         .getMeetingHandler()
    //         .pauseIncomingTrack(this.state.videoTrack);
    //     }
    //   } else {
    //     if (this.state.videoTrack) {
    //       VideoHandler.getInstance()
    //         .getMeetingHandler()
    //         .resumeIncomingTrack(this.state.videoTrack);
    //     }
    //   }
    // }
  }
  render() {
    return (
      <VisibilitySensor
        onChange={this.onVisibilityChange}
        partialVisibility={true}
      >
        {({ isVisible }) => {
          return (
            <>
              {this.state.videoTrack && this.state.videoTrack.track ? (
                <VideoPlayer
                  key={this.state.videoTrack.track.id}
                  isLocal={
                    this.isLocal &&
                    this.videoHolderModel?.videoHolderModelType === "Main"
                  }
                  track={this.state.videoTrack.track}
                />
              ) : (
                <div className="participants-avatar">
                  <span>
                    {this.props.videoHolderModel.participant.userData.name
                      ? this.props.videoHolderModel.participant.userData.name[0]
                      : ""}
                  </span>
                </div>
              )}
              <div className="status-icon">
                {(!this.state.audioTrack || !this.state.audioTrack.track || !this.state.isAudioEnable) && (
                  <MdMicOff size={22} color="#fff" />
                )}
                {isVisible && this.state.audioTrack && this.state.audioTrack.track && (
                  <AudioWave audioTrack={this.state.audioTrack.track} />
                )}
              </div>
              <div className="participant-name">
                <p>
                  {this.props.videoHolderModel.participant.userData.name
                    ? this.props.videoHolderModel.participant.userData.name
                    : ""}
                </p>
              </div>

              {this.state.audioTrack &&
                this.state.audioTrack.track &&
                !this.isLocal && (
                  <AudioPlayer
                    key={this.state.audioTrack.track.id}
                    track={this.state.audioTrack.track}
                  />
                )}
            </>
          );
        }}
      </VisibilitySensor>
    );
  }
}
