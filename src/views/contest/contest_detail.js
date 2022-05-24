import React, { Component } from "react";
import { TheFooter, TheHeaderInner } from "../../containers/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import languages from "../../languages";
import configuration from "../../config";
import { reactLocalStorage } from "reactjs-localstorage";
import { CModal, CModalBody } from "@coreui/react";
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
    flush,
    joinRoomReqSend,
    setRoomCreatorId,
    setWaitScreen,
    setModerator,
    clearOthetUserStream,
    setRoomId,
    setSocket,
} from "../../actions/socketAction";
import { connect } from "react-redux";
import $ from "jquery";
import InfiniteScroll from "react-infinite-scroll-component";
import VaniSetupHelper from "../videocall/utilities/VaniSetupHelper";
import VideoHandler from "../videocall/utilities/VideoHandler";
let contestId;

const mapStateToProps = (state) => {
    return {
        token: state.authReducers.token,
        clientToken: state.authReducers.clientToken,
        forgot_email: state.authReducers.forgot_email,
        is_login: state.authReducers.is_login,
        redirect: state.authReducers.redirect,
        reload: state.authReducers.reload,
        userData: state.authReducers.userData,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        addToken: (data) => dispatch(addToken(data)),
        addClientToken: (data) => dispatch(addClientToken(data)),
        addUserData: (data) => dispatch(addUserData(data)),
        add_is_login: (data) => dispatch(add_is_login(data)),
        addRedirect: (data) => dispatch(addRedirect(data)),
        addReload: (data) => dispatch(addReload(data)),
        subscription: (data) => dispatch(subscription(data)),
        forgot_email: (data) => dispatch(forgot_email(data)),
        joinRoomReqSend: (date) => dispatch(joinRoomReqSend(date)),
        setRoomCreatorId: (date) => dispatch(setRoomCreatorId(date)),
        setWaitScreen: (date) => dispatch(setWaitScreen(date)),
        setModerator: (date) => dispatch(setModerator(date)),
        clearOthetUserStream: (date) => dispatch(clearOthetUserStream(date)),
        setRoomId: (date) => dispatch(setRoomId(date)),
        setSocket: (date) => dispatch(setSocket(date)),
        flush: (date) => dispatch(flush(date)),
    };
};

