import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Icon from "../assets/Icon.png";
import BASE_URL from '../config';

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const createRoomId = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/room/create`
      );
      setRoomId(res.data.roomId);
      toast.success("Created new room");
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomId || !username) {
      toast.error("Room ID and username are required");
      return;
    }

    try {
      await axios.get(
        `${BASE_URL}/room/verify/${roomId}`
      );
      navigate(`editor/${roomId}`, {
        state: {
          username,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join room");
    }
  };

  const handleRoomIdChange = (e) => {
    setRoomId(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  return (
    <div className="homePage">
      <div className="formWrapper">
        <img src={Icon} alt="Icon" />
        <div className="inputGrp">
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={handleRoomIdChange}
            aria-label="Room ID"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            aria-label="Username"
          />
          <div className="btnGrp">
            <button className="btn joinBtn" onClick={joinRoom}>
              Join
            </button>
            <button
              className={`btn ${isLoading ? "btnInactive" : "createRoom"}`}
              onClick={createRoomId}
              disabled={isLoading}
            >
              {isLoading ? <Loader size={12} /> : "Create Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
