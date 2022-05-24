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
export default class DuringVideoCall extends Component {
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
        this.copyLinkContent = ""
        this.onNewChatMessageReceived =
            this.onNewChatMessageReceived.bind(this);
        this.onInitDone = this.onInitDone.bind(this);
        this.onPermissionApproved = this.onPermissionApproved.bind(this);
        this.onPermissionError = this.onPermissionError.bind(this);
        this.onSocketConnected = this.onSocketConnected.bind(this);
        this.onTrack = this.onTrack.bind(this);
        this.onTrackEnded = this.onTrackEnded.bind(this);
        this.checkAndAddUser = this.checkAndAddUser.bind(this);
        this.onUserLeft = this.onUserLeft.bind(this);
        this.downloadCopyLinkContent = this.downloadCopyLinkContent.bind(this)
        this.onUserJoined = this.onUserJoined.bind(this);
        this.onAllParticipants = this.onAllParticipants.bind(this);
        this.switchVideo = this.switchVideo.bind(this);
        this.switchMic = this.switchMic.bind(this);
        this.copyLink = this.copyLink.bind(this);
        this.getAllApprovedParticipants =
            this.getAllApprovedParticipants.bind(this);
        this.onVideoUnblocked = this.onVideoUnblocked.bind(this);
        this.onVideoBlocked = this.onVideoBlocked.bind(this);
        this.onAudioBlocked = this.onAudioBlocked.bind(this);
        this.onAudioUnblocked = this.onAudioUnblocked.bind(this);
        this.onParticipantDataUpdated =
            this.onParticipantDataUpdated.bind(this);
    }
    componentDidMount() {
        console.log("roomid", this.props);
        // if (!VideoHandler.getInstance().getMeetingRequest() || VideoHandler.getInstance().getMeetingRequest() === null) {
        //   window.location = window.location.origin + "?vm=" + Utility.getRoomIdForMeeting();
        //   return
        // }
        const roomId = this.props.roomId
            ? this.props.roomId
            : this.props.history.location.search.substring(1);

        if (roomId) {
            if (
                VideoHandler.getInstance()
                    .getMeetingHandler()
                    .isWebScoketConnected()
            ) {
                VideoHandler.getInstance()
                    .getMeetingHandler()
                    .getEventEmitter()
                    .on(VaniEvent.OnTrack, this.onTrack);
                VideoHandler.getInstance()
                    .getMeetingHandler()
                    .getEventEmitter()
                    .on(VaniEvent.OnTrackEnded, this.onTrackEnded);
                this.onInitDone();
            } else {
                VideoHandler.getInstance().setup(
                    roomId,
                    { name: JSON.parse(localStorage.getItem("userData")).name },
                    this.props.isModerator
                );
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
                    .on(VaniEvent.OnInitDone, this.onInitDone);

                VideoHandler.getInstance().getMeetingHandler().init();
            }
        }
        this.downloadCopyLinkContent()
    }
    onInitDone() {
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
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnAllParticipants, this.onAllParticipants);

        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnPermissionApproved, this.onPermissionApproved);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnPermissionError, this.onPermissionError);
        if (
            VideoHandler.getInstance().isVideoPaused &&
            VideoHandler.getInstance().isAudioPaused
        ) {
            this.onPermissionApproved();
        } else {
            VideoHandler.getInstance()
                .getMeetingHandler()
                .startLocalStream(
                    !VideoHandler.getInstance().isVideoPaused,
                    !VideoHandler.getInstance().isAudioPaused
                );
        }
    }
    onPermissionError() {
        alert("Please Allow Permission");
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

        if (
            VideoHandler.getInstance()
                .getMeetingHandler()
                .isWebScoketConnected()
        ) {
            this.onSocketConnected();
        } else {
            VideoHandler.getInstance()
                .getMeetingHandler()
                .getEventEmitter()
                .on(VaniEvent.OnSocketConnected, this.onSocketConnected);
            VideoHandler.getInstance().getMeetingHandler().checkSocket();
        }
    }

    onSocketConnected() {
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .off(VaniEvent.OnSocketConnected, this.onSocketConnected);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(
                VaniEvent.OnNewChatMessageReceived,
                this.onNewChatMessageReceived
            );

        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(
                VaniEvent.OnParticipantDataUpdated,
                this.onParticipantDataUpdated
            );
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnUserLeft, this.onUserLeft);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnUserJoined, this.onUserJoined);

        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnVideoUnblocked, this.onVideoUnblocked);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnAudioUnblocked, this.onAudioUnblocked);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnVideoBlocked, this.onVideoBlocked);
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(VaniEvent.OnAudioBlocked, this.onAudioBlocked);

        VideoHandler.getInstance().getMeetingHandler().startMeeting();
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getUpdatedParticipantsListFromServer();
    }
    onNewChatMessageReceived(messagePayload) {
        if (messagePayload.type === "PauseVideo") {
            VideoHandler.getInstance().getMeetingHandler().pauseCamera();
        } else if (messagePayload.type === "PauseAudio") {
            VideoHandler.getInstance().getMeetingHandler().muteUser();
        }
    }
    onAudioBlocked(participant) {
        if (
            participant.userId ===
            VideoHandler.getInstance().getMeetingRequest().userId
        ) {
            toast("Audio Blocked");
        }
    }
    onVideoBlocked(participant) {
        if (
            participant.userId ===
            VideoHandler.getInstance().getMeetingRequest().userId
        ) {
            toast("Camera Blocked");
        }
    }
    onAudioUnblocked(participant) {
        if (
            participant.userId ===
            VideoHandler.getInstance().getMeetingRequest().userId
        ) {
            toast("Audio Unblocked");
        }
    }
    onVideoUnblocked(participant) {
        if (
            participant.userId ===
            VideoHandler.getInstance().getMeetingRequest().userId
        ) {
            toast("Camera Unblocked");
        }
    }

    onParticipantDataUpdated(participant) {
        this.onUserJoined(participant);
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
    getAllApprovedParticipants() {
        return VideoHandler.getInstance()
            .getMeetingHandler()
            .getAllParticipants()
            .filter((participant) => participant.userData.isApproved === true);
    }
    onUserJoined(participant) {
        this.checkAndAddUser(participant, "Main");
        this.setState({
            allParticipants: this.getAllApprovedParticipants(),
        });
    }
    checkAndAddUser(participant, viewHolderType) {
        if (participant.userData.isApproved) {
            const alreadyExitModel = this.state.videoHoldersModels.find(
                (viewHolder) =>
                    viewHolder.participant.userId === participant.userId &&
                    viewHolder.videoHolderModelType === viewHolderType
            );
            if (!alreadyExitModel) {
                this.state.videoHoldersModels.unshift(
                    new VideoHolderModel(
                        participant,
                        viewHolderType,
                        participant.userId ===
                            VideoHandler.getInstance().getMeetingRequest()
                                .userId
                    )
                );
                this.setState({
                    videoHoldersModels: [...this.state.videoHoldersModels],
                });
            }
        }
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
            }
        } else {
            VideoHandler.getInstance().getMeetingHandler().pauseCamera();
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
            }
        } else {
            VideoHandler.getInstance().getMeetingHandler().muteUser();
        }
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
    toggleSetting = () => {
        this.setState({ showSetting: !this.state.showSetting });
    };
    toggleParticipats = () => {
        this.setState({
            participantWindow: !this.state.participantWindow,
            allParticipants: this.getAllApprovedParticipants(),
        });
    };

    dismissPartOutSide = (e) => {
        e.target === this.partRef && this.props.setopenModelForMembers(false);
    };
    async downloadCopyLinkContent(){
        const response = await fetch(
            " https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyDg-UszS6Y5Qj3xmY2YQun-6wv2dXwO2Rk",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dynamicLinkInfo: {
                        domainUriPrefix: "https://murabbo.page.link",
                        link: window.location.href,
                        androidInfo: {
                            androidPackageName: "com.cozycrater.murabbo",
                        },
                        iosInfo: {
                            iosBundleId: "com.cozycrater.murabbo",
                        },
                    },
                }),
            }
        )
        const res = await response.json();
        this.copyLinkContent = res.shortLink
    }
    async copyLink() {
        await navigator.clipboard.writeText(this.copyLinkContent);
        this.props.openModelForInviteFriend(true);
    }
    togglePopup() {
        this.setState({ participant: !this.state.participant });
    }
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
