import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";
import styled from "styled-components";
import { reactLocalStorage } from "reactjs-localstorage";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

let peerServer;

let peers = {};

const Video = (props) => {
    // const ref = useRef();

    useEffect(() => {
        // props.item.on("stream", stream => {
        //     ref.current.srcObject = stream;
        // });
    }, []);

    return <StyledVideo playsInline autoPlay ref={props.item} />;
};

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = props => {
    // const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const currentStream = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);

    const [otherStreams, setotherStreams] = useState([]);

    const [isAudioMuted, setAudioMute] = useState(false);
    let roomUrl = window.location.href;
    const roomId = roomUrl.substring(roomUrl.lastIndexOf("/") + 1);
    // const roomId = "roomtestingsocket";
    const userId = JSON.parse(reactLocalStorage.get("userData")).userId;
    const muteAudio = () => {
        if (isAudioMuted) {
            setAudioMute(false);
            console.log("Enable audio");
            // console.log(socketRef.current.unmuteAudio());
            // localStream.unmuteAudio();
        } else {
            setAudioMute(true);
            console.log("Disable audio");
            // console.log(socketRef.current.muteAudio());
            // localStream.muteAudio();
        }
    };

    const logout = () => {
        console.log("logout");
        console.log(roomId, userId);

        socketRef.current.emit("leave-room", { roomId, userId });
        console.log(currentStream.current.getTracks());
        currentStream.current.getTracks().forEach(track => track.stop());
        // connectionRef.current.destroy()
    };
    useEffect(() => {
        socketRef.current = io("https://socketherokutest.herokuapp.com");
        console.log(socketRef.current);
        // socketRef.current = io("http://localhost:8000");
        try {
            peerServer = new Peer(undefined, {
                secure: false,
                config: {
                    iceServers: [
                        {
                            urls: [
                                "stun:stun1.l.google.com:19302",
                                "stun:stun2.l.google.com:19302"
                            ]
                        }
                    ]
                }
            });

            if (peerServer) {
                console.log("peer connection => ", peerServer);

                peerServer.on("connection", data => {
                    console.log("peer connect with data => ", data);
                });

                peerServer.on("disconnected", data => {
                    console.log("peer disconnect with data => ", data);
                });
            }

            peerServer.on("error", error =>
                console.log("peer error => ", error)
            );

            navigator.mediaDevices
                .getUserMedia({ video: videoConstraints, audio: true })
                .then(stream => {
                    userVideo.current.srcObject = stream;
                    currentStream.current = stream;
                    console.log("USERID ::", userId, stream);

                    peerServer.on("open", (peerUserId) => {
                        console.log("open join room", roomId);
                        socketRef.current.emit("join-room", { userId: peerUserId, roomId });
                    });


                    socketRef.current.on("user-connected", (userId) => {
                        // connectToNewUser(userId, stream, dispatch);
                        console.log("user connected => ", userId);

                        let resStreamId;

                        const call = peerServer.call(userId, stream);

                        call.on('stream', (remoteVideoStream) => {
                            if (remoteVideoStream) {
                                resStreamId = remoteVideoStream?.id;
                                setTimeout(() => {
                                    setotherStreams(prev => [...prev, remoteVideoStream]);
                                    // dispatch({ type: actionTypes.ADD_STREAM, payload: remoteVideoStream });
                                }, 400);
                            }
                        });

                        call.on("close", () => {
                            if (resStreamId) {
                                let streams = [...otherStreams];
                                streams = streams.filter(x => x.id !== resStreamId);
                                setotherStreams(streams);
                            }
                        });

                        peers[userId] = call;
                    });

                    // receive a call
                    peerServer.on('call', (call) => {
                        call.answer(stream);

                        let resStreamId;

                        // stream back the call
                        call.on('stream', (resstream) => {

                            resStreamId = resstream?.id;

                            setotherStreams(prev => [...prev, resstream]);
                            // dispatch({ type: actionTypes.ADD_STREAM, payload: resstream });
                        });

                        call.on("close", () => {
                            if (resStreamId) {
                                let streams = [...otherStreams];
                                streams = streams.filter(x => x.id !== resStreamId);
                                setotherStreams(streams);
                            }
                        });
                    });
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            <button onClick={muteAudio} style={{ width: '100px',height: '35px'}}>
                {isAudioMuted === true ? "Unmute" : "Mute"}
            </button>
            <button onClick={logout} style={{ width: '100px',height: '35px'}}>Logout</button>
            {otherStreams.map((item, index) => {
                console.log("other streams => ", item);
                // return null
                return <Video key={index.toString()} item={item} />;
            })}
        </Container>
    );
};

export default Room;
