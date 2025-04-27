import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/chatProvider";
import { Avatar, Box, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { MdAddReaction } from "react-icons/md";

const ScrollableChat = ({
  message,
  handleDeleteMessage,
  handleReactToMessage,
  showEmojiPickerForMessage,
  setShowEmojiPickerForMessage,
}) => {
  const { user } = ChatState();

  const getMimeType = (fileType) => {
    const mimeTypes = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
    };
    return mimeTypes[fileType] || "application/octet-stream";
  };
  const emojiOptions = [
    { icon: "👍", label: "Like" },
    { icon: "❤️", label: "Love" },
    { icon: "😂", label: "Laugh" },
    { icon: "🎉", label: "Celebrate" },
    { icon: "🙌", label: "Praise" },
  ];

  return (
    <ScrollableFeed>
      {message &&
        message.map((m, i) => (
          <div style={{ display: "flex", flexDirection: "column" }} key={m._id}>
            <div style={{ display: "flex" }}>
              {(isSameSender(message, m, i, user._id) ||
                isLastMessage(message, i, user._id)) && (
                <Tooltip
                  label={m.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}

              <div
                style={{
                  position: "relative",
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  borderRadius: "20px",
                  padding: "10px 15px",
                  maxWidth: "75%",
                  marginLeft: isSameSenderMargin(message, m, i, user._id),
                  marginTop: isSameUser(message, m, i, user._id) ? 3 : 6,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  // flexDirection: m.isFile ? "column" : "row",
                }}
                className="message-container"
              >
                {m.isFile ? (
                  <>
                    {m.fileType === ".jpeg" ||
                    m.fileType === ".jpg" ||
                    m.fileType === ".png" ? (
                      <img
                        src={m.content}
                        alt="uploaded"
                        style={{
                          maxWidth: "100%",
                          borderRadius: "10px",
                          objectFit: "cover",
                        }}
                      />
                    ) : m.fileType === ".mp4" || m.fileType === ".mov" ? (
                      <video
                        controls
                        style={{
                          maxWidth: "100%",
                          borderRadius: "10px",
                          objectFit: "cover",
                          width: "300px",
                        }}
                      >
                        <source
                          src={m.content}
                          type={getMimeType(m.fileType)}
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : m.fileType === ".pdf" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "10px",
                          padding: "3px 8px",
                          margin: "5px 0",
                          width: "100%",
                        }}
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                          alt="PDF Icon"
                          style={{
                            width: "30px",
                            height: "30px",
                            marginRight: "8px",
                          }}
                        />
                        <p style={{ margin: "0", flex: 1, color: "#333" }}>
                          PDF Document
                        </p>
                        <a
                          href={m.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "#007bff" }}
                        >
                          Open
                        </a>
                      </div>
                    ) : (
                      <a
                        href={m.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#000" }}
                      >
                        Download File
                      </a>
                    )}
                  </>
                ) : (
                  <span>{m.content}</span>
                )}

                {/* Delete Icon */}
                {m.sender._id === user._id && (
                  <Tooltip label="Delete Message" placement="top" hasArrow>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeleteMessage(m._id)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      }}
                      className="delete-icon"
                    />
                  </Tooltip>
                )}

                {/* Emoji Add Button */}
                <Box display="flex" alignItems="center" gap={4} mt={1}>
                  <IconButton
                    icon={<MdAddReaction />}
                    size="xs"
                    onClick={() =>
                      setShowEmojiPickerForMessage(
                        showEmojiPickerForMessage === m._id ? null : m._id
                      )
                    }
                  />
                  {showEmojiPickerForMessage === m._id && (
                    <Box
                      position="absolute"
                      zIndex={1000}
                      top="100%"
                      {...(m.sender._id === user._id
                        ? { right: 0, flexDirection: "row-reverse" }
                        : { left: 0, flexDirection: "row" })}
                      bg="white"
                      border="1px solid #ccc"
                      borderRadius="md"
                      boxShadow="md"
                      p={2}
                      display="flex"
                      gap={2}
                    >
                      {emojiOptions.map(({ icon, label }) => (
                        <Tooltip
                          key={icon}
                          label={label}
                          placement="top"
                          hasArrow
                        >
                          <Text
                            fontSize="xl"
                            cursor="pointer"
                            onClick={() => {
                              handleReactToMessage(m._id, icon);
                              setShowEmojiPickerForMessage(null);
                            }}
                            _hover={{ transform: "scale(1.2)" }}
                          >
                            {icon}
                          </Text>
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                </Box>
              </div>
            </div>

            {/* Reactions Below Message */}
            {m.reactions && m.reactions.length > 0 && (
              <Box
                display="flex"
                gap="10px"
                ml={m.sender._id === user._id ? "auto" : "48px"}
                mr={m.sender._id === user._id ? "4px" : "auto"}
                mt="-2px"
                flexWrap="wrap"
              >
                {Object.entries(
                  m.reactions.reduce((acc, r) => {
                    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, userIds: [] };
                    acc[r.emoji].count++;
                    acc[r.emoji].userIds.push(r.userId);
                    return acc;
                  }, {})
                ).map(([emoji, data], index) => {
                  const userReacted = data.userIds.includes(user._id);
                  return (
                    <Tooltip
                      key={index}
                      label={userReacted ? "Tap to react" : "Tap to remove"}
                      placement="top"
                      hasArrow
                    >
                      <Box
                        key={index}
                        bg={userReacted ? "#D6BCFA" : "#EDF2F7"}
                        px={2}
                        py={1}
                        borderRadius="xl"
                        cursor="pointer"
                        _hover={{ bg: "#E2E8F0" }}
                        onClick={() => handleReactToMessage(m._id, emoji)}
                      >
                        <Text fontSize="md">
                          {emoji} {data.count > 1 && `x${data.count}`}
                        </Text>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            )}
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
