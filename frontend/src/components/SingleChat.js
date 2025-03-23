import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/chatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowUpIcon, AttachmentIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "./../config/ChatLogics";
import ProfileModel from "./miscellaneous/ProfileModel";
import UpdateGroupChatModel from "./miscellaneous/UpdateGroupChatModel";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie-player";
import animationData from "../animation/typing.json";
import io from "socket.io-client";
const apiUrl = process.env.REACT_APP_API_URL;

const ENDPOINT = process.env.REACT_APP_API_URL;
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();

  const fetchMessage = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `${apiUrl}/api/message/${selectedChat._id}`,
        config
      );
      // console.log(message);

      setMessage(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessage();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const sendMessage = async (event) => {
    if (!newMessage || newMessage.trim() === "") return; // Prevent sending empty messages
    // if(event.key==="Enter" && newMessage){
    socket.emit("stop typing", selectedChat._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewMessage("");
      const { data } = await axios.post(
        `${apiUrl}/api/message`,
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config
      );
      // console.log(data);

      socket.emit("new message", data);
      setMessage([...message, data]);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    // }
  };

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessage([...message, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timeLength = 3000; //3sec
    setTimeout(() => {
      var currTime = new Date().getTime();
      var timeDiff = currTime - lastTypingTime;

      if (timeDiff >= timeLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timeLength);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    console.log(messageId);

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.delete(`${apiUrl}/api/message/${messageId}`, config);
      setMessage(message.filter((m) => m._id !== messageId)); // Update the message list locally
      // window.location.reload();
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast({
        title: "Error Occurred",
        description: "Failed to delete the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("chatId", selectedChat._id);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${apiUrl}/api/message/upload`,
        formData,
        config
      );

      socket.emit("new message", data);
      setMessage([...message, data]);
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "File Upload Error",
        description: "Failed to upload the file. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work Sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                {
                  <UpdateGroupChatModel
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessage={fetchMessage}
                  />
                }
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                {" "}
                <ScrollableChat
                  message={message}
                  handleDeleteMessage={handleDeleteMessage}
                />{" "}
              </div>
            )}

            <FormControl isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    loop
                    play={isTyping}
                    // autoplay
                    animationData={animationData}
                    style={{ width: 70, marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box display="flex" alignItems="center">
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  onChange={typingHandler}
                  value={newMessage}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendMessage();
                  }}
                />
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <IconButton
                    as="span"
                    icon={<AttachmentIcon />}
                    colorScheme="teal"
                    // onClick={handleFileUpload}
                  />
                </label>
                <Button
                  variant="solid"
                  colorScheme="blue"
                  size="sm"
                  onClick={handleFileUpload}
                  ml={2}
                  isDisabled={!selectedFile} // Disable if no file is selected
                >
                  Upload
                </Button>
                <Button
                  variant="solid"
                  colorScheme="blue"
                  size="sm"
                  onClick={sendMessage}
                  ml={2}
                >
                  <ArrowUpIcon />
                </Button>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work Sans">
            Click on a User to start the Chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
