const API_BASE = "https://localhost:7269/api"; // Adjust if needed

// Form containers
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Toggle links
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Message elements
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");

// If user already has token, redirect to main app
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem("token");

    if (token) {
        window.location.href = 'index.html';
    }
});

// UI Toggle (Login / Register)
showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
});

showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
});

// Login Handler
document.getElementById("loginFormElement").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset error message
    loginError.classList.remove("show");

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // Handle invalid credentials
        if (!response.ok) {
            throw new Error("Invalid email or password");
        }

        const data = await response.json();

        // Store JWT token in localStorage
        localStorage.setItem("token", data.token);

        // Redirect to main application
        window.location.href = "index.html";

    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.add("show");
    }
});

// Register Handler
document.getElementById("registerFormElement").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset messages
    registerError.classList.remove("show");
    registerSuccess.classList.remove("show");

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        // Handle failure
        if (!response.ok) {
            throw new Error("Failed to create account");
        }

        // Show success message
        registerSuccess.textContent = "Account created successfully! You can now sign in.";
        registerSuccess.classList.add("show");

        // Clear form inputs
        document.getElementById("registerFormElement").reset();

        // Automatically switch back to login after a short delay
        setTimeout(() => {
            registerForm.classList.remove("active");
            loginForm.classList.add("active");
        }, 1500);

    } catch (error) {
        registerError.textContent = error.message;
        registerError.classList.add("show");
    }
});