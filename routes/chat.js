const express = require("express");
const router = express.Router();

const {
    createChat,
    getChats,
    getMessages,
    sendMessage,
    aiChat
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

// AI Chat
router.post("/ai", authMiddleware, aiChat);

// Create a new chat
router.post("/", authMiddleware, createChat);

// Get all chats of logged-in user
router.get("/", authMiddleware, getChats);

// Get messages of a particular chat
router.get("/:chatId/messages", authMiddleware, getMessages);

// Send a normal message
router.post("/:chatId/message", authMiddleware, sendMessage);

module.exports = router;