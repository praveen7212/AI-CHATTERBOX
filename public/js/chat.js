const API = "/api";

const token =
    localStorage.getItem("token");


// =========================
// AUTH CHECK
// =========================

if (!token) {

    window.location.href =
        "login.html";

}


// =========================
// VARIABLES
// =========================

let currentChatId = null;

let currentChatUser = null;

let typingTimeout = null;


// =========================
// ELEMENTS
// =========================

const chatList =
    document.getElementById("chatList");

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const activeChat =
    document.getElementById("activeChat");

const emptyChat =
    document.getElementById("emptyChat");

const chatName =
    document.getElementById("chatName");

const chatStatus =
    document.getElementById("chatStatus");


// =========================
// API HELPER
// =========================

async function apiRequest(
    url,
    options = {}
) {

    const response = await fetch(
        url,
        {
            ...options,

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`,

                ...(options.headers || {})
            }
        }
    );

    let data = null;

    try {

        data = await response.json();

    } catch {

        data = {};

    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong"
        );

    }

    return data;
}


// =========================
// LOAD USER
// =========================

function loadCurrentUser() {

    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) return;

    try {

        const user =
            JSON.parse(storedUser);

        const name =
            user.name ||
            user.username ||
            "User";

        document.getElementById(
            "myName"
        ).textContent = name;

        document.getElementById(
            "myAvatar"
        ).textContent =
            name.charAt(0).toUpperCase();

    } catch {

        console.log(
            "Could not read stored user"
        );

    }

}


// =========================
// LOAD CHATS
// =========================

async function loadChats() {

    try {

        const data =
            await apiRequest(
                `${API}/chat`
            );

        console.log(
            "Chats:",
            data
        );

        renderChats(data);

    } catch (error) {

        console.error(
            "Could not load chats:",
            error
        );

        showChatListError();

    }

}


// =========================
// RENDER CHATS
// =========================

function renderChats(data) {

    const chats =
        Array.isArray(data)
            ? data
            : data.chats || [];

    const aiItem =
        document.getElementById(
            "aiAssistant"
        );

    chatList.innerHTML = "";

    chatList.appendChild(aiItem);


    if (chats.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "no-chats";

        empty.textContent =
            "No chats yet";

        empty.style.padding =
            "20px";

        empty.style.color =
            "#777";

        chatList.appendChild(empty);

        return;

    }


    chats.forEach(
        (chat) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "chat-item";

            /*
             IMPORTANT:

             Backend ke actual fields ke
             according to yahan values
             adjust kar sakte ho.
            */

            const otherUser =
                getOtherUser(chat);

            const name =
                otherUser?.name ||
                chat.name ||
                "User";

            const userId =
                otherUser?._id ||
                otherUser?.id ||
                chat.userId ||
                chat.otherUserId;


            item.dataset.userId =
                userId || "";

            item.dataset.chatId =
                chat._id ||
                chat.id;


            item.innerHTML = `

                <div class="avatar">
                    ${escapeHTML(
                        name
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div class="chat-info">

                    <h4>
                        ${escapeHTML(name)}
                    </h4>

                    <p>
                        ${escapeHTML(
                            chat.lastMessage ||
                            "Open conversation"
                        )}
                    </p>

                </div>
            `;


            item.addEventListener(
                "click",
                () => {

                    openChat(
                        chat,
                        otherUser
                    );

                }
            );


            chatList.appendChild(item);

        }
    );

}


// =========================
// GET OTHER USER
// =========================

function getOtherUser(chat) {

    /*
     Handles common backend structures.

     Exact structure depends on
     your Chat model.
    */

    if (
        Array.isArray(chat.users)
    ) {

        return chat.users.find(
            user =>
                user._id !==
                getCurrentUserId()
        );

    }

    if (chat.otherUser) {

        return chat.otherUser;

    }

    if (chat.recipient) {

        return chat.recipient;

    }

    return null;

}


// =========================
// CURRENT USER ID
// =========================

function getCurrentUserId() {

    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) return null;

    try {

        const user =
            JSON.parse(storedUser);

        return (
            user._id ||
            user.id
        );

    } catch {

        return null;

    }

}


// =========================
// OPEN CHAT
// =========================

async function openChat(
    chat,
    otherUser
) {

    currentChatId =
        chat._id ||
        chat.id;

    currentChatUser =
        otherUser?._id ||
        otherUser?.id ||
        chat.otherUserId ||
        chat.userId;


    emptyChat.style.display =
        "none";

    activeChat.style.display =
        "flex";


    const name =
        otherUser?.name ||
        chat.name ||
        "User";


    chatName.textContent =
        name;


    chatStatus.textContent =
        "Offline";


    messages.innerHTML = "";


    await loadMessages();

}


// =========================
// LOAD MESSAGES
// =========================

async function loadMessages() {

    if (!currentChatId) return;


    try {

        const data =
            await apiRequest(
                `${API}/chat/${currentChatId}/messages`
            );


        const messageList =
            Array.isArray(data)
                ? data
                : data.messages || [];


        messages.innerHTML = "";


        if (
            messageList.length === 0
        ) {

            showNoMessages();

            return;

        }


        messageList.forEach(
            message => {

                const type =
                    isMyMessage(message)
                        ? "sent"
                        : "received";

                addMessage(
                    message,
                    type
                );

            }
        );


        scrollToBottom();

    } catch (error) {

        console.error(
            "Messages error:",
            error
        );

    }

}


// =========================
// SEND MESSAGE
// =========================

async function sendMessage() {

    const text =
        messageInput.value.trim();


    if (!text) return;


    // AI ASSISTANT

    if (
        currentChatId === "AI"
    ) {

        await sendAIMessage(
            text
        );

        messageInput.value = "";

        return;

    }


    if (!currentChatId) {

        return;

    }


    sendBtn.disabled = true;


    try {

        const message =
            await apiRequest(
                `${API}/chat/${currentChatId}/messages`,
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            message: text,
                            content: text
                        })
                }
            );


        addMessage(
            message,
            "sent"
        );


        socket.emit(
            "send-message",
            {
                chatId:
                    currentChatId,

                message
            }
        );


        messageInput.value = "";


        socket.emit(
            "stop-typing",
            {
                chatId:
                    currentChatId
            }
        );


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            error.message
        );

    } finally {

        sendBtn.disabled = false;

    }

}


// =========================
// AI CHAT
// =========================

async function sendAIMessage(
    text
) {

    addMessage(
        {
            content: text,
            createdAt:
                new Date()
        },
        "sent"
    );


    showTyping();


    try {

        const data =
            await apiRequest(
                `${API}/chat/ai`,
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            message: text
                        })
                }
            );


        hideTyping();


        const reply =
            data.reply ||
            data.response ||
            data.answer ||
            data.message;


        if (!reply) {

            throw new Error(
                "AI response field not found"
            );

        }


        addMessage(
            {
                content: reply,
                createdAt:
                    new Date()
            },
            "received"
        );


    } catch (error) {

        hideTyping();


        console.error(
            "AI error:",
            error
        );


        addMessage(
            {
                content:
                    "AI response nahi aa raha. Backend/OpenAI configuration check karo.",
                createdAt:
                    new Date()
            },
            "received"
        );

    }

}


// =========================
// ADD MESSAGE
// =========================

function addMessage(
    message,
    type = "received"
) {

    if (!message) return;


    const text =
        message.content ||
        message.message ||
        message.text ||
        message.body ||
        "";


    if (!text) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        `message ${type}`;


    const content =
        document.createElement(
            "div"
        );

    content.textContent =
        text;


    const time =
        document.createElement(
            "span"
        );

    time.className =
        "message-time";

    time.textContent =
        formatTime(
            message.createdAt ||
            message.timestamp ||
            new Date()
        );


    div.appendChild(content);

    div.appendChild(time);

    messages.appendChild(div);


    scrollToBottom();

}


// =========================
// CHECK MY MESSAGE
// =========================

function isMyMessage(
    message
) {

    const currentUserId =
        getCurrentUserId();


    const sender =
        message.sender ||
        message.user ||
        message.from;


    const senderId =
        typeof sender === "object"
            ? sender?._id ||
              sender?.id
            : sender;


    return (
        senderId &&
        currentUserId &&
        String(senderId) ===
        String(currentUserId)
    );

}


// =========================
// TYPING
// =========================

function startTyping() {

    if (!currentChatId) return;


    socket.emit(
        "typing",
        {
            chatId:
                currentChatId
        }
    );


    clearTimeout(
        typingTimeout
    );


    typingTimeout =
        setTimeout(
            () => {

                socket.emit(
                    "stop-typing",
                    {
                        chatId:
                            currentChatId
                    }
                );

            },
            1000
        );

}


// =========================
// SHOW TYPING
// =========================

function showTyping() {

    const indicator =
        document.getElementById(
            "typingIndicator"
        );


    indicator.style.display =
        "flex";

}


// =========================
// HIDE TYPING
// =========================

function hideTyping() {

    const indicator =
        document.getElementById(
            "typingIndicator"
        );


    indicator.style.display =
        "none";

}


// =========================
// ONLINE/OFFLINE
// =========================

function updateUserStatus(
    userId,
    online
) {

    const item =
        document.querySelector(
            `.chat-item[data-user-id="${userId}"]`
        );


    if (item) {

        item.classList.toggle(
            "user-online",
            online
        );

    }


    if (
        currentChatUser &&
        String(currentChatUser) ===
        String(userId)
    ) {

        chatStatus.textContent =
            online
                ? "Online"
                : "Offline";


        chatStatus.classList.toggle(
            "online",
            online
        );

    }

}


// =========================
// AI ASSISTANT
// =========================

document
    .getElementById(
        "aiAssistant"
    )
    .addEventListener(
        "click",
        () => {

            currentChatId =
                "AI";

            currentChatUser =
                "AI";


            emptyChat.style.display =
                "none";


            activeChat.style.display =
                "flex";


            chatName.textContent =
                "AI Assistant";


            chatStatus.textContent =
                "Always available";


            chatStatus.classList.add(
                "online"
            );


            messages.innerHTML = "";

        }
    );


// =========================
// SEND BUTTON
// =========================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// =========================
// ENTER
// =========================

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =========================
// TYPING INPUT
// =========================

messageInput.addEventListener(
    "input",
    startTyping
);


// =========================
// LOGOUT
// =========================

document
    .getElementById(
        "logoutBtn"
    )
    .addEventListener(
        "click",
        () => {

            socket.emit(
                "user-offline",
                {
                    token
                }
            );


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "login.html";

        }
    );


// =========================
// SEARCH
// =========================

document
    .getElementById(
        "searchInput"
    )
    .addEventListener(
        "input",
        event => {

            const search =
                event.target.value
                    .toLowerCase()
                    .trim();


            const items =
                document.querySelectorAll(
                    ".chat-item"
                );


            let found = false;


            items.forEach(
                item => {

                    const text =
                        item.textContent
                            .toLowerCase();


                    const visible =
                        text.includes(
                            search
                        );


                    item.style.display =
                        visible
                            ? "flex"
                            : "none";


                    if (visible) {
                        found = true;
                    }

                }
            );


            // AI item always exists

            if (!found && search) {

                console.log(
                    "No users found"
                );

            }

        }
    );


// =========================
// UTILITIES
// =========================

function formatTime(date) {

    if (!date) return "";

    return new Date(date)
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


function scrollToBottom() {

    messages.scrollTop =
        messages.scrollHeight;

}


function showNoMessages() {

    const empty =
        document.createElement(
            "div"
        );

    empty.textContent =
        "No messages yet";

    empty.style.textAlign =
        "center";

    empty.style.color =
        "#888";

    empty.style.padding =
        "30px";


    messages.appendChild(
        empty
    );

}


function showChatListError() {

    const error =
        document.createElement(
            "div"
        );

    error.textContent =
        "Unable to load chats";

    error.style.padding =
        "20px";

    error.style.color =
        "#dc2626";


    chatList.appendChild(
        error
    );

}


function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(text);

    return div.innerHTML;

}


// =========================
// START
// =========================

loadCurrentUser();

loadChats();