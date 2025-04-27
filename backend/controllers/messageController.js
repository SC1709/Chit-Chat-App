const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const path = require("path");
const fs = require("fs");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  // Send message to chat
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    //populate every user of message model
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const uploadFileMessage = async (req, res) => {
  const { chatId } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }
  try {
    const newMessage = {
      sender: req.user._id,
      content: `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`,
      chat: chatId,
      isFile: true, // Mark as a file message
      fileType: path.extname(req.file.originalname).toLowerCase(),
    };

    const message = await Message.create(newMessage);
    await message.populate("sender", "name pic");
    await message.populate("chat");
    await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "File upload failed.", error: error.message });
  }
};
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  console.log(messageId);
  console.log("Type of messageId:", typeof messageId);

  try {
    const message = await Message.findById(messageId);
    console.log(message);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the requesting user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You can only delete your own messages" });
    }
    // Remove the associated file if the message contains a file and isFile is true
    if (message.isFile && message.content) {
      const filePath = path.join(
        __dirname,
        "../uploads",
        path.basename(message.content)
      );
      console.log("Attempting to delete file:", filePath);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

const reactToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  try {
    // console.log("Incoming emoji reaction:", req.body, "for message:", req.params.messageId);
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const userId = req.user._id.toString();

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId && r.emoji === emoji
    );

    if (existingReactionIndex !== -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions = message.reactions.filter(
        (r) => r.user.toString() !== userId
      );
      // Add the new one here
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "name pic")
      .populate("chat")
      .populate("reactions.user", "name pic email");

    res.json(updatedMessage);
  } catch (error) {
    console.error("React Error:", error.message);
    res.status(500).send("Server error while reacting to message");
  }
});

module.exports = {
  sendMessage,
  allMessages,
  uploadFileMessage,
  deleteMessage,
  reactToMessage,
};
