const socket = io();

const socketToken =
    localStorage.getItem("token");


// =========================
// CONNECT
// =========================

socket.on("connect", () => {

    console.log(
        "Socket connected:",
        socket.id
    );

    socket.emit(
        "user-online",
        {
            token: socketToken
        }
    );

});


// =========================
// DISCONNECT
// =========================

socket.on("disconnect", () => {

    console.log("Socket disconnected");

});


// =========================
// USER ONLINE
// =========================

socket.on(
    "user-online",
    (data) => {

        console.log(
            "User online:",
            data
        );

        if (
            typeof updateUserStatus ===
            "function"
        ) {

            updateUserStatus(
                data.userId,
                true
            );

        }

    }
);


// =========================
// USER OFFLINE
// =========================

socket.on(
    "user-offline",
    (data) => {

        console.log(
            "User offline:",
            data
        );

        if (
            typeof updateUserStatus ===
            "function"
        ) {

            updateUserStatus(
                data.userId,
                false
            );

        }

    }
);


// =========================
// TYPING
// =========================

socket.on(
    "user-typing",
    (data) => {

        if (
            typeof currentChatUser !==
            "undefined" &&
            data.userId === currentChatUser
        ) {

            showTyping();

        }

    }
);


// =========================
// STOP TYPING
// =========================

socket.on(
    "user-stop-typing",
    (data) => {

        if (
            typeof currentChatUser !==
            "undefined" &&
            data.userId === currentChatUser
        ) {

            hideTyping();

        }

    }
);


// =========================
// RECEIVE MESSAGE
// =========================

socket.on(
    "receive-message",
    (message) => {

        console.log(
            "Received message:",
            message
        );

        if (
            typeof addMessage ===
            "function"
        ) {

            addMessage(
                message,
                "received"
            );

        }

    }
);