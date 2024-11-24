const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req,res) => {
    const {userId} = req.body;
    if(!userId){
        console.log("userId param not send with request");
        return res.sendStatus(400);
    }

    var ischat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users: { $elemMatch : {$eq: req.user._id}}},
            {users: { $elemMatch : {$eq: userId}}},
        ],
    }).populate("users","-password").populate("latestMessage");

    ischat = await User.populate(ischat, {
        path: "latestMessage.sender",
        select: "name email pic",
    });
    if(ischat.length > 0){
        res.send(ischat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id: createChat._id}).populate("users","-password");
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = asyncHandler(async (req,res) => {
    // console.log("User ID in request:", req.user._id);
    try {
        // console.log("User ID in request:", req.user._id);
        const result =Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            // console.log("Raw Query Result:", result);
        
        Chat.find({users: { $elemMatch : {$eq: req.user._id}}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1})
        .then(async (result) => {
            result = await User.populate(result, {
                path: "latestMessage.sender",
                select: "name email pic",
            });
            // console.log("Populated Result:", result);
            res.status(200).send(result);
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = asyncHandler(async (req,res) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message: "Please fill all the feilds"});
    }
        
    var users = JSON.parse(req.body.users);
    
    if(users.length < 2){
        return res.status(400).send("More than 2 users are required to form a group");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
          });
        const FullGroupChat = await Chat.findOne({_id: groupChat._id}).populate("users","-password")
        .populate("groupAdmin","-password");
        
        res.status(200).send(FullGroupChat);
    } catch (error) {
        // console.log("Error during Chat.create():", error.message);
        res.status(400);
        throw new Error(error.message);
    }
});

const renameGroup = asyncHandler(async (req,res) => {
    const {chatId, chatName} = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new:true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found");
    } else{
        res.json(updatedChat);
    }
});

const addToGroup = asyncHandler(async (req,res) => {
    const {chatId, userId} = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users:userId},
        },
        {
            new:true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!added){
        res.status(404);
        throw new Error("Chat Not Found");
    } else{
        res.json(added);
    }
});

const removeFromGroup = asyncHandler(async (req,res) => {
    const {chatId, userId} = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users:userId},
        },
        {
            new:true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!removed){
        res.status(404);
        throw new Error("Chat Not Found");
    } else{
        res.json(removed);
    }
});

module.exports = {accessChat ,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup};