const API_URL = "/api";


// =========================
// LOGIN
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");

        message.textContent = "Logging in...";

        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Login failed"
                );
            }

            // Backend may return token directly
            // or inside data.token
            const token =
                data.token ||
                data.data?.token;

            if (!token) {

                throw new Error(
                    "JWT token was not returned by server"
                );
            }

            localStorage.setItem("token", token);

            // Save user if backend returns it
            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            window.location.href = "chat.html";

        } catch (error) {

            message.textContent = error.message;

        }

    });

}


// =========================
// SIGNUP
// =========================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");

        const signupBtn =
            document.getElementById("signupBtn");

        signupBtn.disabled = true;

        signupBtn.textContent = "Creating...";

        try {

            const response = await fetch(
                `${API_URL}/auth/signup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Signup failed"
                );
            }

            message.textContent =
                "Account created. Redirecting...";

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1000);

        } catch (error) {

            message.textContent =
                error.message;

        } finally {

            signupBtn.disabled = false;

            signupBtn.textContent =
                "Create Account";

        }

    });

}