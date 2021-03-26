import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
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

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", (stream) => {
            ref.current.srcObject = stream;
        });
    }, []);

    return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2,
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    // const roomId = props.match.params.roomId;
    const roomId = "room123";
    const userId = JSON.parse(reactLocalStorage.get("userData")).userId;
    const peers = [];

    useEffect(() => {
        socketRef.current = io("https://socketherokutest.herokuapp.com");
        // socketRef.current = io("http://localhost:8000");
        try {
            navigator.mediaDevices
                .getUserMedia({ video: videoConstraints, audio: true })
                .then((stream) => {
                    userVideo.current.srcObject = stream;
                    socketRef.current.emit("join-room", { roomId, userId });
                    socketRef.current.on("all_users", (users) => {
                        const peer = createPeer(
                            users,
                            socketRef.current.id,
                            stream
                        );
                        peersRef.current.push({
                            peerID: users,
                            peer,
                        });
                        peers.push(peer);
                        console.log("PEERS ::", peers);
                        setPeers(peers);
                    });

                    socketRef.current.on("user_joined", (payload) => {
                        console.log("STREAM ::", payload);
                        const peer = addPeer(
                            payload.signal,
                            payload.callerID,
                            stream
                        );
                        peersRef.current.push({
                            peerID: payload.callerID,
                            peer,
                        });

                        setPeers((users) => [...users, peer]);
                    });

                    socketRef.current.on(
                        "receiving returned signal",
                        (payload) => {
                            const item = peersRef.current.find(
                                (p) => p.peerID === payload.id
                            );
                            item.peer.signal(payload.signal);
                        }
                    );
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", (signal) => {
            socketRef.current.emit("sending signal", {
                userToSignal,
                callerID,
                signal,
            });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", (signal) => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return <Video key={index} peer={peer} />;
            })}
        </Container>
    );
};

export default Room;
