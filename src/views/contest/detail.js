import React, { Component } from "react";
import { TheFooter, TheHeaderInner } from "../../containers/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import languages from "../../languages";
import configuration from "../../config";
import { reactLocalStorage } from "reactjs-localstorage";
import { CModal, CModalBody } from "@coreui/react";
import {
    joinRoomReqSend,
    setModerator,
    clearOthetUserStream,
    setRoomId,
    setSocket,
    flush,
} from "../../actions/socketAction";
import { connect } from "react-redux";
let contestId, roomId;

const mapStateToProps = (state) => {
    return {
        isModerator: state.socketReducers.isModerator,
    };
};
const mapDispatchToProps = (dispatch) => ({
    setModerator: (date) => dispatch(setModerator(date)),
    clearOthetUserStream: (date) => dispatch(clearOthetUserStream(date)),
    setRoomId: (date) => dispatch(setRoomId(date)),
    setSocket: (date) => dispatch(setSocket(date)),
    flush: (date) => dispatch(flush(date)),
});
class Detail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                invitedUserDetails: [],
                acceptedUserDetails: [],
                roomDetails: {},
            },
            contestData: { image: "" },
            userListInvite: [],
            userListInviteSearch: "",
            inviteFriendsModel: false,
            inviteModel: false,
            inviteUsersModel: false,
            playBottom: false,
        };
    }

    componentDidMount() {
        //     var that = this;

        //     navigator.getMedia = ( navigator.getUserMedia || // use the proper vendor prefix
        //         navigator.webkitGetUserMedia ||
        //         navigator.mozGetUserMedia ||
        //         navigator.msGetUserMedia);

        //     navigator.getMedia({video: true}, function() {
        //     that.setState({playBottom:true});
        // }, function() {
        //     that.setState({playBottom:false});
        //     });

        var userId = JSON.parse(reactLocalStorage.get("userData")).userId;

        var url = window.location.href;

        var urlParts = url.substring(url.lastIndexOf("/") + 1);
        urlParts = urlParts.split("?");

        if (urlParts[1]) {
            roomId = urlParts[1];
        }
        if (urlParts[0]) {
            contestId = urlParts[0];
        }

        fetch(configuration.baseURL + "room/room?roomId=" + roomId, {
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
                    let dataObj = this.state.data;
                    dataObj["roomDetails"] = data.data[0];
                    this.setState({ data: dataObj });
                }
            });

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
                    this.setState({ contestData: data.data[0] });
                }
            });
        this.getUsersList();
    }

    invite(data) {
        var userId = JSON.parse(reactLocalStorage.get("userData")).userId;
        if (data.is_invited === false) {
            fetch(configuration.baseURL + "room/inviteRoom", {
                method: "POSt",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + reactLocalStorage.get("clientToken"),
                },
                body: JSON.stringify({
                    roomId: roomId,
                    inviteUserId: data._id,
                }),
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (data.code === 200) {
                        this.componentDidMount();
                        return toast.success("Invite successfully");
                    } else {
                        return toast.error(data.message);
                    }
                });
        }
    }

    goToVideoChat(data) {
        // var userId = JSON.parse(reactLocalStorage.get("userData")).userId;
        // this.componentDidMount();
        var url = window.location.href;

        var urlParts = url.substring(url.lastIndexOf("/") + 1);
        urlParts = urlParts.split("?");
        this.props.history.push(`/videoChat/${urlParts[1]}`);
    }

    handleChange(e) {
        this.setState({ userListInviteSearch: e.target.value });
        this.getUsersList();
    }

    getUsersList() {
        var strSearch = this.state.userListInviteSearch
            ? "&searchKey=" + this.state.userListInviteSearch
            : "";
        fetch(
            configuration.baseURL +
                "room/userListInvite?roomId=" +
                roomId +
                strSearch,
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
                    this.setState({ userListInvite: data.data });
                }
            });
    }

    playWithoutVideo() {
        console.log("new break");
        this.props.flush();
        this.props.setModerator(true);
        this.props.clearOthetUserStream();
        this.props.setRoomId(roomId);
        this.props.setSocket("");
        this.props.history.replace(
            "/contests/start_round/" + contestId + "?" + roomId,
            { state: { roomDetails: this.state.data.roomDetails } }
        );
    }
    playWithVideo() {
        this.props.history.push("/videoChat/6163d78cdfa8fc1f8d64477f");
    }
    render() {
        return (
            <>
                <TheHeaderInner />
                <ToastContainer
                    position="top-right"
                    autoClose={25000}
                    style={{ top: "80px" }}
                />
                <main id="main">
                    <div className="container">
                        <div className="contest-detail-with-round">
                            <div class="row">
                                <div class="col-lg-12 col-md-12 col-12">
                                    <div
                                        style={{ height: "82vh" }}
                                        class="cate-box2"
                                    >
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
                                                    <div className="col-lg-12 col-md-12">
                                                        <div className="inline">
                                                            <h5
                                                                style={{
                                                                    paddingTop:
                                                                        "30px",
                                                                    color: "#fff",
                                                                }}
                                                            >
                                                                You need to be
                                                                with a friend to
                                                                play.
                                                            </h5>
                                                        </div>
                                                        <div
                                                            style={{
                                                                float: "right",
                                                            }}
                                                            className="inline "
                                                        >
                                                            <div className="abc-detail">
                                                                <p>Game PIN</p>
                                                                <h3>
                                                                    {
                                                                        this
                                                                            .state
                                                                            .data
                                                                            .roomDetails
                                                                            .gamePin
                                                                    }
                                                                </h3>
                                                            </div>
                                                            <div className="abc-detail">
                                                                <p>
                                                                    Game
                                                                    Password
                                                                </p>
                                                                <h3>
                                                                    {this.state
                                                                        .data
                                                                        .roomDetails
                                                                        .password
                                                                        ? this
                                                                              .state
                                                                              .data
                                                                              .roomDetails
                                                                              .password
                                                                        : "-NA-"}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "50px",
                                                            textAlign: "center",
                                                            float: "left",
                                                        }}
                                                        className="col-lg-4 col-md-6 col-sm-12"
                                                    >
                                                        <button
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                            className="yellow_btn"
                                                            type="button"
                                                            onClick={this.playWithoutVideo.bind(
                                                                this
                                                            )}
                                                        >
                                                            Play
                                                        </button>
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "50px",
                                                            textAlign: "center",
                                                            float: "left",
                                                        }}
                                                        className="col-lg-4 col-md-6 col-sm-12"
                                                    >
                                                        <button
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                            className="yellow_btn"
                                                            type="button"
                                                            onClick={this.playWithoutVideo.bind(
                                                                this
                                                            )}
                                                        >
                                                            Play without video
                                                        </button>
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                "50px",
                                                            textAlign: "center",
                                                            float: "left",
                                                        }}
                                                        className="col-lg-4 col-md-6 col-sm-12"
                                                    >
                                                        <button
                                                            className="yellow_btn"
                                                            type="button"
                                                        >
                                                            Play in-person
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
                        show={this.state.inviteModel}
                        closeOnBackdrop={false}
                        onClose={() => this.setState({ inviteModel: false })}
                        color="danger"
                        centered
                    >
                        <CModalBody className="model-bg">
                            <div>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() =>
                                        this.setState({ inviteModel: false })
                                    }
                                >
                                    <span aria-hidden="true">
                                        <img src="./murabbo/img/close.svg" />
                                    </span>
                                </button>
                                <div className="model_data">
                                    <div className="model-title">
                                        <h3>Add Friends</h3>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-10 offset-md-1">
                                            <div
                                                onClick={() =>
                                                    this.setState({
                                                        inviteUsersModel: true,
                                                        inviteModel: false,
                                                    })
                                                }
                                                className="addfriend"
                                            >
                                                <div className="inline">
                                                    <img src="./murabbo/img/magnifying-glass.svg" />
                                                </div>
                                                <div className="inline">
                                                    <h5>Add by Name</h5>
                                                </div>
                                                <div
                                                    style={{ float: "right" }}
                                                    className="inline arrow"
                                                >
                                                    <img src="./murabbo/img/arrow-right.svg" />
                                                </div>
                                            </div>
                                            <div className="addfriend">
                                                <div className="inline">
                                                    <img src="./murabbo/img/contacts.svg" />
                                                </div>
                                                <div className="inline">
                                                    <h5>Add from Contacts</h5>
                                                </div>
                                                <div
                                                    style={{ float: "right" }}
                                                    className="inline arrow"
                                                >
                                                    <img src="./murabbo/img/arrow-right.svg" />
                                                </div>
                                            </div>
                                            <div className="addfriend">
                                                <div className="inline">
                                                    <img src="./murabbo/img/facebook2.svg" />
                                                </div>
                                                <div className="inline">
                                                    <h5>
                                                        All Facebook Friends
                                                    </h5>
                                                </div>
                                                <div
                                                    style={{ float: "right" }}
                                                    className="inline arrow"
                                                >
                                                    <img src="./murabbo/img/arrow-right.svg" />
                                                </div>
                                            </div>

                                            <div className="full_btn mt50">
                                                <button
                                                    className="blue_btn"
                                                    type="button"
                                                >
                                                    Copy Profile Link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CModalBody>
                    </CModal>

                    <CModal
                        show={this.state.inviteUsersModel}
                        closeOnBackdrop={false}
                        onClose={() =>
                            this.setState({ inviteUsersModel: false })
                        }
                        color="danger"
                        centered
                    >
                        <CModalBody className="model-bg">
                            <button
                                type="button"
                                className="close"
                                onClick={() =>
                                    this.setState({ inviteUsersModel: false })
                                }
                            >
                                <span aria-hidden="true">
                                    <img src="./murabbo/img/close.svg" />
                                </span>
                            </button>
                            <div className="model_data">
                                <div className="model-title">
                                    <h3>Add By Name</h3>
                                </div>
                                <div className="row">
                                    <div className="col-md-10 offset-md-1">
                                        <div className="search2">
                                            <input
                                                placeholder="Search By keywords"
                                                onChange={this.handleChange.bind(
                                                    this
                                                )}
                                                type="text"
                                            />
                                            <i className="bx bx-search"></i>
                                        </div>
                                        <h3
                                            style={{
                                                color: "#FCD274",
                                                textAlign: "left",
                                                fontSize: "14px",
                                                paddingTop: "20px",
                                            }}
                                        >
                                            In This Room
                                        </h3>
                                        <div className="cus_scroll">
                                            {this.state.userListInvite.length >
                                            0 ? (
                                                this.state.userListInvite.map(
                                                    (e, key) => {
                                                        return (
                                                            <div className="participate-list">
                                                                <div className="inline">
                                                                    <img
                                                                        src={
                                                                            e.image
                                                                                ? e.image
                                                                                : "./avatars/placeholder-user.png"
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="inline">
                                                                    <h5>
                                                                        {e.name}
                                                                    </h5>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        float: "right",
                                                                    }}
                                                                    className="inline arrow"
                                                                >
                                                                    <button
                                                                        style={{
                                                                            margin: "0",
                                                                        }}
                                                                        type="button"
                                                                        className="yellow_btn"
                                                                        onClick={this.invite.bind(
                                                                            this,
                                                                            e
                                                                        )}
                                                                    >
                                                                        {e.is_invited
                                                                            ? "Added"
                                                                            : "Add"}
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
                                                        marginTop: "25px",
                                                        marginBottom: "25px",
                                                    }}
                                                    className="flex"
                                                >
                                                    <p className="item-author text-color">
                                                        No users available
                                                    </p>
                                                </div>
                                            )}
                                            <div className="full_btn mt50">
                                                <button
                                                    className="blue_btn"
                                                    type="button"
                                                    onClick={() =>
                                                        this.setState({
                                                            inviteUsersModel: false,
                                                        })
                                                    }
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CModalBody>
                    </CModal>

                    <CModal
                        show={this.state.inviteFriendsModel}
                        closeOnBackdrop={false}
                        onClose={() =>
                            this.setState({ inviteFriendsModel: false })
                        }
                        color="danger"
                        centered
                    >
                        <CModalBody className="model-bg">
                            <div>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() =>
                                        this.setState({
                                            inviteFriendsModel: false,
                                        })
                                    }
                                >
                                    <span aria-hidden="true">
                                        <img src="./murabbo/img/close.svg" />
                                    </span>
                                </button>
                                <div className="model_data">
                                    <div className="model-title">
                                        <h3>Invite Friends</h3>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-10 offset-md-1">
                                            <div className="search2">
                                                <input
                                                    placeholder="Search By keywords"
                                                    onChange={this.handleChange.bind(
                                                        this
                                                    )}
                                                    type="text"
                                                />
                                                <i className="bx bx-search"></i>
                                            </div>
                                            <h3
                                                style={{
                                                    color: "#FCD274",
                                                    textAlign: "left",
                                                    fontSize: "14px",
                                                    paddingTop: "20px",
                                                }}
                                            >
                                                In This Room
                                            </h3>
                                            <div className="cus_scroll">
                                                {this.state.data
                                                    .invitedUserDetails.length >
                                                0 ? (
                                                    this.state.data.invitedUserDetails.map(
                                                        (e, key) => {
                                                            return (
                                                                <div className="participate-list">
                                                                    <div className="inline">
                                                                        <img
                                                                            src={
                                                                                e.image
                                                                                    ? e.image
                                                                                    : "./avatars/placeholder-user.png"
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="inline">
                                                                        <h5>
                                                                            {
                                                                                e.name
                                                                            }
                                                                        </h5>
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
                                                            marginTop: "25px",
                                                            marginBottom:
                                                                "25px",
                                                        }}
                                                        className="flex"
                                                    >
                                                        <p className="item-author text-color">
                                                            No users available
                                                        </p>
                                                    </div>
                                                )}

                                                <h3
                                                    style={{
                                                        color: "#FCD274",
                                                        textAlign: "left",
                                                        fontSize: "14px",
                                                        paddingTop: "20px",
                                                    }}
                                                >
                                                    Invite Here
                                                </h3>

                                                {this.state.userListInvite
                                                    .length > 0 ? (
                                                    this.state.userListInvite.map(
                                                        (e, key) => {
                                                            return (
                                                                <div className="participate-list">
                                                                    <div className="inline">
                                                                        <img
                                                                            src={
                                                                                e.image
                                                                                    ? e.image
                                                                                    : "./avatars/placeholder-user.png"
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="inline">
                                                                        <h5>
                                                                            {
                                                                                e.name
                                                                            }
                                                                        </h5>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            float: "right",
                                                                        }}
                                                                        className="inline arrow"
                                                                    >
                                                                        <button
                                                                            style={{
                                                                                margin: "0",
                                                                            }}
                                                                            type="button"
                                                                            className="yellow_btn"
                                                                            onClick={this.invite.bind(
                                                                                this,
                                                                                e
                                                                            )}
                                                                        >
                                                                            {e.is_invited
                                                                                ? "Invited"
                                                                                : "Invite"}
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
                                                            marginTop: "25px",
                                                            marginBottom:
                                                                "25px",
                                                        }}
                                                        className="flex"
                                                    >
                                                        <p className="item-author text-color">
                                                            No users available
                                                        </p>
                                                    </div>
                                                )}

                                                <h3
                                                    style={{
                                                        color: "#FCD274",
                                                        textAlign: "left",
                                                        fontSize: "14px",
                                                        paddingTop: "20px",
                                                    }}
                                                >
                                                    Invite Contacts
                                                </h3>
                                                <div className="participate-list">
                                                    <div className="inline">
                                                        <img src="murabbo/img/team-3.jpg" />
                                                    </div>
                                                    <div className="inline">
                                                        <h5>Zen Lee Ho</h5>
                                                    </div>
                                                    <div
                                                        style={{
                                                            float: "right",
                                                        }}
                                                        className="inline arrow"
                                                    >
                                                        <button
                                                            style={{
                                                                margin: "0",
                                                            }}
                                                            type="button"
                                                            className="yellow_btn"
                                                        >
                                                            Invite
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="full_btn mt50">
                                                <button
                                                    className="blue_btn"
                                                    type="button"
                                                    onClick={this.goToVideoChat.bind(
                                                        this
                                                    )}
                                                >
                                                    Let's Play
                                                </button>
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
export default connect(mapStateToProps, mapDispatchToProps)(Detail);
