import React, { Component } from "react";
import {
    MdMicOff,
    MdMic,
    MdOutlinePeople,
    MdVideocam,
    MdVideocamOff,
} from "react-icons/md";
import { toast } from "react-toastify";
import { VaniEvent, MessagePayload } from "vani-meeting-client";
import VideoHandler from "../utilities/VideoHandler";
export default class ParticipantBox extends Component {
    constructor(props) {
        super(props);

        this.participant = props.participant;
        this.state = {
            isAudioBlocked: !this.participant.isAudioEnable,
            isVideoBlocked: !this.participant.isVideoEnable,
        };
        this.onAudioVideoStatusUpdated =
            this.onAudioVideoStatusUpdated.bind(this);
        this.blockUnblockUserVideo = this.blockUnblockUserVideo.bind(this);
        this.blockUnblockUserMic = this.blockUnblockUserMic.bind(this);
    }
    componentDidMount() {
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .on(
                VaniEvent.OnAudioVideoStatusUpdated,
                this.onAudioVideoStatusUpdated
            );
    }
    componentWillUnmount() {
        VideoHandler.getInstance()
            .getMeetingHandler()
            .getEventEmitter()
            .off(
                VaniEvent.OnAudioVideoStatusUpdated,
                this.onAudioVideoStatusUpdated
            );
    }
    onAudioVideoStatusUpdated(participant) {
        if (participant.userId === this.participant.userId) {
            this.setState({
                isAudioBlocked: !this.participant.isAudioEnable,
                isVideoBlocked: !this.participant.isVideoEnable,
            });
        }
    }
    blockUnblockUserMic() {
        console.log("blockUnblockUserMic");
        if (this.state.isAudioBlocked) {
            toast("Audio is already muted");
            // VideoHandler.getInstance().getMeetingHandler().unmute(this.participant.userId)
        } else {
            const messagePayload = new MessagePayload(
                "PauseAudio",
                this.participant.userId
            );
            messagePayload.type = "PauseAudio";
            VideoHandler.getInstance()
                .getMeetingHandler()
                .sendMessage(messagePayload);
            this.setState({ isAudioBlocked: !this.state.isAudioBlocked });
        }
    }
    blockUnblockUserVideo() {
        console.log("blockUnblockUserVideo");
        if (this.state.isVideoBlocked) {
            toast("Video is already paused");
            // VideoHandler.getInstance().getMeetingHandler().resumeCamera(this.participant.userId)
        } else {
            const messagePayload = new MessagePayload(
                "PauseVideo",
                this.participant.userId
            );
            messagePayload.type = "PauseVideo";
            VideoHandler.getInstance()
                .getMeetingHandler()
                .sendMessage(messagePayload);
            this.setState({ isVideoBlocked: !this.state.isVideoBlocked });
        }
    }
    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="_1st2-member two_no">
                        <div className="_1stimg">
                            <div className="memberImg_">
                                <img
                                    alt=""
                                    style={{
                                        height: "50px",
                                        width: "50px",
                                        borderRadius: "50%",
                                    }}
                                    src={
                                        "" === ""
                                            ? `https://ui-avatars.com/api/?name=${this.participant.userData.name}&background=random`
                                            : ""
                                    }
                                />
                            </div>
                            <div className="member_details">
                                <h5
                                    style={{
                                        color: "#fff",
                                        marginBottom: "0 !important",
                                        position: "relative",
                                        top: "10px",
                                    }}
                                >
                                    {this.participant.userData.name}
                                </h5>
                            </div>
                            {VideoHandler.getInstance().getMeetingRequest()
                                .isAdmin &&
                                VideoHandler.getInstance().getMeetingRequest()
                                    .userId !== this.participant.userId && (
                                    <div
                                        className="icons-members"
                                        style={{
                                            top: "18px !important",
                                        }}
                                    >
                                        <img
                                            onClick={this.blockUnblockUserMic}
                                            alt=""
                                            src={
                                                !this.state.isAudioBlocked
                                                    ? "img/mic2.png"
                                                    : "img/mute2.png"
                                            }
                                            width="49px"
                                        />
                                        <img
                                            alt=""
                                            onClick={this.blockUnblockUserVideo}
                                            src={
                                                !this.state.isVideoBlocked
                                                    ? "img/cam2.png"
                                                    : "img/cam-off2.png"
                                            }
                                            width="49px"
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
