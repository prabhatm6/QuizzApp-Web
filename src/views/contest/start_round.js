import React, { Component } from "react";
import Room from "../chat/view";
import config from "./../../config";
import { TheFooter, TheHeaderInner } from "../../containers/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import languages from "../../languages";
import configuration from "../../config";
import { reactLocalStorage } from "reactjs-localstorage";
import { CModal, CModalBody } from "@coreui/react";
import $ from "jquery";
import io from "socket.io-client";
import socket from "socket.io-client/lib/socket";
import { indexOf } from "underscore";
import {
  addToken,
  addClientToken,
  addUserData,
  add_is_login,
  addRedirect,
  addReload,
  subscription,
  forgot_email,
} from "../../actions/index";
import {
  joinRoomReqSend,
  setModerator,
  setSocket,
} from "../../actions/socketAction";
import { connect } from "react-redux";
var jwt = require("jsonwebtoken");

let contestId, roundId, roomId, parentContestId;
let userId = JSON.parse(reactLocalStorage.get("userData")).userId;

// const API_URI_2 = `https://dev-api.murabbo.com`;
const API_URI_2 = config.apiURL;
let socket_2;
// if (!socket_2) {
// 	socket_2  = io(API_URI_2, {
// 					forceNew: true,
// 				});}

const mapStateToProps = (state) => {
  return {
    token: state.authReducers.token,
    clientToken: state.authReducers.clientToken,
    forgot_email: state.authReducers.forgot_email,
    is_login: state.authReducers.is_login,
    redirect: state.authReducers.redirect,
    reload: state.authReducers.reload,
    userData: state.authReducers.userData,
    joinRoomReq: state.socketReducers.joinRoomReq,
    isModerator: state.socketReducers.isModerator,
    waitScreen: state.socketReducers.waitScreen,
    socket: state.socketReducers.socket,
    otherUserSteams: state.socketReducers.otherUserSteams,
  };
};
const mapDispatchToProps = (dispatch) => ({
  addToken: (data) => dispatch(addToken(data)),
  addClientToken: (data) => dispatch(addClientToken(data)),
  addUserData: (data) => dispatch(addUserData(data)),
  add_is_login: (data) => dispatch(add_is_login(data)),
  addRedirect: (data) => dispatch(addRedirect(data)),
  addReload: (data) => dispatch(addReload(data)),
  subscription: (data) => dispatch(subscription(data)),
  forgot_email: (data) => dispatch(forgot_email(data)),
  joinRoomReqSend: (date) => dispatch(joinRoomReqSend(date)),
  setModerator: (date) => dispatch(setModerator(date)),
  setSocket: (date) => dispatch(setSocket(date)),
});
class StartRound extends Component {
  constructor(props) {
    super(props);
    let roomUrl = window.location.href;
    let roomId1 = roomUrl.substring(roomUrl.indexOf("?") + 1);
    let joinroomreq = false;
    if (roomId1.indexOf("?") !== -1) {
      roomId1 = roomId1.substring(0, roomId1.indexOf("?"));
      joinroomreq = true;
    }
    this.state = {
      profile_picture: "avatars/placeholder-user.png",
      name: "",
      data: {},
      openModel: false,
      openModelForGiveScore: false,
      contestData: { image: "" },
      roundListArr: [],
      currentIndexRound: 0,
      roundData: {},
      listArr: [],
      selectedAnswer: [],
      indexQuestion: 0,
      indexRound: 0,
      gameId: "",
      roomId: "",
      roomIdd: roomId1,
      freeTextAnswer: "",
      saveExitAnswer: false,
      showRound: true,
      winnerScreen: false,
      showGoLeaderBoardBtn: false,
      totalScore: 0,
      isBalnkRound: false,
      blankRoundObj: {},
      activelistArr: [],
      errors: {},
      fields: {
        title: "",
        description: "",
      },
      newTime: 0,
      contestCreater: false,
      createdBy: "",
      isActive: "",
      isWinnerScreenShow: false,
      openModelForMembers: false,
      unscrambleArr: [],
      item: [],
      indexForUnscrambleAns: 0,
      roomActive: false,
      togglemodel: true,
      width: "49%",
      userId: JSON.parse(reactLocalStorage.get("userData")).userId,
      connectedUserList: [],
      currentAssignedUser: userId,
      roomJoined: false,
      isModerator: false,
      joinroomreq: joinroomreq,
      questionPart: true,
      nextRoundStartForOtherUser: false,
      stopTimer: false,
    };
    this.socketRef = React.createRef();
    this.playContest = this.playContest.bind(this);

    socket_2 = this.props.socket;
    if (!socket_2) {
      socket_2 = io(API_URI_2, {
        forceNew: true,
      });

      this.props.setSocket(socket_2);
    }

    if (window.performance) {
      if (performance.navigation.type == 1) {
        this.props.history.push("/dashboard", { state: null });
        window.location.reload();
        return false;
      } else {
        if (!socket_2) {
          socket_2 = io(API_URI_2);
        }
      }
    }
  }

  componentDidMount() {
    this.getRoomDetails();
    var roomID = this.state.roomIdd;
    var userId = JSON.parse(reactLocalStorage.get("userData")).userId;

    if (this.state.roomActive === false) {
      var postData = {};
      postData.isActive = true;

      fetch(configuration.baseURL + "room/room/" + this.state.roomIdd, {
        method: "put",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
        body: JSON.stringify(postData),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.code === 200) {
            this.setState({ roomActive: true });
          } else {
            return toast.error(data.message);
          }
        });
    }

    //////////socket//////

    console.log("socket_2", socket_2);

    socket_2.on("Connection", () => {
      console.log("Connection for 2");
    });

    // if(!this.state.roomJoined){
    // 	socket_2.emit("join-game-room", {
    // 		userId,
    // 		roomID,
    // 	});
    // 	console.log("new data emit => enter join room => ");
    // 	this.setState({connectedUserList:[...this.state.connectedUserList,userId]});
    // 	this.setState({roomJoined:true});
    // }

    // after some user connected for same game room
    // it will call only for moderator
    // socket_2.on("user-connected-game", ({ userId, username }) => {
    // 	//not finished.
    // 	if(this.state.isModerator){
    // 		this.setState({connectedUserList:[...this.state.connectedUserList,userId]});
    // 	}
    // 	console.log("user-connected-game in",username);
    // });

    // get socket data if moderator click on start any question

    socket_2.on("startQuestion", async (data) => {
      console.log("start question => socket => ", JSON.stringify(data));
      this.setState({
        currentIndexRound: data.roundIndex,
        indexQuestion: data.questionIndex,
        currentAssignedUser: data.userId,
        stopTimer: true,
      });
      if (this.state.indexQuestion == 0) {
        if (
          this.state.currentIndexRound > 0 &&
          this.state.nextRoundStartForOtherUser == false
        ) {
          this.saveExitAnswer();
        } else {
          this.playContest();
        }
      } else {
        setTimeout(() => {
          this.setState({ stopTimer: false });
          this.startTimer();
        }, 2000);
      }
    });

    ///when someone leaves the room
    //still remain somework here
    // socket_2.on("user-disconnected",({userId})=>{
    // 	var userList =  this.state.connectedUserList;
    // 	userList =  userList.map((item)=> item != userId);
    // 	this.setState({connectedUserList:userList});
    // })

    socket_2.on("resultQuestion", ({ resultInfo }) => {
      if (this.props.isModerator) {
        if (
          this.state.roundListArr[this.state.currentIndexRound] !== undefined
        ) {
          if (this.state.listArr[this.state.indexQuestion + 1] == undefined) {
            this.setState({
              indexQuestion: 0,
              currentIndexRound: this.state.currentIndexRound + 1,
            });
          } else {
            this.setState({
              indexQuestion: this.state.indexQuestion + 1,
            });
          }
          // if(this.state.indexQuestion < this.state.listArr.length){
          // 	this.setState({indexQuestion: this.state.indexQuestion+1})
          // }
          console.log(
            "resultQuestion before start moderator" +
              this.state.indexQuestion +
              " indexQuestion"
          );
          this._startRoundModerator();
        }
      }
    });

    // // //////////socket-end//////

    let that = this;
    var token = reactLocalStorage.get("token");
    jwt.verify(token, configuration.appName, function (err, decoded) {
      if (err) {
        decoded = null;
        reactLocalStorage.set("token", "");
        reactLocalStorage.set("userData", "");
        reactLocalStorage.set("is_login", "false");
        reactLocalStorage.set("reload", "true");
        window.location.href = "/#/";
      }
      if (decoded) {
        that.setState({
          profilePic:
            JSON.parse(reactLocalStorage.get("userData")).profilePic === ""
              ? "avatars/placeholder-user.png"
              : JSON.parse(reactLocalStorage.get("userData")).profilePic,
          name: JSON.parse(reactLocalStorage.get("userData")).name,
        });
      }
    });

    var url = window.location.href;
    contestId = url.substring(url.lastIndexOf("/") + 1);
    contestId = contestId.substring(0, contestId.indexOf("?"));
    fetch(
      configuration.baseURL +
        "contest/contest?contestId=" +
        contestId +
        "&v=" +
        1,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.data.length > 0) {
          parentContestId = data.data[0]._id;
          this.setState({ contestData: data.data[0] });

          let createdBy = data.data[0].createdBy;
          this.setState({ createdBy: createdBy });
        }
      });
    this.getList(contestId);

    // if(this.state.roundListArr[this.state.indexRound] !== undefined){
    // 	if(this.state.roundListArr[this.state.indexRound].gameType === "Unscramble"){
    // 		var wordsArr = this.state.unscrambleArr[this.state.indexQuestion];
    // 		var length = wordsArr.length;
    // 		var row = Math.ceil(length/4);
    // 		var item=[];
    // 		for(let k=0;k<row;k++){
    // 			var insideItem=[];
    // 			var l = length - k*4;
    // 			for(let j=0;j<l;j++){
    // 				var a = wordsArr[j+k*4];
    // 				insideItem.push(<div className="flexbox" >{a}</div>);
    // 			}
    // 			item.push(<div className="flexboxbox" >{insideItem}</div>)
    // 		}
    // 		this.setState({item:item})
    // 	}
    // }
  }

  ///////////////socket.......

  // componentWillUnmount(){
  // 	window.addEventListener("beforeunload", event => {
  // 		// Cancel the event as stated by the standard.
  // 		event.preventDefault();
  // 		// Chrome requires returnValue to be set.
  // 		event.returnValue = "";
  // 		let userId = this.state.userId;
  // 		let roomId = this.state.roomIdd;

  // 		console.log("close page");
  // 		console.log("leaving room for => ", userId);
  // 		socket_2.emit("disconnect-user", {
  // 			userId,
  // 			roomId,
  // 		});
  // 	});
  // }

  joinGameRoom() {
    var that = this;
    var roomID = this.state.roomIdd;
    var userId = JSON.parse(reactLocalStorage.get("userData")).userId;

    socket_2.emit("join-game-room", {
      userId,
      roomID,
    });
    console.log("new data emit => enter join room => ");
  }

  _startRoundModerator(check) {
    const userList = this.props.otherUserSteams;
    //still not finish
    this.setState({ stopTimer: true });
    if (check != true && userList.length > 0) {
      const currentAssignedUser = this.state.currentAssignedUser;

      let newUserIdIndex = userList.findIndex(
        (x) => x.joinedUserId == this.state.currentAssignedUser
      );

      console.log("newUserIdIndex 379 => index => old => ", newUserIdIndex);
      console.log("userList 379 => index => old => ", userList);
      console.log(
        "currentAssignedUser 379 => index => old => ",
        currentAssignedUser
      );

      if (newUserIdIndex == -1) {
        newUserIdIndex = 0;
        console.log("newUserIdIndex == -1");
        this.setState({
          currentAssignedUser: userList[newUserIdIndex].joinedUserId,
        });
      } else if (newUserIdIndex === userList.length - 1) {
        this.setState({ currentAssignedUser: userId });
        console.log("newUserIdIndex === (userList.length - 1)");
      } else {
        console.log("newUserIdIndex else,,,.....");
        newUserIdIndex = newUserIdIndex + 1;
        this.setState({
          currentAssignedUser: userList[newUserIdIndex].joinedUserId,
        });
      }
      console.log("newUserIdIndex 393 => index => old => ", newUserIdIndex);
      console.log(
        "currentAssignedUser 393 => index => old => ",
        currentAssignedUser
      );
    } else {
      this.setState({ currentAssignedUser: userId });
    }

    var that = this;

    const gameInfo = {
      questionIndex: this.state.indexQuestion,
      roundIndex: that.state.currentIndexRound,
      userId: this.state.currentAssignedUser,
    };

    const roomID = this.state.roomIdd;
    console.log("current Assigned user 408", this.state.currentAssignedUser);
    socket_2.emit("startRound", { roomID, gameInfo });
    if (this.state.indexQuestion == 0) {
      if (this.state.currentIndexRound > 0 && check != true) {
        console.log("saveExitAnswer start moderator");
        this.saveExitAnswer();
      } else {
        console.log("playcontest start moderator");
        this.playContest();
      }
    } else {
      console.log("startTimer start moderator");
      this.startTimer();
    }
  }

  nextQuestion() {
    let roomID = this.state.roomIdd;
    const resultInfo = {
      questionIndex: 1,
      roundIndex: 1,
      resultStatus: 1,
    };
    socket_2.emit("submitQuestion", { roomID, resultInfo, userId });
  }

  // moderator leave room
  _moderatorLeaveRoom() {
    const roomID = this.state.roomIdd;
    socket_2.emit("disconnect-room", { roomID });
  }

  moderatorNextQue() {
    if (this.state.roundListArr[this.state.currentIndexRound] !== undefined) {
      if (this.state.listArr[this.state.indexQuestion + 1] == undefined) {
        if (
          this.state.roundListArr[this.state.currentIndexRound + 1] !==
          undefined
        ) {
          this.setState({
            indexQuestion: 0,
            currentIndexRound: this.state.currentIndexRound + 1,
          });
        }
      } else {
        this.setState({ indexQuestion: this.state.indexQuestion + 1 });
      }
      // if(this.state.indexQuestion < this.state.listArr.length){cate-box2
      // 	this.setState({indexQuestion: this.state.indexQuestion+1})
      // }
    } else {
    }
    console.log("moderatorNextQue");
    this._startRoundModerator();
  }

  ///////socket-end.......

  getList(contest_id1) {
    if (contest_id1) {
      fetch(configuration.baseURL + "round/round?contestId=" + contest_id1, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.data.length > 0) {
            var data = data.data;
            //    console.log(data);
            this.setState({ roundListArr: data });
            this.plusCount();
            // console.log(this.state.roundListArr[this.state.currentIndexRound]);
          } else {
            this.setState({ roundListArr: [] });
          }
        });
    }

    console.log(this.state.roundListArr);
  }
  selectedRoundId(data) {
    if (this.state.contestData.isPublish) {
      if (data.totalQuestions === 0) {
        return toast.error("There are no have any question in this round!");
      }

      if (this.state.selectedRoundId === data._id) {
        this.setState({ selectedRoundId: "" });
      } else {
        this.setState({ selectedRoundId: data._id });
      }
    } else {
      return toast.error("Contest is not publish,you can not play yet!");
    }
  }

  playContest() {
    let gameTypeObj = "";
    roomId = this.state.roomIdd;

    this.getRoomDetails();
    // if (this.state.contestData.playerType === 1) {
    // console.log(this.state.roundListArr[this.state.currentIndexRound]);
    if (this.state.roundListArr[this.state.currentIndexRound] !== undefined) {
      roundId = this.state.roundListArr[this.state.currentIndexRound]._id;
      gameTypeObj = this.state.roundListArr[this.state.currentIndexRound];

      this.setState({
        roundData: this.state.roundListArr[this.state.currentIndexRound],
      });
      var postData = {};
      postData.contestId = contestId;
      postData.roomId = roomId;
      postData.roundId = roundId;
      postData.createdBy = JSON.parse(reactLocalStorage.get("userData")).userId;
      // console.log(postData);
      fetch(configuration.APIbaseURL + "game/game", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
        body: JSON.stringify(postData),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.code === 200) {
            this.setState({ gameId: data.data._id });
            this.setState({ roomId: data.data.roomId });
            if (
              JSON.parse(reactLocalStorage.get("userData")).userId ==
              this.state.createdBy
            ) {
              this.setState({ contestCreater: true });
            }
          } else {
            return toast.error(data.message);
          }
        });
      // this.setState({ indexQuestion: 0 });

      if (gameTypeObj.gameType !== "Blank") {
        this.getQuestionList(roundId);
        this.setState({
          isBalnkRound: false,
          blankRoundObj: {},
          newTime: 0,
          isWinnerScreenShow: false,
          nextRoundStartForOtherUser: false,
        });
      } else {
        this.setState({
          isBalnkRound: true,
          blankRoundObj: gameTypeObj,
          showRound: false,
          saveExitAnswer: false,
          isWinnerScreenShow: true,
          nextRoundStartForOtherUser: false,
        });
        this.startTimerForBlankRound(gameTypeObj);
      }
    } else {
      this.saveExitAnswer(1);
    }

    // this.props.history.push('/contests/game/start/'+contestId+"?"+this.state.selectedRoundId);
    // }
    // else
    // {
    // 	return toast.error('Only single player play game!');
    // }
  }

  saveExitAnswer(isLast = 0) {
    // this.setState({indexQuestion:(this.state.listArr.length+1)})
    if (this.state.roundListArr[this.state.currentIndexRound] !== undefined) {
      this.setState({ saveExitAnswer: true });

      var that = this;
      setTimeout(function () {
        that.setState({ winnerScreen: true });
        setTimeout(function () {
          that.setState({
            showRound: true,
            winnerScreen: false,
            nextRoundStartForOtherUser: true,
          });
          // if(this.state.currentAssignedUser === this.state.userId){
          // 	that.nextQuestion.bind(that);
          // }
        }, 5000);
      }, 2000);
    } else {
      this.setState({ saveExitAnswer: true });
      var that = this;
      setTimeout(function () {
        that.setState({
          winnerScreen: true,
          showRound: false,
          showGoLeaderBoardBtn: true,
        });
      }, 2000);
    }
  }
  saveNextAnswer(index, e) {
    if (this.state.listArr[this.state.indexQuestion + 1] !== undefined) {
      let indexQu = this.state.indexQuestion;
      this.setState({ indexQuestion: indexQu + 1 });
      // let fields = this.state.listArr;

      // fields[index]['selectAnswer'] = e._id;
      // fields[index]['isAnswerTrue'] = false;
      // fields[index]['readonly'] = true;
      // this.setState({ listArr: fields });

      // this.countScore(this.state.indexQuestion);

      // var that = this;
      // setTimeout(function () {

      // 	setTimeout(function () {
      // 		that.setState({ showRound: true, currentIndexRound: that.state.currentIndexRound + 1, winnerScreen: false });
      // 	}, 5000);
      // }, 2000);
    } else {
      this.setState({ saveExitAnswer: true });
      var that = this;
      setTimeout(function () {
        that.setState({
          winnerScreen: true,
          showRound: false,
          showGoLeaderBoardBtn: true,
        });
      }, 2000);
    }
  }

  plusCount() {
    var roundListArr = [];
    for (var i = 0; i < this.state.roundListArr.length; i++) {
      if (this.state.roundListArr[i].gameType == "Blank") {
        roundListArr.push(this.state.roundListArr[i]);
      }
      if (this.state.roundListArr[i].totalQuestions > 0) {
        roundListArr.push(this.state.roundListArr[i]);
      }
    }
    this.setState({ roundListArr: roundListArr });
  }

  saveIndexAnswer() {
    var temp = false;
    let fields = this.state.listArr;

    fields[this.state.indexQuestion]["readonly"] = true;

    if (
      this.state.listArr[this.state.indexQuestion]["selectAnswer"] === undefined
    ) {
      fields[this.state.indexQuestion]["selectAnswer"] = "";
      fields[this.state.indexQuestion]["isAnswerTrue"] = false;
    } else {
      for (
        var i = 0;
        i < this.state.listArr[this.state.indexQuestion]["answers"].length;
        i++
      ) {
        if (
          this.state.listArr[this.state.indexQuestion]["selectAnswer"] !==
            undefined &&
          this.state.listArr[this.state.indexQuestion]["selectAnswer"].includes(
            this.state.listArr[this.state.indexQuestion]["answers"][i]._id
          ) &&
          this.state.listArr[this.state.indexQuestion]["answers"][i]
            .correctAnswer === true
        ) {
          temp = true;
          break;
        }
      }
    }

    if (temp) {
      fields[this.state.indexQuestion]["isAnswerTrue"] = true;
    }
    this.setState({ listArr: fields });

    this.countScore(this.state.indexQuestion);
    // var that = this;
    // setTimeout(function () {
    // 	if (that.state.indexQuestion < that.state.listArr.length && that.state.listArr[that.state.indexQuestion]['answerType'] === 2) {
    // 		that.setState({ indexQuestion: that.state.indexQuestion + 1 })
    // 	}
    // 	else {
    // 		that.saveExitAnswer();
    // 	}
    // }, 2000);
  }

  handleSingleSelectChange(index, e) {
    let fields = this.state.listArr;
    fields[index]["selectAnswer"] = e._id;
    fields[index]["isAnswerTrue"] = e.correctAnswer;
    fields[index]["readonly"] = true;
    this.setState({ listArr: fields });
    this.countScore(this.state.indexQuestion);

    // var that = this;
    // setTimeout(function () {
    // 	if (index < that.state.listArr.length) {
    // 		that.setState({ indexQuestion: index + 1 })
    // 	}
    // 	else {
    // 		that.saveExitAnswer();
    // 	}
    // }, 2000);
  }

  handleMultiSelectChange(index, e) {
    let fields = this.state.listArr;

    if (Array.isArray(fields[index]["selectAnswer"])) {
      if (fields[index]["selectAnswer"].includes(e._id)) {
        var arrindex = fields[index]["selectAnswer"].indexOf(e._id);
        if (arrindex > -1) {
          fields[index]["selectAnswer"].splice(arrindex, 1);
        }
      } else {
        fields[index]["selectAnswer"].push(e._id);
      }
    } else {
      fields[index]["selectAnswer"] = [];
      fields[index]["selectAnswer"].push(e._id);
    }

    this.setState({ listArr: fields });
  }

  handleFlashcardSelectChange(index, e) {
    let fields = this.state.listArr;
    fields[index]["selectAnswer"] = e._id;
    fields[index]["isAnswerTrue"] = true;
    fields[index]["readonly"] = true;
    console.log(fields[index]);
    this.setState({ listArr: fields });
    this.countScore(this.state.indexQuestion);
    var that = this;
    setTimeout(function () {
      if (index < that.state.listArr.length) {
        that.setState({ indexQuestion: index + 1 });
      } else {
        that.saveExitAnswer();
      }
    }, 2000);
  }

  handleTrueFalseSelectChange(index, isTrue) {
    let fields = this.state.listArr;
    fields[index]["selectAnswer"] = isTrue;
    fields[index]["isAnswerTrue"] =
      this.state.listArr[index]["answerTypeBoolean"] === isTrue ? true : false;
    fields[index]["readonly"] = true;
    this.setState({ listArr: fields });
    this.countScore(this.state.indexQuestion);
    var that = this;
    console.log(fields[index]);
    setTimeout(function () {
      if (index < that.state.listArr.length) {
        that.setState({ indexQuestion: index + 1 });
        $('input[type="radio"]').each(function () {
          $(this).removeAttr("checked");
          $('input[type="radio"]').prop("checked", false);
        });
      } else {
        that.saveExitAnswer();
      }
    }, 2000);
  }

  getQuestionList(roundId1) {
    let indexRoundNo = this.state.currentIndexRound;
    fetch(
      configuration.baseURL +
        "roundQuestion/roundQuestion?roundId=" +
        roundId1 +
        "&gameType=" +
        this.state.roundListArr[indexRoundNo].gameType,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        var data = data.data;
        this.setState({
          listArr: data,
          showRound: false,
          saveExitAnswer: false,
        });
        if (this.state.roundListArr[indexRoundNo].gameType === "Unscramble") {
          console.log("in get Question");
          this.unscrambleWords();
        } else {
          this.setState({ stopTimer: false });
          this.startTimer();
        }
      });
  }

  unscrambleWords() {
    let questionarr = this.state.listArr;

    for (let x in questionarr) {
      var str = questionarr[x].question.toUpperCase();
      var arr = str.split("");
      var n = arr.length;

      for (var i = 0; i < n - 1; ++i) {
        var j = Math.floor(Math.random() * n);
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      var setarr = this.state.unscrambleArr;
      setarr[setarr.length] = arr;
      console.log(setarr, "unsramble");

      this.setState({ unscrambleArr: setarr });
    }
    this.startTimer();
  }

  unscrambleAnswerCheck(ans, id) {
    var str =
      this.state.listArr[this.state.indexQuestion].question.toUpperCase();
    let arr = str.split("");
    let index = this.state.indexForUnscrambleAns;
    if (arr[index] === ans) {
      $(`#idd${index}`).text(ans);
      $(`#${id}`).prop("disabled", true);
      if (index == arr.length - 1) {
        this.setState({ indexForUnscrambleAns: 0 });
        this.unscrambleAnswerSubmit(true, str);
      } else {
        this.setState({ indexForUnscrambleAns: index + 1 });
      }
    } else {
      var arrslice = arr.slice(0, index - 1);
      str = "" + arrslice + ans;
      $(`#${id}`).addClass("flexboxred");
      $(`.flexbox`).prop("disabled", true);
      this.unscrambleAnswerSubmit(false, str);
    }
  }

  unscrambleAnswerSubmit(ans, selectAnswer) {
    let fields = this.state.listArr;
    fields[this.state.indexQuestion]["isAnswerTrue"] = ans;
    fields[this.state.indexQuestion]["selectAnswer"] = selectAnswer;
    fields[this.state.indexQuestion]["readonly"] = true;
    this.setState({ listArr: fields });
    this.countScore(this.state.indexQuestion);
    var that = this;
    setTimeout(function () {
      that.setState({ indexQuestion: that.state.indexQuestion + 1 });
    }, 2000);
  }

  startTimer() {
    let fields = this.state.listArr;
    var that = this;
    let roundIndexIncrease = true;
    if (
      this.state.listArr.length > 0 &&
      fields[that.state.indexQuestion] !== undefined
    ) {
      setTimeout(function () {
        var newTime = 0;
        if (
          fields[that.state.indexQuestion] !== undefined &&
          fields[that.state.indexQuestion]["timeLimit"] !== undefined
        ) {
          var currentTime = parseInt(
            fields[that.state.indexQuestion]["timeLimit"]
          );

          if (fields[that.state.indexQuestion]["timeAlloted"] === undefined) {
            fields[that.state.indexQuestion]["timeAlloted"] = currentTime;
          }
          // console.log('timeLimit--->',fields[that.state.indexQuestion]['timeLimit']);

          newTime = currentTime - 1;
          var seconds = (newTime % 60).toString();
          var minute = Math.floor(newTime / 60).toString();

          if (seconds.length === 0) {
            seconds = "00";
          } else if (seconds.length === 1) {
            seconds = "0" + seconds;
          }

          if (minute.length === 0) {
            minute = "00";
          } else if (minute.length === 1) {
            minute = "0" + minute;
          }

          fields[that.state.indexQuestion]["displaytimeLimit"] =
            minute + " : " + seconds;
          fields[that.state.indexQuestion]["timeLimit"] = newTime;
          that.setState({ listArr: fields });

          console.log(
            fields[that.state.indexQuestion]["displaytimeLimit"],
            "ques",
            that.state.indexQuestion
          );
        }

        if (newTime === 0 || newTime < 0) {
          console.log("timer got Zero");
          if (that.state.indexQuestion < that.state.listArr.length) {
            fields[that.state.indexQuestion]["selectAnswer"] = "";
            fields[that.state.indexQuestion]["isAnswerTrue"] = false;
            that.setState({ listArr: fields });
            if (that.state.currentAssignedUser == userId) {
              console.log("calling count score in timer");
              that.countScore(that.state.indexQuestion);
            }
            // that.setState({ indexQuestion: that.state.indexQuestion + 1 })
            // that.startTimer();
            // socket_2.emit("submitQuestion",{roomID:this.state.roomIdd,resultInfo: 50})
          } else {
            console.log("before else");
            that.saveExitAnswer();
            // that.nextQuestion();
          }
        } else {
          if (that.state.stopTimer == false) {
            that.startTimer();
          }
        }
      }, 1000);
    } else {
      that.saveExitAnswer();
      // that.nextQuestion();
    }
  }

  startTimerForBlankRound(gameTypeObj) {
    let fields = gameTypeObj;
    var that = this;
    if (fields !== undefined) {
      setTimeout(function () {
        var newTime = 0;
        if (fields !== undefined && fields["timeLimit"] !== undefined) {
          if (parseInt(fields["timeLimit"]) === 0) {
            var currentTime = 30;
          } else {
            var currentTime = parseInt(fields["timeLimit"]);
          }

          if (fields["timeAlloted"] === undefined) {
            fields["timeAlloted"] = currentTime;
          }
          // console.log('timeLimit--->',fields[that.state.indexQuestion]['timeLimit']);

          newTime = currentTime - 1;
          var seconds = (newTime % 60).toString();
          var minute = Math.floor(newTime / 60).toString();

          if (seconds.length === 0) {
            seconds = "00";
          } else if (seconds.length === 1) {
            seconds = "0" + seconds;
          }

          if (minute.length === 0) {
            minute = "00";
          } else if (minute.length === 1) {
            minute = "0" + minute;
          }

          fields["displaytimeLimit"] = minute + ":" + seconds;
          fields["timeLimit"] = newTime;

          that.setState({ blankRoundObj: fields });
          // console.log(fields[that.state.indexQuestion]['displaytimeLimit'])
        }

        if (newTime === 0) {
          // if (that.state.indexQuestion < that.state.listArr.length) {
          // 	fields[that.state.indexQuestion]['selectAnswer'] = "";
          // 	fields[that.state.indexQuestion]['isAnswerTrue'] = false;
          // 	that.setState({listArr:fields});
          // 	that.countScore(that.state.indexQuestion);
          // 	that.setState({indexQuestion:that.state.indexQuestion+1})
          // 	that.startTimer();
          // }
          // else
          // {
          // that.setState({isBalnkRound:false,blankRoundObj:{}});

          // if (that.state.roundListArr[(that.state.currentIndexRound+1)] !== undefined) {
          // that.setState({saveExitAnswer:true});
          // 	setTimeout(function () {
          // 		that.setState({showRound:true,saveExitAnswer:true,indexRound:that.state.indexRound+1,currentIndexRound:that.state.currentIndexRound+1,winnerScreen:false});
          // 	}, 1000);
          // }

          if (that.state.newTime == 0) {
            that.setState({
              indexRound: that.state.indexRound + 1,
              newTime: 1,
            });
            if (
              that.state.roundListArr[that.state.currentIndexRound + 1] !==
              undefined
            ) {
              that.setState({ saveExitAnswer: true });

              setTimeout(function () {
                that.setState({
                  winnerScreen: true,
                  openModelForGiveScore: false,
                });
                setTimeout(function () {
                  that.setState({
                    showRound: true,
                    currentIndexRound: that.state.currentIndexRound + 1,
                    winnerScreen: false,
                    isBalnkRound: false,
                    blankRoundObj: {},
                    activelistArr: [],
                  });
                }, 5000);
              }, 2000);
            } else {
              that.setState({ saveExitAnswer: true });

              setTimeout(function () {
                that.setState({
                  winnerScreen: true,
                  showRound: false,
                  showGoLeaderBoardBtn: true,
                  openModelForGiveScore: false,
                });
              }, 2000);
            }
          }

          that.setState({
            isBalnkRound: false,
            blankRoundObj: {},
            openModelForGiveScore: false,
          });

          // }

          // this.setState({blankRoundObj:fields});
        } else {
          if (that.state.newTime !== 1) {
            that.startTimerForBlankRound(fields);
          }
        }
      }, 1000);
    } else {
      this.saveExitAnswerForBlank();
    }
  }

  saveExitAnswerForBlank(isLast = 0) {
    this.setState({ indexRound: this.state.indexRound + 1, newTime: 1 });
    if (
      this.state.roundListArr[this.state.currentIndexRound + 1] !== undefined
    ) {
      this.setState({ saveExitAnswer: true });
      var that = this;
      setTimeout(function () {
        that.setState({
          winnerScreen: true,
          openModelForGiveScore: false,
        });
        setTimeout(function () {
          that.setState({
            showRound: true,
            currentIndexRound: that.state.currentIndexRound + 1,
            winnerScreen: false,
            isBalnkRound: false,
            blankRoundObj: {},
            activelistArr: [],
          });
        }, 5000);
      }, 2000);
    } else {
      this.setState({ saveExitAnswer: true });
      var that = this;
      setTimeout(function () {
        that.setState({
          winnerScreen: true,
          showRound: false,
          showGoLeaderBoardBtn: true,
          openModelForGiveScore: false,
        });
      }, 2000);
    }
  }

  countScore(index) {
    console.log("inside count score");
    if (
      this.state.listArr.length > 0 &&
      this.state.listArr[index] !== undefined
    ) {
      var score = 0;
      if (this.state.listArr[index]["isAnswerTrue"]) {
        score += this.state.listArr[index]["basePoints"];
      } else {
        if (this.state.listArr[index]["negativeScoring"]) {
          score = score - this.state.listArr[index]["negativeBasePoints"];
        }
      }
      if (
        this.state.listArr[index]["hint"] === 3 &&
        this.state.listArr[index]["hintTextStyle"] !== undefined
      ) {
        score = score - this.state.listArr[index]["onDemandNegativePoints"];
      }

      var postData = {};

      postData.userId = JSON.parse(reactLocalStorage.get("userData")).userId;
      postData.gameId = this.state.gameId;
      postData.roomId = this.state.roomId;
      postData.roundQuestionId = this.state.listArr[index]["_id"];
      postData.selectedAnswer =
        this.state.listArr[index]["selectAnswer"].toString() !== ""
          ? this.state.listArr[index]["selectAnswer"].toString()
          : "false";
      postData.isCorrect =
        this.state.listArr[index]["isAnswerTrue"] !== undefined
          ? this.state.listArr[index]["isAnswerTrue"]
          : false;
      postData.score = score;
      postData.timeAlloted = this.state.listArr[index]["timeAlloted"];
      postData.timeUsed = this.state.listArr[index]["timeLimit"];
      // console.log(postData);
      fetch(configuration.APIbaseURL + "game/submitQuestion", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
        body: JSON.stringify(postData),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.setState({
            totalScore: this.state.totalScore + score,
          });
        });

      socket_2.emit("submitQuestion", {
        roomID: this.state.roomIdd,
        resultInfo: { helo: "hi" },
        userId,
      });
      console.log("before ismoderator");
      if (this.props.isModerator) {
        this.moderatorNextQue();
        console.log("inside ismoderator");
      }
    }
  }

  handleFreeTextChange(e) {
    this.setState({ freeTextAnswer: e.target.value });
  }

  submitFreeText() {
    var listArr = this.state.listArr;
    listArr[this.state.indexQuestion]["selectAnswer"] =
      this.state.freeTextAnswer;
    this.setState({ listArr: listArr, freeTextAnswer: "" });

    let fields = this.state.listArr;

    var istrue = false;

    for (
      var i = 0;
      i < this.state.listArr[this.state.indexQuestion]["answers"].length;
      i++
    ) {
      if (
        this.state.listArr[this.state.indexQuestion]["answers"][i]["answer"] ===
        this.state.listArr[this.state.indexQuestion]["selectAnswer"]
      ) {
        istrue = true;
      }
    }

    fields[this.state.indexQuestion]["isAnswerTrue"] = istrue;
    fields[this.state.indexQuestion]["readonly"] = true;
    this.setState({ listArr: fields });
    this.countScore(this.state.indexQuestion);
    var that = this;
    setTimeout(function () {
      if (that.state.indexQuestion < that.state.listArr.length) {
        that.setState({ indexQuestion: that.state.indexQuestion + 1 });
      } else {
        that.saveExitAnswer();
      }
    }, 2000);
  }

  changeOnDemand() {
    let fields = this.state.listArr;
    fields[this.state.indexQuestion]["hintTextStyle"] = true;
    this.setState({ listArr: fields });
  }

  handleChangePlay(field, e) {
    let fields = this.state.fieldsPlay;
    fields[field] = e.target.value;
    this.setState({ fieldsPlay: fields });

    let errors = {};
    if (field === "display_name" && fields["display_name"].trim() === "") {
      errors["display_name"] = "Please enter Display Name";
    }

    if (
      field === "password" &&
      fields["password"].trim() !== "" &&
      fields["password"].length < 6
    ) {
      errors["password"] = "Please Game Password minimum size must be 6";
    }
    this.setState({ errorsPlay: errors });
  }

  handleNext() {
    let fields = this.state.fieldsPlay;
    let errors = {};
    let formIsValid = true;
    if (fields["display_name"].trim() === "") {
      formIsValid = false;
      errors["display_name"] = "Please enter Display Name";
    }

    if (fields["password"].trim() !== "" && fields["password"].length < 6) {
      errors["password"] = "Please Game Password minimum size must be 6";
    }

    this.setState({ errorsPlay: errors });
    if (formIsValid) {
      const data = new FormData();
      data.append("displayName", fields["display_name"]);
      data.append("password", fields["password"]);
      data.append(
        "createdBy",
        JSON.parse(reactLocalStorage.get("userData")).userId
      );
      data.append("contestId", fields["contestId"]);

      fetch(configuration.baseURL + "room/room", {
        method: "post",
        headers: {
          contentType: "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
        body: data,
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.code === 200) {
            this.props.history.push(
              "/detail-contest/" + fields["contestId"] + "?" + data.data._id
            );
          } else {
            return toast.error(data.message);
          }
        });
    }
  }

  handleChange(field, e) {
    let fields = this.state.fields;
    fields[field] = e.target.value;
    this.setState({ fields });

    let errors = {};
    if (field === "title" && fields["title"].trim() === "") {
      errors["title"] = "Please enter title";
      return;
    }
    if (field === "description" && fields["description"].trim() === "") {
      errors["description"] = "Please enter description";
      return;
    }
    this.setState({ errors: errors });
  }

  handleSubmit() {
    let fields = this.state.fields;
    let errors = {};
    let formIsValid = true;
    this.setState({ fields });
    // if (fields["title"].trim() === "") {
    //     formIsValid = false;
    //     errors["title"] = "Please enter title";
    // }

    if (!fields["description"]) {
      formIsValid = false;
      errors["description"] = "Please select description";
    }
    this.setState({ errors: errors });
    if (formIsValid) {
      this.setState({ openModel: false });
      const data = new FormData();
      // data.append("title", this.state.fields.title);
      data.append("description", this.state.fields.description);
      data.append("contestId", parentContestId);
      data.append("roomId", roomId);
      data.append(
        "userId",
        JSON.parse(reactLocalStorage.get("userData")).userId
      );

      fetch(configuration.baseURL + "report", {
        method: "post",
        headers: {
          contentType: "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
        body: data,
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.code === 200) {
            let fields = this.state.fields;
            // fields['title'] = '';
            fields["description"] = "";
            this.setState({ fields });
            toast.success(data.message);
            // setTimeout(() => {
            // 	this.props.history.push('/dashboard');
            // }, 2000)
          } else {
            return toast.error(data.message);
          }
        });
    }
  }

  handleSubmitScore() {
    if (this.state.activelistArr.length > 0) {
      fetch(configuration.baseURL + "game/blankRoundScore", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
        body: JSON.stringify(this.state.activelistArr),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data) {
            // console.log("data");
            // console.log(data.data);
            // this.setState({totalScore:10})

            this.setState({ openModelForGiveScore: false });
          } else {
            console.log("error");
          }
        });
    }
  }

  getParticipants() {
    fetch(
      configuration.baseURL +
        "game/activeUser/?roomId=" +
        roomId +
        "&gameId=" +
        this.state.gameId,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.data.length > 0) {
          this.setState({
            activelistArr: data.data,
            openModelForGiveScore: true,
          });
        } else {
        }
      });
  }

  getRoomDetails() {
    fetch(configuration.baseURL + "room/room/?roomId=" + this.state.roomIdd, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + reactLocalStorage.get("clientToken"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.data.length > 0) {
          let createdBy = data.data[0].createdById;
          let userId = JSON.parse(reactLocalStorage.get("userData")).userId;
          this.setState({ roomCreatedBy: createdBy });
          if (createdBy === userId) {
            this.props.setModerator(true);
            this.setState({ isModerator: true });
          }
        }
      });
  }
  modifyActiveUser(index, score, e) {
    this.setState({ isActive: index + "" + score });
    console.log("sss", e);
    let dataArr = this.state.activelistArr;
    dataArr = dataArr.map((e, i) => {
      if (e._id == index) {
        e.score = score;
        e["gameId"] = this.state.gameId;
        return e;
      }
      return e;
    });
    this.setState({ activelistArr: dataArr });
  }

  togglemodel() {
    const targetDiv = document.getElementById("exampleModalCenter");
    if (this.state.togglemodel === true) {
      $("#exampleModalCenter").hide();
      this.setState({ togglemodel: false, width: "100%" });
    } else {
      $("#exampleModalCenter").show();
      this.setState({ togglemodel: true, width: "49%" });
    }
  }
  render() {
    console.log("mydata", this.props.history);
    return (
      <>
        <TheHeaderInner />
        <ToastContainer
          position="top-right"
          autoClose={10000}
          style={{ top: "80px" }}
        />
        <main id="main">
          <Room
            width={this.state.width}
            socket={socket_2}
            userId={userId}
            history={this.props.history}
            isModerator={this.state.isModerator}
            joinroomreq={this.state.joinroomreq}
            roomId={this.state.roomIdd}
          />
          {!this.props.waitScreen ? (
            <>
              <a
                id="hideButton"
                style={{
                  position: "absolute",
                  right: "8px",
                  backgroundColor: "#111b20",
                  borderColor: "#4fc9e1",
                }}
                onClick={this.togglemodel.bind(this)}
              >
                <img
                  style={{ width: "33px" }}
                  src={
                    this.state.togglemodel
                      ? "img/eye2.png"
                      : "img/eye-hide .png"
                  }
                />
              </a>

              <section
                className="ff"
                id="exampleModalCenter"
                style={{
                  float: "right",
                  position: "relative",
                  width: "50%",
                  top: "30px",
                }}
              >
                {this.state.showRound === false ? (
                  this.state.saveExitAnswer === false ? (
                    <section id="hero" class="d-flex align-items-center">
                      <div
                        className="quizz-game2"
                        style={{ marginTop: "35px" }}
                      >
                        <div
                          className="dropdown show"
                          style={{ float: "right" }}
                        >
                          <a
                            className="btn btn-secondary dropdown-toggle toggle-arrow"
                            href="#"
                            role="button"
                            id="dropdownMenuLink"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i class="fas fa-ellipsis-v"></i>
                          </a>

                          <div
                            className="dropdown-menu drop-btn-menu"
                            aria-labelledby="dropdownMenuLink"
                          >
                            {this.state.contestCreater ? null : (
                              <button
                                style={{
                                  minWidth: "150px",
                                }}
                                class="pink_btn"
                                type="button"
                                onClick={() => {
                                  this.setState({
                                    openModel: true,
                                  });
                                }}
                              >
                                Report
                              </button>
                            )}

                            <button
                              style={{
                                minWidth: "150px",
                              }}
                              class="pink_btn"
                              type="button"
                              onClick={() => {
                                this.setState({
                                  openModelForMembers: true,
                                });
                              }}
                            >
                              Members
                            </button>

                            {this.state.isBalnkRound ? (
                              <button
                                style={{
                                  minWidth: "150px",
                                }}
                                class="pink_btn"
                                type="button"
                                onClick={this.getParticipants.bind(this)}
                              >
                                Give Score
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <h3>{this.state.contestData.title}</h3>
                        <p>{this.state.roundData.gameType}</p>
                        <div class="quizz-quas">
                          {this.state.isBalnkRound ? (
                            <h4>Blank Round</h4>
                          ) : this.state.listArr[this.state.indexQuestion] ? (
                            <h4>
                              Question {this.state.indexQuestion + 1}/
                              {this.state.listArr.length}
                            </h4>
                          ) : (
                            <h4>
                              Question {this.state.listArr.length}/
                              {this.state.listArr.length}
                            </h4>
                          )}

                          {this.state.isBalnkRound ? (
                            <div
                              style={{
                                padding: "10px",
                                display: "inline",
                              }}
                            ></div>
                          ) : (
                            this.state.listArr.map((e, key) => {
                              let classname =
                                key === this.state.indexQuestion
                                  ? "step_progress yellow_"
                                  : typeof e.selectAnswer !== "undefined"
                                  ? e.isAnswerTrue
                                    ? "step_progress blue_"
                                    : "step_progress pink_"
                                  : "step_progress";
                              return <div className={classname}></div>;
                            })
                          )}
                          <div id="app">
                            <div class="base-timer">
                              <svg
                                class="base-timer__svg"
                                viewBox="0 0 100 100"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g class="base-timer__circle">
                                  <circle
                                    class="base-timer__path-elapsed"
                                    cx="50"
                                    cy="50"
                                    r="45"
                                  ></circle>
                                  <span
                                    id="base-timer-label"
                                    class="base-timer__label"
                                  ></span>
                                  {/*(this.state.listArr[this.state.indexQuestion]) ?
													var dasharray = this.state.listArr[this.state.indexQuestion]['timeLimit'] + ' 283';
													<path id="base-timer-path-remaining" stroke-dasharray={dasharray} class="base-timer__path-remaining red" d="
													M 50, 50
													m -45, 0
													a 45,45 0 1,0 90,0
													a 45,45 0 1,0 -90,0
													"></path>
													:
													<path id="base-timer-path-remaining" stroke-dasharray=" 283" class="base-timer__path-remaining red" d="
													M 50, 50
													m -45, 0
													a 45,45 0 1,0 90,0
													a 45,45 0 1,0 -90,0
													"></path>*/}
                                  <path
                                    id="base-timer-path-remaining"
                                    stroke-dasharray=" 283"
                                    class="base-timer__path-remaining red"
                                    d="
													M 50, 50
													m -45, 0
													a 45,45 0 1,0 90,0
													a 45,45 0 1,0 -90,0
													"
                                  ></path>
                                </g>
                              </svg>
                              {this.state.isBalnkRound ? (
                                <>
                                  <span
                                    id="base-timer-label"
                                    class="base-timer__label"
                                  >
                                    {this.state.blankRoundObj[
                                      "displaytimeLimit"
                                    ]
                                      ? this.state.blankRoundObj[
                                          "displaytimeLimit"
                                        ]
                                      : "00:00"}
                                  </span>
                                </>
                              ) : this.state.listArr[
                                  this.state.indexQuestion
                                ] ? (
                                <span
                                  id="base-timer-label"
                                  class="base-timer__label"
                                >
                                  {this.state.listArr[this.state.indexQuestion][
                                    "displaytimeLimit"
                                  ]
                                    ? this.state.listArr[
                                        this.state.indexQuestion
                                      ]["displaytimeLimit"]
                                    : "00:00"}
                                </span>
                              ) : (
                                <span
                                  id="base-timer-label"
                                  class="base-timer__label"
                                >
                                  00:00
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {this.state.isBalnkRound ? (
                          <>
                            <div
                              class="align-self-center"
                              style={{
                                textAlign: "center",
                              }}
                            >
                              <button
                                style={{
                                  minWidth: "150px",
                                  marginRight: "18px",
                                }}
                                class="pink_btn"
                                type="button"
                                onClick={this.saveExitAnswerForBlank.bind(this)}
                              >
                                Start Next Round
                              </button>
                            </div>
                          </>
                        ) : this.state.listArr[this.state.indexQuestion] ? (
                          <div className="flexxxxx">
                            {this.state.roundListArr[
                              this.state.currentIndexRound
                            ].gameType === "Unscramble" ? (
                              <>
                                <div className="flexboxbox">
                                  {this.state.unscrambleArr.map((i, index) => {
                                    if (index == this.state.indexQuestion) {
                                      return i.map((e, index) => {
                                        var id = `id${index}`;
                                        return (
                                          <button
                                            className="flexbox"
                                            id={id}
                                            onClick={this.unscrambleAnswerCheck.bind(
                                              this,
                                              e,
                                              id
                                            )}
                                          >
                                            {" "}
                                            {e}{" "}
                                          </button>
                                        );
                                      });
                                    }
                                  })}
                                </div>
                                <div className="flexboxbox">
                                  {this.state.unscrambleArr.map((i, index) => {
                                    if (index == this.state.indexQuestion) {
                                      return i.map((e, index) => {
                                        var id = `idd${index}`;
                                        return (
                                          <div className="flexbox2">
                                            <p id={id}> </p>
                                          </div>
                                        );
                                      });
                                    }
                                    return;
                                  })}
                                </div>
                                {this.state.listArr[this.state.indexQuestion][
                                  "hint"
                                ] === 2 ? (
                                  <p className="hintText">
                                    <span>Hint - </span>
                                    {
                                      this.state.listArr[
                                        this.state.indexQuestion
                                      ]["hintText"]
                                    }
                                  </p>
                                ) : this.state.listArr[
                                    this.state.indexQuestion
                                  ]["hint"] === 3 ? (
                                  <p className="hintText">
                                    {this.state.listArr[
                                      this.state.indexQuestion
                                    ]["hintTextStyle"] !== undefined &&
                                    this.state.listArr[
                                      this.state.indexQuestion
                                    ]["hintTextStyle"] === true ? (
                                      this.state.listArr[
                                        this.state.indexQuestion
                                      ]["hintText"]
                                    ) : (
                                      <button
                                        class="blue_btn"
                                        onClick={this.changeOnDemand.bind(this)}
                                      >
                                        Show Hint
                                      </button>
                                    )}
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <div
                                class="qus"
                                style={{
                                  marginBottom: "30px",
                                }}
                              >
                                {this.state.listArr[this.state.indexQuestion][
                                  "fileType"
                                ] == "image" ? (
                                  <div
                                    style={{
                                      width: "100%",
                                      alignContent: "center",
                                      textAlign: "center",
                                      marginBottom: "25px",
                                    }}
                                  >
                                    <img
                                      src={
                                        this.state.listArr[
                                          this.state.indexQuestion
                                        ]["file"]
                                      }
                                      style={{
                                        height: "145px",
                                      }}
                                    />
                                  </div>
                                ) : null}

                                {this.state.listArr[this.state.indexQuestion][
                                  "fileType"
                                ] == "video" ? (
                                  <div
                                    style={{
                                      width: "300px",
                                      height: "150px",
                                      marginLeft: "232px",
                                    }}
                                  >
                                    <video
                                      controlsList="nodownload"
                                      width="50"
                                      height="50"
                                      controls
                                      autoPlay
                                    >
                                      <source
                                        src={
                                          this.state.listArr[
                                            this.state.indexQuestion
                                          ]["file"]
                                        }
                                        type="video/mp4"
                                      />
                                      This browser doesn't support video tag.
                                    </video>
                                  </div>
                                ) : null}

                                {this.state.listArr[this.state.indexQuestion][
                                  "fileType"
                                ] == "audio" ? (
                                  <div
                                    style={{
                                      width: "300px",
                                      height: "150px",
                                      marginLeft: "232px",
                                    }}
                                  >
                                    <audio
                                      controlsList="nodownload"
                                      controls
                                      autoPlay
                                    >
                                      <source
                                        src={
                                          this.state.listArr[
                                            this.state.indexQuestion
                                          ]["file"]
                                        }
                                        type="audio/mpeg"
                                      />
                                      Your browser does not support the audio
                                      element.
                                    </audio>
                                  </div>
                                ) : null}

                                {this.state.listArr[this.state.indexQuestion][
                                  "fileType"
                                ] == "link" ? (
                                  <div
                                    style={{
                                      width: "300px",
                                      height: "150px",
                                      marginLeft: "232px",
                                    }}
                                  >
                                    <iframe
                                      width="300"
                                      height="150"
                                      src={
                                        this.state.listArr[
                                          this.state.indexQuestion
                                        ]["file"]
                                      }
                                      title="YouTube video player"
                                      frameborder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowfullscreen
                                    ></iframe>
                                  </div>
                                ) : null}

                                {/* SCORING NOT WORKING FOR FALSHCARD	 */}

                                {this.state.listArr[this.state.indexQuestion][
                                  "answerType"
                                ] === 4 ? (
                                  <>
                                    <h3
                                      style={{
                                        backgroundColor: " #68c1d3",
                                        width: "260px",
                                        margin: "auto",
                                        borderRadius: "20px 20px 0px 0px",
                                        padding: "10px",
                                        color: "#0e0e0e",
                                      }}
                                    >
                                      {
                                        this.state.listArr[
                                          this.state.indexQuestion
                                        ]["question"]
                                      }
                                    </h3>

                                    {this.state.currentAssignedUser ==
                                    userId ? (
                                      <>
                                        <ul
                                          style={{
                                            color: "#0e0e0e",
                                            listStyleType: "none",
                                            backgroundColor: "#fff",
                                            width: "260px",
                                            margin: "auto",
                                            position: "relative",
                                            borderRadius: "0px 0px 20px 20px",
                                            padding: "0",
                                          }}
                                        >
                                          {this.state.listArr[
                                            this.state.indexQuestion
                                          ]["answers"].map((e, key) => {
                                            return (
                                              <li
                                                key={key}
                                                style={{
                                                  padding: "18px",
                                                  textAlign: "center",
                                                }}
                                              >
                                                {e.answer}
                                              </li>
                                            );
                                          })}
                                        </ul>

                                        <div
                                          class="align-self-center"
                                          style={{
                                            textAlign: "center",
                                            marginTop: "18px",
                                          }}
                                        >
                                          <button
                                            style={{
                                              minWidth: "150px",
                                              marginRight: "18px",
                                            }}
                                            class="blue_btn light_blue_btn"
                                            type="button"
                                            onClick={this.saveNextAnswer.bind(
                                              this
                                            )}
                                          >
                                            Correct Answer
                                          </button>
                                        </div>
                                        <div
                                          class="align-self-center"
                                          style={{
                                            textAlign: "center",
                                            marginTop: "10px",
                                          }}
                                        >
                                          <button
                                            style={{
                                              minWidth: "150px",
                                              marginRight: "18px",
                                            }}
                                            class="pink_btn"
                                            type="button"
                                            onClick={this.saveNextAnswer.bind(
                                              this
                                            )}
                                          >
                                            Next
                                          </button>
                                        </div>
                                      </>
                                    ) : null}
                                  </>
                                ) : (
                                  <h3>
                                    {
                                      this.state.listArr[
                                        this.state.indexQuestion
                                      ]["question"]
                                    }
                                  </h3>
                                )}

                                {this.state.currentAssignedUser == userId ? (
                                  <>
                                    {this.state.listArr[
                                      this.state.indexQuestion
                                    ]["hint"] === 2 ? (
                                      <p className="hintText">
                                        <span>Hint - </span>
                                        {
                                          this.state.listArr[
                                            this.state.indexQuestion
                                          ]["hintText"]
                                        }
                                      </p>
                                    ) : this.state.listArr[
                                        this.state.indexQuestion
                                      ]["hint"] === 3 ? (
                                      <p className="hintText">
                                        {this.state.listArr[
                                          this.state.indexQuestion
                                        ]["hintTextStyle"] !== undefined &&
                                        this.state.listArr[
                                          this.state.indexQuestion
                                        ]["hintTextStyle"] === true ? (
                                          this.state.listArr[
                                            this.state.indexQuestion
                                          ]["hintText"]
                                        ) : (
                                          <button
                                            class="blue_btn"
                                            onClick={this.changeOnDemand.bind(
                                              this
                                            )}
                                          >
                                            Show Hint
                                          </button>
                                        )}
                                      </p>
                                    ) : null}

                                    <div class="answer-option">
                                      {this.state.listArr[
                                        this.state.indexQuestion
                                      ]["answerType"] === 1
                                        ? this.state.listArr[
                                            this.state.indexQuestion
                                          ]["answers"].map((e, key) => {
                                            var forclass = e._id + key;
                                            return (
                                              <p
                                                className={
                                                  this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["selectAnswer"]
                                                    ? this.state.listArr[
                                                        this.state.indexQuestion
                                                      ]["selectAnswer"] ===
                                                        e._id &&
                                                      e.correctAnswer === true
                                                      ? "fancy2 highlight"
                                                      : this.state.listArr[
                                                          this.state
                                                            .indexQuestion
                                                        ]["selectAnswer"] ===
                                                          e._id &&
                                                        e.correctAnswer ===
                                                          false
                                                      ? "fancy2 pinkhighlight"
                                                      : e.correctAnswer === true
                                                      ? "fancy2 highlight"
                                                      : "fancy2 pinkhighlight"
                                                    : "fancy2"
                                                }
                                              >
                                                <label>
                                                  {key === 0 ? (
                                                    <b class="option_ _a">A</b>
                                                  ) : null}
                                                  {key === 1 ? (
                                                    <b class="option_ _b">B</b>
                                                  ) : null}
                                                  {key === 2 ? (
                                                    <b class="option_ _c">C</b>
                                                  ) : null}
                                                  {key === 3 ? (
                                                    <b class="option_ _d">D</b>
                                                  ) : null}
                                                  {key === 4 ? (
                                                    <b class="option_ _e">E</b>
                                                  ) : null}
                                                  {key === 5 ? (
                                                    <b class="option_ _f">F</b>
                                                  ) : null}

                                                  {this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["selectAnswer"] === e._id &&
                                                  e.correctAnswer === true ? (
                                                    <input
                                                      id={forclass}
                                                      name={
                                                        this.state.listArr[
                                                          this.state
                                                            .indexQuestion
                                                        ]["_id"]
                                                      }
                                                      type="radio"
                                                      onChange={this.handleSingleSelectChange.bind(
                                                        this,
                                                        this.state
                                                          .indexQuestion,
                                                        e
                                                      )}
                                                      value={e.answer}
                                                      checked="checked"
                                                      disabled={
                                                        e.readonly
                                                          ? "disabled"
                                                          : ""
                                                      }
                                                    />
                                                  ) : (
                                                    <input
                                                      id={forclass}
                                                      name={
                                                        this.state.listArr[
                                                          this.state
                                                            .indexQuestion
                                                        ]["_id"]
                                                      }
                                                      type="radio"
                                                      onChange={this.handleSingleSelectChange.bind(
                                                        this,
                                                        this.state
                                                          .indexQuestion,
                                                        e
                                                      )}
                                                      value={e.answer}
                                                      disabled={
                                                        e.readonly
                                                          ? "disabled"
                                                          : ""
                                                      }
                                                    />
                                                  )}
                                                  <span for={forclass}>
                                                    {e.answer}
                                                  </span>
                                                </label>
                                              </p>
                                            );
                                          })
                                        : null}

                                      {this.state.listArr[
                                        this.state.indexQuestion
                                      ]["answerType"] === 2 ? (
                                        <div className="row">
                                          <div
                                            className="col-12"
                                            style={{
                                              marginBottom: "30px",
                                            }}
                                          >
                                            {this.state.listArr[
                                              this.state.indexQuestion
                                            ]["answers"].map((e, key) => {
                                              var forclass = e._id + key;
                                              var innnerpclass =
                                                "fancy2 fancy2_" + key;
                                              var tempcls =
                                                this.state.listArr[
                                                  this.state.indexQuestion
                                                ]["selectAnswer"] &&
                                                this.state.listArr[
                                                  this.state.indexQuestion
                                                ]["selectAnswer"].includes(
                                                  e._id
                                                )
                                                  ? innnerpclass
                                                  : "fancy2";

                                              var pcalss =
                                                this.state.listArr[
                                                  this.state.indexQuestion
                                                ]["isAnswerTrue"] !== undefined
                                                  ? this.state.listArr[
                                                      this.state.indexQuestion
                                                    ]["selectAnswer"].includes(
                                                      e.answer
                                                    ) &&
                                                    e.correctAnswer === true
                                                    ? "fancy2 highlight"
                                                    : e.correctAnswer === false
                                                    ? "fancy2 pinkhighlight"
                                                    : "fancy2 highlight"
                                                  : tempcls;
                                              // var pcalss = (this.state.listArr[this.state.indexQuestion]['selectAnswer'] && this.state.listArr[this.state.indexQuestion]['selectAnswer'].includes(e._id)) ? innnerpclass : "fancy2";
                                              var inputclass = "input_" + key;
                                              return (
                                                <p className={pcalss}>
                                                  <label>
                                                    {key === 0 ? (
                                                      <b class="option_ _a">
                                                        A
                                                      </b>
                                                    ) : null}
                                                    {key === 1 ? (
                                                      <b class="option_ _b">
                                                        B
                                                      </b>
                                                    ) : null}
                                                    {key === 2 ? (
                                                      <b class="option_ _c">
                                                        C
                                                      </b>
                                                    ) : null}
                                                    {key === 3 ? (
                                                      <b class="option_ _d">
                                                        D
                                                      </b>
                                                    ) : null}
                                                    {key === 4 ? (
                                                      <b class="option_ _e">
                                                        E
                                                      </b>
                                                    ) : null}
                                                    {key === 5 ? (
                                                      <b class="option_ _f">
                                                        F
                                                      </b>
                                                    ) : null}

                                                    {this.state.listArr[
                                                      this.state.indexQuestion
                                                    ]["selectAnswer"] &&
                                                    this.state.listArr[
                                                      this.state.indexQuestion
                                                    ]["selectAnswer"].includes(
                                                      e._id
                                                    ) &&
                                                    e.correctAnswer === true ? (
                                                      <input
                                                        id={forclass}
                                                        className={inputclass}
                                                        name={
                                                          this.state.listArr[
                                                            this.state
                                                              .indexQuestion
                                                          ]["_id"]
                                                        }
                                                        type="checkbox"
                                                        onChange={this.handleMultiSelectChange.bind(
                                                          this,
                                                          this.state
                                                            .indexQuestion,
                                                          e
                                                        )}
                                                        value={e.answer}
                                                        checked="checked"
                                                        disabled={
                                                          e.readonly
                                                            ? "disabled"
                                                            : ""
                                                        }
                                                      />
                                                    ) : (
                                                      <input
                                                        id={forclass}
                                                        className={inputclass}
                                                        name={
                                                          this.state.listArr[
                                                            this.state
                                                              .indexQuestion
                                                          ]["_id"]
                                                        }
                                                        type="checkbox"
                                                        onChange={this.handleMultiSelectChange.bind(
                                                          this,
                                                          this.state
                                                            .indexQuestion,
                                                          e
                                                        )}
                                                        value={e.answer}
                                                        disabled={
                                                          e.readonly
                                                            ? "disabled"
                                                            : ""
                                                        }
                                                      />
                                                    )}
                                                    <span for={forclass}>
                                                      {e.answer}
                                                    </span>
                                                  </label>
                                                </p>
                                              );
                                            })}
                                          </div>
                                          <div
                                            class="col-12 align-self-center"
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            <button
                                              style={{
                                                minWidth: "150px",
                                              }}
                                              class="pink_btn"
                                              type="button"
                                              onClick={this.saveIndexAnswer.bind(
                                                this
                                              )}
                                            >
                                              Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}

                                      {this.state.listArr[
                                        this.state.indexQuestion
                                      ]["answerType"] === 3 ? (
                                        <div className="row">
                                          <div
                                            className="col-12"
                                            style={{
                                              marginBottom: "30px",
                                              textAlign: "center",
                                            }}
                                          >
                                            <div className="cus_input input_wrap">
                                              <input
                                                type="text"
                                                required
                                                value={
                                                  this.state.freeTextAnswer
                                                }
                                                onChange={this.handleFreeTextChange.bind(
                                                  this
                                                )}
                                                style={{
                                                  textAlign: "center",
                                                }}
                                              />
                                            </div>
                                          </div>
                                          <div
                                            className="col-12"
                                            style={{
                                              marginBottom: "30px",
                                              display: this.state.listArr[
                                                this.state.indexQuestion
                                              ]["selectAnswer"]
                                                ? "block"
                                                : "none",
                                            }}
                                          >
                                            {this.state.listArr[
                                              this.state.indexQuestion
                                            ]["answers"].map((e, key) => {
                                              var forclass = e._id + key;

                                              var innnerpclass =
                                                "fancy2 highlight fancy2_" +
                                                key;
                                              var pcalss =
                                                this.state.listArr[
                                                  this.state.indexQuestion
                                                ]["selectAnswer"] &&
                                                this.state.listArr[
                                                  this.state.indexQuestion
                                                ]["selectAnswer"].includes(
                                                  e._id
                                                )
                                                  ? innnerpclass
                                                  : "fancy2 highlight";
                                              var inputclass = "input_" + key;
                                              return (
                                                <p className={pcalss}>
                                                  <label>
                                                    {key === 0 ? (
                                                      <b class="option_ _a">
                                                        A
                                                      </b>
                                                    ) : null}
                                                    {key === 1 ? (
                                                      <b class="option_ _b">
                                                        B
                                                      </b>
                                                    ) : null}
                                                    {key === 2 ? (
                                                      <b class="option_ _c">
                                                        C
                                                      </b>
                                                    ) : null}
                                                    {key === 3 ? (
                                                      <b class="option_ _d">
                                                        D
                                                      </b>
                                                    ) : null}
                                                    {key === 4 ? (
                                                      <b class="option_ _e">
                                                        E
                                                      </b>
                                                    ) : null}
                                                    {key === 5 ? (
                                                      <b class="option_ _f">
                                                        F
                                                      </b>
                                                    ) : null}

                                                    {e.correctAnswer ===
                                                    true ? (
                                                      <input
                                                        id={forclass}
                                                        className={inputclass}
                                                        name={
                                                          this.state.listArr[
                                                            this.state
                                                              .indexQuestion
                                                          ]["_id"]
                                                        }
                                                        type="checkbox"
                                                        value={e.answer}
                                                        checked="checked"
                                                        disabled="disabled"
                                                      />
                                                    ) : (
                                                      <input
                                                        id={forclass}
                                                        className={inputclass}
                                                        name={
                                                          this.state.listArr[
                                                            this.state
                                                              .indexQuestion
                                                          ]["_id"]
                                                        }
                                                        type="checkbox"
                                                        value={e.answer}
                                                        disabled="disabled"
                                                      />
                                                    )}
                                                    <span for={forclass}>
                                                      {e.answer}
                                                    </span>
                                                  </label>
                                                </p>
                                              );
                                            })}
                                          </div>
                                          <div
                                            class="col-12 align-self-center"
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            <button
                                              style={{
                                                minWidth: "150px",
                                              }}
                                              class="pink_btn"
                                              type="button"
                                              onClick={this.submitFreeText.bind(
                                                this
                                              )}
                                            >
                                              Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}

                                      {
                                        // (this.state.listArr[this.state.indexQuestion]['answerType'] === 4) ?
                                        // 	this.state.listArr[this.state.indexQuestion]['answers'].map((e, key) => {
                                        // 		var forclass = e._id + key;
                                        // 		return <p className={
                                        // 			(this.state.listArr[this.state.indexQuestion]['selectAnswer']) ?
                                        // 				(this.state.listArr[this.state.indexQuestion]['selectAnswer'] === e._id && e.correctAnswer === true) ?
                                        // 					'fancy2 highlight' :
                                        // 					(this.state.listArr[this.state.indexQuestion]['selectAnswer'] === e._id && e.correctAnswer === false) ? 'fancy2 pinkhighlight' : (e.correctAnswer === true) ? 'fancy2 highlight' : 'fancy2 pinkhighlight'
                                        // 				: 'fancy2'
                                        // 		}>
                                        // 			<label>
                                        // 				{(key === 0) ? <b class="option_ _a">A</b> : null}
                                        // 				{(key === 1) ? <b class="option_ _b">B</b> : null}
                                        // 				{(key === 2) ? <b class="option_ _c">C</b> : null}
                                        // 				{(key === 3) ? <b class="option_ _d">D</b> : null}
                                        // 				{(key === 4) ? <b class="option_ _e">E</b> : null}
                                        // 				{(key === 5) ? <b class="option_ _f">F</b> : null}
                                        // 				{(this.state.listArr[this.state.indexQuestion]['selectAnswer'] === e._id && e.correctAnswer === true) ?
                                        // 					<input id={forclass} name={this.state.listArr[this.state.indexQuestion]['_id']} type="radio" onChange={this.handleFlashcardSelectChange.bind(this, this.state.indexQuestion, e)} value={e.answer} checked="checked" disabled={(e.readonly) ? 'disabled' : ''} /> :
                                        // 					<input id={forclass} name={this.state.listArr[this.state.indexQuestion]['_id']} type="radio" onChange={this.handleFlashcardSelectChange.bind(this, this.state.indexQuestion, e)} value={e.answer} disabled={(e.readonly) ? 'disabled' : ''} />
                                        // 				}
                                        // 				<span for={forclass}>{e.answer}</span>
                                        // 			</label>
                                        // 		</p>
                                        // 	})
                                        // 	: null
                                      }

                                      {this.state.listArr[
                                        this.state.indexQuestion
                                      ]["answerType"] === 5 ? (
                                        <div>
                                          <p
                                            className={
                                              this.state.listArr[
                                                this.state.indexQuestion
                                              ]["selectAnswer"] === true
                                                ? this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["isAnswerTrue"] === true
                                                  ? "fancy2 highlight"
                                                  : "fancy2 pinkhighlight"
                                                : this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["isAnswerTrue"] === false
                                                ? "fancy2 highlight"
                                                : this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["selectAnswer"] === false
                                                ? "fancy2 pinkhighlight"
                                                : "fancy2"
                                            }
                                          >
                                            <label>
                                              <b className="option_ _a">A</b>
                                              <input
                                                id="trueFalse1"
                                                name={
                                                  this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["_id"]
                                                }
                                                type="radio"
                                                onChange={this.handleTrueFalseSelectChange.bind(
                                                  this,
                                                  this.state.indexQuestion,
                                                  true
                                                )}
                                                value="true"
                                                disabled={
                                                  this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["readonly"]
                                                    ? "disabled"
                                                    : ""
                                                }
                                              />
                                              <span for="trueFalse1">True</span>
                                            </label>
                                          </p>
                                          <p
                                            className={
                                              this.state.listArr[
                                                this.state.indexQuestion
                                              ]["selectAnswer"] === false
                                                ? this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["isAnswerTrue"] === true
                                                  ? "fancy2 highlight"
                                                  : "fancy2 pinkhighlight"
                                                : this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["isAnswerTrue"] === false
                                                ? "fancy2 highlight"
                                                : this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["selectAnswer"] === true
                                                ? "fancy2 pinkhighlight"
                                                : "fancy2"
                                            }
                                          >
                                            <label>
                                              <b class="option_ _b">B</b>
                                              <input
                                                id="trueFalse2"
                                                name={
                                                  this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["_id"]
                                                }
                                                type="radio"
                                                onChange={this.handleTrueFalseSelectChange.bind(
                                                  this,
                                                  this.state.indexQuestion,
                                                  false
                                                )}
                                                value="false"
                                                disabled={
                                                  this.state.listArr[
                                                    this.state.indexQuestion
                                                  ]["readonly"]
                                                    ? "disabled"
                                                    : ""
                                                }
                                              />
                                              <span for="trueFalse2">
                                                False
                                              </span>
                                            </label>
                                          </p>
                                        </div>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            )}
                            <div
                              class="align-self-center"
                              style={{
                                textAlign: "center",
                                width: "100%",
                                float: "left",
                              }}
                            >
                              <button
                                style={{
                                  minWidth: "150px",
                                }}
                                class="pink_btn"
                                type="button"
                                onClick={this.saveExitAnswer.bind(this)}
                              >
                                Exit
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  ) : this.state.winnerScreen ? (
                    <section id="hero" class="d-flex align-items-center">
                      <div class="quizz-game2" style={{ marginTop: "35px" }}>
                        <p></p>
                        <br />
                        {this.state.isWinnerScreenShow ? (
                          this.state.activelistArr.length > 0 ? (
                            this.state.activelistArr.map((e, i) => {
                              return (
                                <>
                                  <h3
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Contest completed
                                  </h3>
                                  <br />
                                  <div class="firstthree">
                                    <div class="_1st">
                                      <div class="_1stimg">
                                        <div class="leaderimg2">
                                          <img
                                            src={
                                              e.image !== ""
                                                ? e.image
                                                : "avatars/placeholder-user.png"
                                            }
                                            className="rounded-circle"
                                            width="75px"
                                            height="75px"
                                            alt="user image"
                                          />
                                          <p
                                            style={{
                                              background:
                                                "#FFC542 0% 0% no-repeat padding-box",
                                            }}
                                          >
                                            1
                                          </p>
                                        </div>
                                        <div class="user-detail">
                                          <h3>{e.name}</h3>
                                        </div>
                                        <div class="point">
                                          <h5>{e.score} pt</h5>
                                        </div>
                                      </div>
                                    </div>
                                    {this.state.showGoLeaderBoardBtn ? (
                                      <div class="full_btn">
                                        <a href="#/contest">
                                          <button
                                            class="blue_btn"
                                            type="button"
                                          >
                                            Go To Leader Board
                                          </button>
                                        </a>
                                      </div>
                                    ) : null}
                                  </div>
                                </>
                              );
                            })
                          ) : (
                            <>
                              <h3
                                style={{
                                  textAlign: "center",
                                }}
                              >
                                Contest completed
                              </h3>
                              <br />
                              <br />
                              <br />

                              {this.state.showGoLeaderBoardBtn ? (
                                <div class="full_btn">
                                  <a href="#/contest">
                                    <button class="blue_btn" type="button">
                                      Go To Leader Board
                                    </button>
                                  </a>
                                </div>
                              ) : null}
                            </>
                          )
                        ) : (
                          <>
                            <h3
                              style={{
                                textAlign: "center",
                              }}
                            >
                              Contest completed you win {this.state.totalScore}{" "}
                              pt
                            </h3>
                            <br />
                            <h3
                              style={{
                                textAlign: "center",
                              }}
                            >
                              Round {this.state.totalScore} score
                            </h3>
                            <br />
                            <div class="firstthree">
                              <div class="_1st">
                                <div class="_1stimg">
                                  <div class="leaderimg2">
                                    <img src={this.state.profile_picture} />
                                    <p
                                      style={{
                                        background:
                                          "#FFC542 0% 0% no-repeat padding-box",
                                      }}
                                    >
                                      1
                                    </p>
                                  </div>
                                  <div class="user-detail">
                                    <h3>{this.state.name}</h3>
                                  </div>
                                  <div class="point">
                                    <h5>{this.state.totalScore} pt</h5>
                                  </div>
                                </div>
                              </div>
                              {this.state.showGoLeaderBoardBtn ? (
                                <div class="full_btn">
                                  <a href="#/contest">
                                    <button class="blue_btn" type="button">
                                      Go To Leader Board
                                    </button>
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          </>
                        )}
                      </div>
                    </section>
                  ) : null
                ) : (
                  <div className="container contest-detail-with-round">
                    <div class="row">
                      <div class="col-lg-12 col-md-1 col-12">
                        <div class="cate-box2">
                          {/* <img src='img/undo.svg' className="undo_btn" onClick={() => { this.props.history.push('/dashboard') }} /> */}
                          <img
                            src={
                              this.state.contestData.image !== ""
                                ? this.state.contestData.image
                                : "avatars/placeholder.png"
                            }
                            alt="Game"
                            className="main"
                          />
                          <div class="cat_title2">
                            <div className="detailContestWithRoundList">
                              <div className="row">
                                <div class="cat_title2 col-lg-12 col-md-12">
                                  <h3
                                    style={{
                                      paddingLeft: "0px",
                                    }}
                                  >
                                    {this.state.contestData.title}
                                  </h3>
                                  <p>{this.state.contestData.description}</p>
                                </div>
                                <div className="col-lg-12 col-md-12 align-self-center mb-3">
                                  <div className="accordion-wrapper">
                                    <div className="acc-title">
                                      Round Detail
                                    </div>
                                    {
                                      <div
                                        style={{
                                          padding: "10px 0",
                                        }}
                                        className="rounded-0"
                                      >
                                        <div className="">
                                          {this.state.roundListArr.length >
                                          0 ? (
                                            <div>
                                              {this.state.roundListArr[
                                                this.state.currentIndexRound
                                              ].totalQuestions > 0 ||
                                              this.state.roundListArr[
                                                this.state.currentIndexRound
                                              ].gameType === "Blank" ? (
                                                <div>
                                                  <p>
                                                    {this.state.roundListArr[
                                                      this.state
                                                        .currentIndexRound
                                                    ].title !== ""
                                                      ? this.state.roundListArr[
                                                          this.state
                                                            .currentIndexRound
                                                        ].title
                                                      : this.state.roundListArr[
                                                          this.state
                                                            .currentIndexRound
                                                        ].gameType}
                                                    {this.state.roundListArr[
                                                      this.state
                                                        .currentIndexRound
                                                    ].gameType != "Blank" ? (
                                                      <span>
                                                        (
                                                        {
                                                          this.state
                                                            .roundListArr[
                                                            this.state
                                                              .currentIndexRound
                                                          ].totalQuestions
                                                        }
                                                        {this.state
                                                          .roundListArr[
                                                          this.state
                                                            .currentIndexRound
                                                        ].totalQuestions > 1
                                                          ? "Questions"
                                                          : "Question"}
                                                        )
                                                      </span>
                                                    ) : null}
                                                  </p>
                                                  <p>
                                                    {" "}
                                                    {
                                                      this.state.roundListArr[
                                                        this.state
                                                          .currentIndexRound
                                                      ].description
                                                    }
                                                  </p>

                                                  {/* {this.state.createdBy == JSON.parse(reactLocalStorage.get('userData')).userId ? (



																				):(null)} */}

                                                  {this.props.isModerator ? (
                                                    <button
                                                      style={{
                                                        minWidth: "150px",
                                                      }}
                                                      class="yellow_btn"
                                                      type="button"
                                                      onClick={this._startRoundModerator.bind(
                                                        this,
                                                        true
                                                      )}
                                                    >
                                                      Start Round
                                                    </button>
                                                  ) : null}

                                                  {/* <button style={{ minWidth: '150px' }} class="yellow_btn" type="button" onClick={this.playContest.bind(this)}>Start Round</button> */}
                                                </div>
                                              ) : null}
                                            </div>
                                          ) : (
                                            <div
                                              style={{
                                                color: "white",
                                                width: "100%",
                                                textAlign: "center",
                                                marginTop: "85px",
                                                marginBottom: "85px",
                                              }}
                                              className="flex"
                                            >
                                              <p className="item-author text-color">
                                                No have any round
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              <section
                className="ff"
                id="exampleModalCenter"
                style={{
                  float: "right",
                  position: "relative",
                  width: "50%",
                  top: "30px",
                }}
              >
                <div className="quizz-game2 waiting_screen">
                  <h3>Asking to Join</h3>
                  <p>You'll Join the Room</p>
                  <span
                    className="waiting_spinner spinner-border spinner-border-sm mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </div>
              </section>
            </>
          )}
        </main>

        <CModal
          show={this.state.openModel}
          closeOnBackdrop={false}
          onClose={() => this.setState({ openModel: false })}
          color="danger"
          centered
        >
          <CModalBody className="model-bg">
            <div>
              <div className="modal-body">
                <button
                  type="button"
                  className="close"
                  onClick={() => this.setState({ openModel: false })}
                >
                  <span aria-hidden="true">
                    <img src="./murabbo/img/close.svg" />
                  </span>
                </button>
                <div className="model_data">
                  <div className="model-title">
                    <h3>Report Contest</h3>
                  </div>

                  {/* <div className="cus_input input_wrap">
											<img src="./murabbo/img/title.svg" />
											<input
												required
												type="text"
												onChange={this.handleChange.bind(
													this,
													"title"
												)}
												value={
													this.state.fields["title"]
												}
											/>
											<label>Title</label>
										</div>
										<span className="error-msg">
											{this.state.errors["title"]}
										</span> */}

                  <div className="cus_input input_wrap">
                    <img src="./murabbo/img/des.svg" alt="Murabbo" />{" "}
                    <input
                      required
                      type="text"
                      onChange={this.handleChange.bind(this, "description")}
                      value={this.state.fields["description"]}
                    />
                    <label>Description</label>
                  </div>
                  <span className="error-msg">
                    {this.state.errors["description"]}
                  </span>

                  <div className="full_btn">
                    <button
                      style={{ marginBottom: "15px" }}
                      className="yellow_btn"
                      type="button"
                      onClick={this.handleSubmit.bind(this)}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CModalBody>
        </CModal>

        <CModal
          show={this.state.openModelForGiveScore}
          closeOnBackdrop={false}
          onClose={() => this.setState({ openModelForGiveScore: false })}
          color="danger"
          centered
        >
          <CModalBody className="model-bg">
            <div>
              <div className="modal-body">
                <button
                  type="button"
                  className="close"
                  onClick={() =>
                    this.setState({
                      openModelForGiveScore: false,
                    })
                  }
                >
                  <span aria-hidden="true">
                    <img src="./murabbo/img/close.svg" />
                  </span>
                </button>
                <div className="model_data">
                  <div className="model-title">
                    <h3>Give Score</h3>
                  </div>

                  {this.state.activelistArr.length > 0 ? (
                    <>
                      {this.state.activelistArr.map((e, i) => {
                        return (
                          <>
                            {" "}
                            <div
                              className="container"
                              style={{
                                marginBottom: "10px",
                              }}
                              key={i}
                            >
                              <div className="row">
                                <div className="col-md-12">
                                  <div className="row">
                                    <div className="col-md-4">
                                      <div className="giveScoreImg_">
                                        <img
                                          src={
                                            e.image !== ""
                                              ? e.image
                                              : "avatars/placeholder-user.png"
                                          }
                                          className="rounded-circle"
                                          width="75px"
                                          height="75px"
                                          alt="user image"
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-8 text-left">
                                      <div>
                                        <h3
                                          style={{
                                            color: "#88d8b8",
                                            textAlign: "left",
                                          }}
                                        >
                                          {e.name}
                                        </h3>
                                      </div>
                                      <div>
                                        <p
                                          style={{
                                            color: "#ffffff85",
                                          }}
                                        >
                                          {" "}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="row"
                                    style={{
                                      marginTop: "30px",
                                    }}
                                  >
                                    <div
                                      className="col-md-12"
                                      style={{
                                        display: "flex",
                                        alignItem: "center",
                                        justifyContent: "center",
                                        gap: "14px",
                                      }}
                                    >
                                      <div
                                        className={
                                          this.state.isActive ==
                                          e._id + "" + -10
                                            ? "scoreBadge active-scoreBadge"
                                            : "scoreBadge"
                                        }
                                        onClick={this.modifyActiveUser.bind(
                                          this,
                                          e._id,
                                          -10
                                        )}
                                      >
                                        -10
                                      </div>
                                      <div
                                        className={
                                          this.state.isActive == e._id + "" + -5
                                            ? "scoreBadge active-scoreBadge"
                                            : "scoreBadge"
                                        }
                                        onClick={this.modifyActiveUser.bind(
                                          this,
                                          e._id,
                                          -5
                                        )}
                                      >
                                        -5
                                      </div>
                                      <div
                                        className={
                                          this.state.isActive == e._id + "" + 0
                                            ? "scoreBadge active-scoreBadge"
                                            : "scoreBadge"
                                        }
                                        onClick={this.modifyActiveUser.bind(
                                          this,
                                          e._id,
                                          0
                                        )}
                                      >
                                        0
                                      </div>
                                      <div
                                        className={
                                          this.state.isActive == e._id + "" + 5
                                            ? "scoreBadge active-scoreBadge"
                                            : "scoreBadge"
                                        }
                                        onClick={this.modifyActiveUser.bind(
                                          this,
                                          e._id,
                                          5
                                        )}
                                      >
                                        5
                                      </div>
                                      <div
                                        className={
                                          this.state.isActive == e._id + "" + 10
                                            ? "scoreBadge active-scoreBadge"
                                            : "scoreBadge"
                                        }
                                        onClick={this.modifyActiveUser.bind(
                                          this,
                                          e._id,
                                          10
                                        )}
                                      >
                                        10
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr />
                          </>
                        );
                      })}

                      <div className="full_btn">
                        <button
                          style={{
                            marginBottom: "15px",
                          }}
                          className="yellow_btn"
                          type="button"
                          onClick={this.handleSubmitScore.bind(this)}
                        >
                          Submit
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        color: "white",
                        width: "100%",
                        textAlign: "center",
                        marginTop: "150px",
                        marginBottom: "150px",
                      }}
                      className="flex"
                    >
                      <p className="item-author text-color">No data found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CModalBody>
        </CModal>

        <CModal
          show={this.state.openModelForMembers}
          closeOnBackdrop={false}
          onClose={() => this.setState({ openModelForMembers: false })}
          color="danger"
          centered
        >
          <CModalBody className="model-bg">
            <div>
              <div className="modal-body">
                <button
                  type="button"
                  className="close"
                  onClick={() =>
                    this.setState({
                      openModelForMembers: false,
                    })
                  }
                >
                  <span aria-hidden="true">
                    <img src="./murabbo/img/close.svg" />
                  </span>
                </button>
                <div className="model_data">
                  <div className="model-title">
                    <h3>Members</h3>
                  </div>

                  <div className="container">
                    <div className="row">
                      <div className="col-md-12">
                        <div class="_1st2-member two_no">
                          <div className="_1stimg">
                            <div className="memberImg_">
                              <img
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  borderRadius: "50%",
                                }}
                                src="https://dev-api.murabbo.com/api/uploads/user/user_1629697346574SzqRHG.jpeg"
                              />
                            </div>
                            <div className="member_details">
                              <h5
                                style={{
                                  color: "#fff",
                                }}
                              >
                                kevin
                              </h5>
                            </div>
                            <div className="icons-members">
                              <img
                                src="./murabbo/img/callRight.png"
                                width="26px"
                                height="23px"
                                alt="callRight"
                              />
                              <img
                                src="./murabbo/img/callMic.png"
                                width="26px"
                                height="23px"
                                alt="callMic"
                              />
                              <img
                                src="./murabbo/img/callCam.png"
                                width="26px"
                                height="23px"
                                alt="ccallCam"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div class="_1st2-member two_no">
                          <div className="_1stimg">
                            <div className="memberImg_">
                              <img
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  borderRadius: "50%",
                                }}
                                src="https://dev-api.murabbo.com/api/uploads/user/user_1629697346574SzqRHG.jpeg"
                              />
                            </div>
                            <div className="member_details">
                              <h5>kevin</h5>
                            </div>
                            <div className="icons-members">
                              <img
                                src="./murabbo/img/callRight.png"
                                width="26px"
                                height="23px"
                                alt="callRight"
                              />
                              <img
                                src="./murabbo/img/callMic.png"
                                width="26px"
                                height="23px"
                                alt="callMic"
                              />
                              <img
                                src="./murabbo/img/callCam.png"
                                width="26px"
                                height="23px"
                                alt="ccallCam"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div class="_1st2-member two_no">
                          <div className="_1stimg">
                            <div className="memberImg_">
                              <img
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  borderRadius: "50%",
                                }}
                                src="https://dev-api.murabbo.com/api/uploads/user/user_1629697346574SzqRHG.jpeg"
                              />
                            </div>
                            <div className="member_details">
                              <h5>kevin</h5>
                            </div>
                            <div className="icons-members">
                              <img
                                src="./murabbo/img/callRight.png"
                                width="26px"
                                height="23px"
                                alt="callRight"
                              />
                              <img
                                src="./murabbo/img/callMic.png"
                                width="26px"
                                height="23px"
                                alt="callMic"
                              />
                              <img
                                src="./murabbo/img/callCam.png"
                                width="26px"
                                height="23px"
                                alt="ccallCam"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CModalBody>
        </CModal>
      </>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(StartRound);
