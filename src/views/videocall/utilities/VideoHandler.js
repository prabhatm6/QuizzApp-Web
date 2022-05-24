import { MeetingHandler, MeetingType } from "vani-meeting-client";
import EventEmitter from "events";
import VaniSetupHelper from "./VaniSetupHelper";
import { reactLocalStorage } from "reactjs-localstorage";
import configuration from "../../../config";

class VideoHandler {
    static instance = new VideoHandler();

    meetingHandler = new MeetingHandler();

    meetingRequest;

    eventEmitter;

    isAdmin;

    roomId;

    messages;

    callMembers;

    isVideoPaused = false;
    isAudioPaused = false;

    static getInstance() {
        if (VideoHandler.instance === null) {
            VideoHandler.instance = new VideoHandler();
        }
        return VideoHandler.instance;
    }

    constructor() {
        this.meetingRequest = undefined;
        this.eventEmitter = new EventEmitter();
        this.isAdmin = false;
        this.roomId = null;
        this.messages = [];
        this.callMembers = [];
        this.isVideoCall = true;
        this.getMeetingRequest = this.getMeetingRequest.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.cleanUp = this.cleanUp.bind(this);
        this.onNewChatMessageReceived =
            this.onNewChatMessageReceived.bind(this);
        // this.onInitDone = this.onInitDone.bind(this)
        // this.onSocketConnected = this.onSocketConnected.bind(this)
    }

    cleanUp() {
        // this.unregisterOfEvents()

        VaniSetupHelper.getInstance().cleanup();
        console.log("Vani CLeanup");
        this.getMeetingHandler().endAndDestory();
        this.meetingRequest = undefined;
        this.messages = [];
        this.callMembers = [];
        this.eventEmitter.removeAllListeners();
        VideoHandler.instance = null;
    }

    setup(roomId, userData, isAdmin) {
        this.isAdmin = isAdmin;
        if (!this.meetingRequest || this.meetingRequest == null) {
            this.meetingRequest =
                this.getMeetingHandler().meetingStartRequestObject(
                    roomId,
                    `${new Date().getTime() + Math.floor(Math.random() * 1000)
                    }`,
                    "Murabbo",
                    process.env.REACT_APP_WSS_URL
                );
            this.meetingRequest.numberOfUsers = 10;
            this.meetingRequest.userData = userData;
            this.meetingRequest.isAdmin = this.isAdmin;
            this.meetingRequest.videoCaptureHeight = 320;
            this.meetingRequest.videoCaptureWidth = 480;
            this.meetingRequest.apiData = { roomEndUrl: configuration.apiURL + "api/game/deleteGameRoomData", data: { roomId: roomId } ,  auth :   "Bearer " + reactLocalStorage.get("clientToken")}
            this.meetingRequest.meetingType = MeetingType.SFU;
            console.log(this.meetingRequest);
        }
    }

    // Check Online offline
    getUserByUserId(userId) {
        const participantById = this.getMeetingHandler()
            .getAllParticipants()
            .find((participant) => participant.userData.id === userId);
        return participantById;
    }

    ///
    onNewChatMessageReceived(messagePayload) {
        this.messages.push(messagePayload);
        this.eventEmitter.emit("onMessageListUpdated", this.messages);
    }

    sendMessage(messagePayload) {
        this.meetingHandler.sendMessage(messagePayload);
        this.onNewChatMessageReceived(messagePayload);
    }

    getMeetingHandler() {
        return this.meetingHandler;
    }

    getMeetingRequest() {
        return this.meetingRequest;
    }
}

export default VideoHandler;
