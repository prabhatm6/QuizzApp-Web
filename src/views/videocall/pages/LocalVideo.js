import React, { Component } from "react";
import { VaniEvent } from "vani-meeting-client";
import VideoHandler from "../utilities/VideoHandler";
import VideoHolderModel from "../utilities/VideoHolderModel";
import VideoBox from "../components/VideoBox";
import { TrackKind } from "vani-meeting-client/lib/model/Track";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/index.css";
import {
    MdMic,
    MdMicOff,
    MdVideocam,
    MdVideocamOff,
    MdCallEnd,
    MdContentCopy,
    MdOutlinePeopleAlt,
} from "react-icons/md";
import Setting from "../components/Setting";
import Utility from "../utilities/Utility";
import ParticipantBox from "../components/ParticipantBox";
import { CModal, CModalBody } from "@coreui/react";
export default class LocalVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoHoldersModels: [],
            micOff: true,
            videoOff: true,
            showSetting: false,
            participantWindow: false,
            allParticipants: [],
        };
        this.onTrack = this.onTrack.bind(this);
        this.onTrackEnded = this.onTrackEnded.bind(this);
        this.onPermissionError = this.onPermissionError.bind(this);
        this.onPermissionApproved = this.onPermissionApproved.bind(this);
        this.onUserLeft = this.onUserLeft.bind(this);
        this.onAllParticipants = this.onAllParticipants.bind(this);
        this.switchVideo = this.switchVideo.bind(this);
        this.switchMic = this.switchMic.bind(this);
    }
    componentDidMount() {
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnTrack, this.onTrack);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnTrackEnded, this.onTrackEnded);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnPermissionApproved, this.onPermissionApproved);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnPermissionError, this.onPermissionError);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .startLocalStream(true, true);
    }
    onPermissionApproved() {
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .off(VaniEvent.OnPermissionApproved, this.onPermissionApproved);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .off(VaniEvent.OnPermissionError, this.onPermissionError);
        this.state.videoHoldersModels.push(
            new VideoHolderModel(
                VideoHandler.getInstance()
                    .getMeetingHandler()
                    .participantByUserId(
                        VideoHandler.getInstance().getMeetingRequest().userId
                    ),
                "Main",
                true
            )
        );
        this.setState({
            videoHoldersModels: [...this.state.videoHoldersModels],
        });
    }
    onPermissionError() {
        alert("Please Allow Permission");
    }
    switchVideo() {
        if (this.state.videoOff) {
            if (
                VideoHandler.getInstance()
                    .getMeetingHandler()
                    .participantByUserId(
                        VideoHandler.getInstance().getMeetingRequest().userId
                    ).isVideoBlockedByAdmin
            ) {
                toast("Video Blocked");
            } else {
                VideoHandler.getInstance().getMeetingHandler().resumeCamera();
                VideoHandler.getInstance().isVideoPaused = false;
            }
        } else {
            VideoHandler.getInstance().getMeetingHandler().pauseCamera();
            VideoHandler.getInstance().isVideoPaused = true;
        }
    }
    switchMic() {
        if (this.state.micOff) {
            if (
                VideoHandler.getInstance()
                    .getMeetingHandler()
                    .participantByUserId(
                        VideoHandler.getInstance().getMeetingRequest().userId
                    ).isAudioBlockedByAdmin
            ) {
                toast("Audio Blocked");
            } else {
                VideoHandler.getInstance().getMeetingHandler().unmute();
                VideoHandler.getInstance().isAudioPaused = false;
            }
        } else {
            VideoHandler.getInstance().getMeetingHandler().muteUser();
            VideoHandler.getInstance().isAudioPaused = true;
        }
    }
    onTrack(track) {
        console.log("onTrack 12344");
        if (track.isLocalTrack && track.trackKind === TrackKind.Video) {
            this.setState({ videoOff: false });
        } else if (track.isLocalTrack && track.trackKind === TrackKind.Audio) {
            this.setState({ micOff: false });
        }
    }
    onTrackEnded(track) {
        if (track.isLocalTrack && track.trackKind === TrackKind.Video) {
            this.setState({ videoOff: true });
        } else if (track.isLocalTrack && track.trackKind === TrackKind.Audio) {
            this.setState({ micOff: true });
        }
    }
    onAllParticipants(allParticipants) {
        console.log("onAllParticipants", allParticipants);
        if (allParticipants.length > 0) {
            allParticipants.forEach((participant) => {
                this.checkAndAddUser(participant, "Main");
            });
        }
    }
    onUserLeft(participant) {
        console.log("onUserLeft", participant);
        if (participant.isAdmin) {
            this.props.endCall();
            return;
        }
        const videos = this.state.videoHoldersModels.filter(
            (videoHoldersModel) =>
                videoHoldersModel.participant.userId !== participant.userId
        );
        this.setState({ videoHoldersModels: [...videos] });
        this.setState({
            allParticipants: this.getAllApprovedParticipants(),
        });
    }

    renderClassOnVideos = () => {
        switch (this.state.videoHoldersModels.length) {
            case 1:
                return "one";
            case 2:
                return "two";
            case 3:
                return "three";
            default:
                return "default-grid";
        }
    };

    render() {
        return (
            <div className={`vani-video-container`}>
                {/* <ToastContainer /> */}

                <div className={`video-wrap ${this.renderClassOnVideos()}`}>
                    {this.state.videoHoldersModels.map((_videoHoldersModel) => {
                        return (
                            <div className="video_wrap">
                                <VideoBox
                                    key={_videoHoldersModel.participant.userId}
                                    videoHolderModel={_videoHoldersModel}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="action-btn">
                    <div className="btn" onClick={this.switchMic}>
                        {this.state.micOff ? (
                            <MdMicOff size={25} />
                        ) : (
                            <MdMic size={25} />
                        )}
                    </div>

                    <div className="btn" onClick={this.switchVideo}>
                        {this.state.videoOff ? (
                            <MdVideocamOff size={25} />
                        ) : (
                            <MdVideocam size={25} />
                        )}
                    </div>
                    <div
                        className="btn danger"
                        onClick={this.props.setconfirmationModel}
                    >
                        <MdCallEnd size={25} />
                    </div>
                    {/* <div className="btn" onClick={this.toggleSetting}>
            <MdSettings size={25} />
          </div> */}
                    <div className="btn" onClick={this.copyLink}>
                        <MdContentCopy size={25} />
                    </div>
                    <div
                        className="btn"
                        onClick={() => {
                            this.toggleParticipats();
                        }}
                    >
                        <MdOutlinePeopleAlt
                            size={25} /* onClick={this.togglePopup} */
                        />
                    </div>
                </div>
                {this.state.showSetting ? (
                    <Setting
                        toggleSetting={this.toggleSetting}
                        showSetting={this.state.showSetting}
                    />
                ) : null}
                <CModal
                    show={this.state.participantWindow}
                    closeOnBackdrop={false}
                    onClose={() => this.toggleParticipats()}
                    color="danger"
                    centered
                >
                    <CModalBody className="model-bg">
                        <div>
                            <div className="modal-body">
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => this.toggleParticipats()}
                                >
                                    <span aria-hidden="true">
                                        <img
                                            alt=""
                                            src="./murabbo/img/close.svg"
                                        />
                                    </span>
                                </button>
                                <div className="model_data">
                                    <div className="model-title">
                                        <h3>Members</h3>
                                    </div>

                                    <div className="container">
                                        {this.state.allParticipants.map(
                                            (participant) => {
                                                return (
                                                    <ParticipantBox
                                                        participant={
                                                            participant
                                                        }
                                                        key={participant.userId}
                                                    />
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CModalBody>
                </CModal>
                {/* {this.state.participantWindow && (
                    <div
                        className="popup-box"
                        ref={(ref) => (this.partRef = ref)}
                        onClick={(e) => {
                            this.dismissPartOutSide(e);
                        }}
                    >
                        <div className="box">
                            <p
                                style={{
                                    textAlign: "center",
                                    fontSize: 20,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    marginBottom: 20,
                                }}
                            >
                                Participants
                            </p>
                            {this.state.allParticipants.map((participant) => {
                                return (
                                    <ParticipantBox
                                        participant={participant}
                                        key={participant.userId}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )} */}
            </div>
        );
    }
}
