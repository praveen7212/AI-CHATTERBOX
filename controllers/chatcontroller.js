const Chat = require("../models/Chat");
const Message = require("../models/Message");
const aiService = require("../services/aiService");

// Create Chat
const createChat = async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.user.userId,
            title: "New Chat"
        });

        res.status(201).json({
            message: "Chat created",
            chat
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create chat",
            error: error.message
        });
    }
};


// Get User Chats
const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        res.json(chats);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get chats",
            error: error.message
        });
    }
};


// Get Messages
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            chat: req.params.chatId
        }).sort({ createdAt: 1 });

        res.json(messages);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get messages",
            error: error.message
        });
    }
};


// Send Normal Message
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        const newMessage = await Message.create({
            chat: req.params.chatId,
            sender: req.user.userId,
            message,
            type: "user"
        });

        res.status(201).json({
            message: "Message sent",
            data: newMessage
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message
        });
    }
};


// AI Chat
const aiChat = async (req, res) => {
    try {
        const { message } = req.body;

        const aiResponse = await aiService(message);

        res.json({
            message: aiResponse
        });

    } catch (error) {
        res.status(500).json({
            message: "AI response failed",
            error: error.message
        });
    }
};


module.exports = {
    createChat,
    getChats,
    getMessages,
    sendMessage,
    aiChat
};