class DetailContest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            data: {},
            contestData: { image: "" },
            show: true,
            listArr: [],
            RoomListArr: [],
            selectedRoundId: "",
            errorsPlay: {},
            fieldsPlay: { display_name: "", password: "" },
            playNewContestModel: false,
            playContestModel: false,
            playOldContestModel: false,
            searchTerm: "",
            page: 0,
            size: 2,
            subscriptionModel: false,
            hiddenPassword: true,
            currentPage: 0,
            hasmore: true,
        };
    }

    componentDidMount() {
        var url = window.location.href;
        contestId = url.substring(url.lastIndexOf("/") + 1);
        fetch(
            configuration.baseURL + "contest/contest?contestId=" + contestId,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + reactLocalStorage.get("clientToken"),
                },
            }
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.data.length > 0) {
                    console.log(data.data[0]);
                    this.setState({ contestData: data.data[0] });
                }
            });

        // this.roomList();
        this.getList(contestId);
        this.props.flush();
    }

    toggleShowPassword() {
        this.setState({ hiddenPassword: !this.state.hiddenPassword });
    }
    roomList() {
        fetch(
            configuration.baseURL +
                "room/room?contestId=" +
                contestId +
                "&page=" +
                this.state.page +
                "&size=" +
                this.state.size,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + reactLocalStorage.get("clientToken"),
                },
            }
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.data.length > 0) {
                    this.setState({ RoomListArr: data.data });
                }
            });
    }
    getList(contest_id1) {
        if (contest_id1) {
            fetch(
                configuration.baseURL + "round/round?contestId=" + contest_id1,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization:
                            "Bearer " + reactLocalStorage.get("clientToken"),
                    },
                }
            )
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (data.data.length > 0) {
                        var data = data.data;
                        this.setState({ selectedRoundId: data[0]._id });
                        this.setState({ listArr: data });
                    } else {
                        this.setState({ listArr: [] });
                    }
                });
        }
    }
    selectedRoundId(data) {
        if (this.state.contestData.isPublish) {
            if (data.totalQuestions === 0) {
                return toast.error(
                    "There are no have any question in this round!"
                );
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
        this.setState({ subscriptionModel: false });
        if (
            this.state.contestData.subscriptionType &&
            !configuration.checkUserHasAccess(
                this.state.contestData.subscriptionType
            )
        ) {
            this.setState({ subscriptionModel: true });
            return false;
        }
        console.log(this.state.contestData.playerType);
        if (this.state.contestData.playerType === 1) {
            this.props.history.push(
                "/contests/game/start/" +
                    contestId +
                    "?" +
                    this.state.selectedRoundId
            );
        } else {
            this.setState({
                playContestModel: true,
                errorsPlay: { display_name: "", password: "" },
                fieldsPlay: {
                    display_name: "",
                    password: "",
                    contestId: contestId,
                },
            });
        }
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

    joinRoomHandler(data) {
        console.log("wait break", data);
        const v = VaniSetupHelper.getInstance().setUp(data._id, false);
        // this.props.history.push('/detail-contest/'+contestId+'?'+data._id);
        this.props.setSocket("");
        this.props.joinRoomReqSend(true);
        this.props.setRoomId(data._id);
        this.props.setWaitScreen(true);
        this.props.setModerator(false);
        this.props.clearOthetUserStream();

        this.props.history.push(
            "/contests/start_round/" + contestId + "?" + data._id
        );
    }

    joinRoomContest(data) {
        this.props.history.push("/videoChat/" + data.gamePin);
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

            this.setState({ isLoading: true });
            fetch(configuration.baseURL + "room/room", {
                method: "post",
                headers: {
                    contentType: "application/json",
                    Authorization:
                        "Bearer " + reactLocalStorage.get("clientToken"),
                },
                body: data,
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    console.log("new data", data.data);
                    if (data.code === 200) {
                        this.setState({ isLoading: false });
                        this.props.setRoomCreatorId(data.data.createdBy);
                        this.props.history.push(
                            "/detail-contest/" +
                                fields["contestId"] +
                                "?" +
                                data.data._id
                        );
                        const v = VaniSetupHelper.getInstance().setUp(
                            data.data._id,
                            true
                        );
                    } else {
                        this.setState({ isLoading: false });
                        return toast.error(data.message);
                    }
                });
        }
    }

    fetchMoreData() {}

    async search(term) {
        if (term !== "") {
            term = term.target.value;
            await this.setState({ searchTerm: term });
        }

        this.setState({ isLoading: true });
        fetch(
            configuration.baseURL +
                "room/room?contestId=" +
                contestId +
                "&page=" +
                this.state.currentPage +
                "&size=2" +
                "&searchKey=" +
                this.state.searchTerm,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + reactLocalStorage.get("clientToken"),
                },
            }
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                this.setState({
                    RoomListArr: data.data,
                    isLoading: false,
                });
                this.setState({
                    playContestModel: false,
                    playOldContestModel: true,
                });
            });

        // fetch(configuration.baseURL+"category/categoryList", {
        // 		method: "GET",
        // 		headers: {
        // 			'Accept': 'application/json',
        // 			'Content-Type': 'application/json',
        // 			'Authorization': 'Bearer ' + reactLocalStorage.get('clientToken'),
        // 		}
        // 	}).then((response) =>{
        // 	return response.json();
        // }).then((data)=> {
        // 	var category = data.data;
        // 	this.setState({filterCategoryList:category});
        // });
    }

    handleRoomList() {
        this.setState({ isLoading: true });
        fetch(
            configuration.baseURL +
                "room/room?contestId=" +
                contestId +
                "&page=" +
                this.state.currentPage +
                "&size=2",
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + reactLocalStorage.get("clientToken"),
                },
            }
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                // if (data.data.length > 0) {

                this.setState({
                    RoomListArr: data.data,
                    isLoading: false,
                });
                // this.setState({
                // 	RoomListArr: this.state.RoomListArr.concat(data.data),
                // 	currentPage:this.state.currentPage+1,
                // 	hasmore:(data.data.length > 0) ? true : false,
                // 	isLoading:false
                //   });

                // this.setState({RoomListArr:data.data});
                // }else{
                // 	this.setState({RoomListArr:[]});
                // }
                this.setState({
                    playContestModel: false,
                    playOldContestModel: true,
                });
            });
    }

    render() {
        return (
            <>
                <TheHeaderInner />
                <ToastContainer
                    position="top-right"
                    autoClose={10000}
                    style={{ top: "80px" }}
                />
                <main id="main">
                    <div className="container">
                        <div className="contest-detail-with-round">
                            <div class="row">
                                <div class="col-lg-12 col-md-1 col-12">
                                    <div class="cate-box2">
                                        <img
                                            src="img/undo.svg"
                                            className="undo_btn"
                                            onClick={() => {
                                                this.props.history.push(
                                                    "/dashboard"
                                                );
                                            }}
                                        />
                                        <img
                                            src={
                                                this.state.contestData.image !==
                                                ""
                                                    ? this.state.contestData
                                                          .image
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
                                                                paddingLeft:
                                                                    "0px",
                                                            }}
                                                        >
                                                            {
                                                                this.state
                                                                    .contestData
                                                                    .title
                                                            }
                                                        </h3>
                                                        <p>
                                                            {
                                                                this.state
                                                                    .contestData
                                                                    .description
                                                            }
                                                        </p>
                                                    </div>
                                                    <div class="col-lg-12 col-md-12 align-self-center mb-3">
                                                        <button
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                            class="blue_btn"
                                                            type="button"
                                                            onClick={this.playContest.bind(
                                                                this
                                                            )}
                                                        >
                                                            Play
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CModal
                        show={this.state.subscriptionModel}
                        closeOnBackdrop={false}
                        onClose={() =>
                            this.setState({ subscriptionModel: false })
                        }
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
                                                subscriptionModel: false,
                                            })
                                        }
                                    >
                                        <span aria-hidden="true">
                                            <img src="./murabbo/img/close.svg" />
                                        </span>
                                    </button>
                                    <div className="model_data">
                                        <div className="model-title">
                                            <img
                                                src="./murabbo/img/close_pink.png"
                                                alt=""
                                            />
                                            <h3>
                                                You need to purchase
                                                subscription.
                                            </h3>
                                        </div>
                                        <img
                                            className="shape2"
                                            src="./murabbo/img/shape2.svg"
                                        />
                                        <img
                                            className="shape3"
                                            src="./murabbo/img/shape3.svg"
                                        />
                                        <div className="row">
                                            <div className="col-md-10 offset-md-1">
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        float: "left",
                                                        marginRight: "10px",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "150px",
                                                        }}
                                                        className="blue_btn"
                                                        type="button"
                                                        onClick={() =>
                                                            this.setState({
                                                                subscriptionModel: false,
                                                            })
                                                        }
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        float: "left",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "150px",
                                                        }}
                                                        className="pink_btn"
                                                        type="button"
                                                        onClick={() => {
                                                            this.props.history.push(
                                                                "/plans"
                                                            );
                                                        }}
                                                    >
                                                        Yes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CModalBody>
                    </CModal>
                    <CModal
                        show={this.state.playContestModel}
                        closeOnBackdrop={false}
                        onClose={() =>
                            this.setState({ playContestModel: false })
                        }
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
                                                playContestModel: false,
                                            })
                                        }
                                    >
                                        <span aria-hidden="true">
                                            <img src="./murabbo/img/close.svg" />
                                        </span>
                                    </button>
                                    <div className="model_data">
                                        <div className="model-title"></div>
                                        <img
                                            className="shape2"
                                            src="./murabbo/img/shape2.svg"
                                        />
                                        <img
                                            className="shape3"
                                            src="./murabbo/img/shape3.svg"
                                        />
                                        <div className="row">
                                            <div className="col-md-10 offset-md-1">
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "250px",
                                                            marginBottom:
                                                                "10px",
                                                        }}
                                                        className="blue_btn light_blue_btn"
                                                        type="button"
                                                        onClick={this.handleRoomList.bind(
                                                            this
                                                        )}
                                                    >
                                                        Pick a Room
                                                    </button>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "250px",
                                                            marginBottom:
                                                                "10px",
                                                        }}
                                                        className="yellow_btn"
                                                        type="button"
                                                        onClick={() =>
                                                            this.setState({
                                                                playContestModel: false,
                                                                playNewContestModel: true,
                                                            })
                                                        }
                                                    >
                                                        Play New
                                                    </button>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "250px",
                                                            marginBottom:
                                                                "10px",
                                                        }}
                                                        className="pink_btn"
                                                        type="button"
                                                        onClick={() =>
                                                            this.setState({
                                                                playContestModel: false,
                                                            })
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CModalBody>
                    </CModal>

                    <CModal
                        show={this.state.playOldContestModel}
                        scrollable
                        closeOnBackdrop={false}
                        onClose={() =>
                            this.setState({ playOldContestModel: false })
                        }
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
                                                playOldContestModel: false,
                                            })
                                        }
                                    >
                                        <span aria-hidden="true">
                                            <img src="./murabbo/img/close.svg" />
                                        </span>
                                    </button>
                                    <div className="model_data">
                                        <div className="model-title">
                                            <h3>Rooms</h3>
                                        </div>
                                        <img
                                            className="shape2"
                                            src="./murabbo/img/shape2.svg"
                                        />
                                        <img
                                            className="shape3"
                                            src="./murabbo/img/shape3.svg"
                                        />
                                        <div
                                            class="row search"
                                            style={{ marginBottom: "20px" }}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Search"
                                                value={this.state.searchTerm}
                                                onChange={this.search.bind(
                                                    this
                                                )}
                                            />
                                            <i className="bx bx-search"></i>
                                        </div>
                                        {this.state.isLoading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm mr-2"
                                                    style={{ color: "white" }}
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                {this.state.RoomListArr.length >
                                                0 ? (
                                                    this.state.RoomListArr.map(
                                                        (e, key) => {
                                                            return (
                                                                <div
                                                                    className="row"
                                                                    style={{
                                                                        marginTop:
                                                                            "10px",
                                                                        paddingBottom:
                                                                            "10px",
                                                                        borderBottom:
                                                                            "1px solid #fff",
                                                                    }}
                                                                >
                                                                    <div className="col-md-6">
                                                                        <p
                                                                            style={{
                                                                                color: "#FFC542",
                                                                            }}
                                                                        >
                                                                            {
                                                                                e.displayName
                                                                            }
                                                                            <span
                                                                                style={{
                                                                                    width: "100%",
                                                                                    float: "right",
                                                                                    font: "normal normal 300 14px Montserrat",
                                                                                    letterSpacing:
                                                                                        "0px",
                                                                                    color: "#FFFFFF",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    e.createdByName
                                                                                }
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    {/* <div class="col-md-2">
															<button class="blue_btn" type="button" onClick={this.joinRoomHandler.bind(this,e)}>Video</button>
														</div>  */}
                                                                    {/* <div class="col-md-2">
															<button class="blue_btn" type="button" onClick={this.joinRoomContest.bind(this,e)}>Video</button>
														</div>  */}
                                                                    <div className="col-md-4">
                                                                        <button
                                                                            type="button"
                                                                            className="yellow_btn"
                                                                            style={{
                                                                                float: "right",
                                                                            }}
                                                                            onClick={this.joinRoomHandler.bind(
                                                                                this,
                                                                                e
                                                                            )}
                                                                        >
                                                                            Join
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: "white",
                                                            width: "100%",
                                                            textAlign: "center",
                                                            marginTop: "85px",
                                                            marginBottom:
                                                                "85px",
                                                        }}
                                                        className="flex"
                                                    >
                                                        <p className="item-author text-color">
                                                            No have any room
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CModalBody>
                    </CModal>

                    <CModal
                        show={this.state.playNewContestModel}
                        closeOnBackdrop={false}
                        onClose={() =>
                            this.setState({ playNewContestModel: false })
                        }
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
                                                playNewContestModel: false,
                                            })
                                        }
                                    >
                                        <span aria-hidden="true">
                                            <img src="./murabbo/img/close.svg" />
                                        </span>
                                    </button>
                                    <div className="model_data">
                                        <div className="model-title">
                                            <h3>Set Password</h3>
                                            <h4>
                                                Password needs to be set for a
                                                privat e contest. Keeping it
                                                blank will make your contest
                                                Public to all.
                                            </h4>
                                        </div>
                                        <img
                                            className="shape2"
                                            src="./murabbo/img/shape2.svg"
                                        />
                                        <img
                                            className="shape3"
                                            src="./murabbo/img/shape3.svg"
                                        />
                                        <div className="row">
                                            <div className="col-md-10 offset-md-1">
                                                <div className="cus_input input_wrap">
                                                    <img src="./murabbo/img/title.svg" />
                                                    <input
                                                        required
                                                        type="text"
                                                        onChange={this.handleChangePlay.bind(
                                                            this,
                                                            "display_name"
                                                        )}
                                                        value={
                                                            this.state
                                                                .fieldsPlay[
                                                                "display_name"
                                                            ]
                                                        }
                                                    />
                                                    <label>Display Name</label>
                                                </div>
                                                <span className="error-msg">
                                                    {
                                                        this.state.errorsPlay[
                                                            "display_name"
                                                        ]
                                                    }
                                                </span>

                                                <div className="cus_input input_wrap">
                                                    <img src="./murabbo/img/password.svg" />
                                                    <input
                                                        required
                                                        type={
                                                            this.state
                                                                .hiddenPassword
                                                                ? "password"
                                                                : "text"
                                                        }
                                                        onChange={this.handleChangePlay.bind(
                                                            this,
                                                            "password"
                                                        )}
                                                        value={
                                                            this.state
                                                                .fieldsPlay[
                                                                "password"
                                                            ]
                                                        }
                                                    />
                                                    <label>Game Password</label>
                                                    <span
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            right: "27px",
                                                            top: "47px",
                                                        }}
                                                    >
                                                        {this.state
                                                            .hiddenPassword ? (
                                                            <img
                                                                src="./murabbo/img/eye-hide.png"
                                                                alt="eyeicon"
                                                                onClick={this.toggleShowPassword.bind(
                                                                    this
                                                                )}
                                                            />
                                                        ) : (
                                                            <img
                                                                src="./murabbo/img/eye.png"
                                                                alt="eyeicon"
                                                                onClick={this.toggleShowPassword.bind(
                                                                    this
                                                                )}
                                                            />
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="error-msg">
                                                    {
                                                        this.state.errorsPlay[
                                                            "password"
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                            <div className="col-md-10 offset-md-1">
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        float: "left",
                                                        marginRight: "10px",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "150px",
                                                        }}
                                                        disabled={
                                                            this.state.isLoading
                                                        }
                                                        className="blue_btn light_blue_btn"
                                                        type="button"
                                                        onClick={this.handleNext.bind(
                                                            this
                                                        )}
                                                    >
                                                        {this.state
                                                            .isLoading ? (
                                                            <>
                                                                <span
                                                                    className="spinner-border spinner-border-sm mr-2"
                                                                    role="status"
                                                                    aria-hidden="true"
                                                                ></span>
                                                                Loading...
                                                            </>
                                                        ) : (
                                                            "Next"
                                                        )}
                                                    </button>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                    className=""
                                                >
                                                    <button
                                                        style={{
                                                            minWidth: "150px",
                                                            float: "left",
                                                        }}
                                                        className="pink_btn"
                                                        type="button"
                                                        onClick={() =>
                                                            this.setState({
                                                                playNewContestModel: false,
                                                            })
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CModalBody>
                    </CModal>
                </main>
            </>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(DetailContest);
