// import React from "react";
// import ScrollableFeed from "react-scrollable-feed";
// import {
//   isLastMessage,
//   isSameSender,
//   isSameSenderMargin,
//   isSameUser,
// } from "../config/ChatLogics";
// import { ChatState } from "../Context/chatProvider";
// import { Avatar, IconButton, Tooltip } from "@chakra-ui/react";
// import { DeleteIcon } from "@chakra-ui/icons";

// const ScrollableChat = ({ message,handleDeleteMessage }) => {
//   const { user } = ChatState();
//   const getMimeType = (fileType) => {
//     const mimeTypes = {
//       ".mp4": "video/mp4",
//       ".mov": "video/quicktime",
//     };
//     return mimeTypes[fileType] || "application/octet-stream";
//   };

//   return (
//     <ScrollableFeed>
//       {message &&
//         message.map((m, i) => (
//           <div style={{ display: "flex" }} key={m._id}>
//             {(isSameSender(message, m, i, user._id) ||
//               isLastMessage(message, i, user._id)) && (
//               <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
//                 <Avatar
//                   mt="7px"
//                   mr={1}
//                   size="sm"
//                   cursor="pointer"
//                   name={m.sender.name}
//                   src={m.sender.pic}
//                 />
//               </Tooltip>
//             )}
//              {/* Add delete button if the current user is the sender */}
//             {m.sender._id === user._id && (
//             <Tooltip label="Delete Message" placement="top" hasArrow>
//               <IconButton
//                 icon={<DeleteIcon />}
//                 size="sm"
//                 colorScheme="red"
//                 onClick={() => handleDeleteMessage(m._id)}
//                 style={{ marginLeft: "10px" }}
//               />
//             </Tooltip>
//           )}

//             {/* Handling for messages with files */}
//             {m.isFile ? (
//               <div
//                 style={{
//                   backgroundColor: `${
//                     m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
//                   }`,
//                   borderRadius: "20px",
//                   padding: "10px 15px",
//                   maxWidth: "75%",
//                   alignSelf:
//                     m.sender._id === user._id ? "flex-end" : "flex-start",
//                   marginTop: isSameUser(message, m, i, user._id) ? 3 : 10,
//                   marginLeft: isSameSenderMargin(message, m, i, user._id),
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems:
//                     m.sender._id === user._id ? "flex-end" : "flex-start",
//                 }}
//               >
//                 {/* Dynamically render different file types */}
//                 {m.fileType === ".jpeg" ||
//                 m.fileType === ".jpg" ||
//                 m.fileType === ".png" ? (
//                   <img
//                     src={m.content}
//                     alt="uploaded"
//                     style={{
//                       maxWidth: "100%",
//                       borderRadius: "10px",
//                       objectFit: "cover",
//                     }}
//                   />
//                 ) : m.fileType === ".mp4" || m.fileType === ".mov" ? (
//                   <video
//                     controls
//                     style={{
//                       maxWidth: "100%",
//                       borderRadius: "10px",
//                       objectFit: "cover",
//                       width: "300px",
//                     }}
//                     ref={(videoElement) => {
//                       if (videoElement) {
//                         videoElement.playbackRate = 1;
//                       }
//                     }}
//                   >
//                     <source src={m.content} type={getMimeType(m.fileType)} />
//                     Your browser does not support the video tag.
//                   </video>
//                 ) : m.fileType === ".pdf" ? (
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       backgroundColor: "#f5f5f5",
//                       borderRadius: "10px",
//                       padding: "3px 8px",
//                       margin: "5px 0",
//                       width: "100%",
//                     }}
//                   >
//                     <img
//                       src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
//                       alt="PDF Icon"
//                       style={{
//                         width: "30px",
//                         height: "30px",
//                         marginRight: "8px",
//                       }}
//                     />
//                     <p
//                       style={{
//                         margin: "0",
//                         flex: 1,
//                         color: "#333",
//                         paddingRight: "8px",
//                       }}
//                     >
//                       PDF Document
//                     </p>
//                     <a
//                       href={m.content}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style={{
//                         textDecoration: "none",
//                         color: "#007bff",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Open
//                     </a>
//                   </div>
//                 ) : (
//                   <a
//                     href={m.content}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{
//                       textDecoration: "none",
//                       color: "#000",
//                       padding: "5px",
//                     }}
//                   >
//                     Download File
//                   </a>
//                 )}
//               </div>
//             ) : (
//               <span
//                 style={{
//                   backgroundColor: `${
//                     m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
//                   }`,
//                   borderRadius: "20px",
//                   padding: "5px 15px",
//                   maxWidth: "75%",
//                   marginLeft: isSameSenderMargin(message, m, i, user._id),
//                   marginTop: isSameUser(message, m, i, user._id) ? 3 : 10,
//                 }}
//               >
//                 {m.content}
//               </span>
//             )}
//           </div>
//         ))}
//     </ScrollableFeed>
//   );
// };

// export default ScrollableChat;

import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/chatProvider";
import { Avatar, IconButton, Tooltip } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const ScrollableChat = ({ message, handleDeleteMessage }) => {
  const { user } = ChatState();

  const getMimeType = (fileType) => {
    const mimeTypes = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
    };
    return mimeTypes[fileType] || "application/octet-stream";
  };

  return (
    <ScrollableFeed>
      {message &&
        message.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(message, m, i, user._id) ||
              isLastMessage(message, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
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
                position: "relative", // Positioning for hover-based delete icon
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                borderRadius: "20px",
                padding: "10px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(message, m, i, user._id),
                marginTop: isSameUser(message, m, i, user._id) ? 3 : 10,
                display: "flex",
                alignItems: "center",
                flexDirection: m.isFile ? "column" : "row",
              }}
              className="message-container"
            >
              {m.isFile ? (
                // Handle different file types
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
                      ref={(videoElement) => {
                        if (videoElement) {
                          videoElement.playbackRate = 1;
                        }
                      }}
                    >
                      <source src={m.content} type={getMimeType(m.fileType)} />
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

              {/* Delete icon visible only when hovering */}
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
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
