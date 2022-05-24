class VideoHolderModel {
    participant;

    tracks;

    containsAudio;

    videoHolderModelType;

    isPinned;

    isSelf;

    constructor(participant, videoHolderModelType, isSelf) {
      this.participant = participant
      this.videoHolderModelType = videoHolderModelType
      if (this.videoHolderModelType === 'ScreenShare') {
        this.isPinned = true
      } else {
        this.isPinned = false
      }

      this.containsAudio = false
      this.isSelf = isSelf
    }
}

export default VideoHolderModel
