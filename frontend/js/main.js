document.addEventListener("DOMContentLoaded", () => {
    const registerButton = document.getElementById("register");
    const loginButton = document.getElementById("login");
    const toRegisterLink = document.getElementById("toRegister");
    const toLoginLink = document.getElementById("toLogin"); // novo link
    const container = document.getElementById("container");

    function isMobile() {
        return window.innerWidth <= 768;
    }

    if (isMobile()) {
        container.classList.add("show-login");
    }

    if (registerButton) {
        registerButton.addEventListener("click", () => {
            if (isMobile()) {
                container.classList.add("show-register");
                container.classList.remove("show-login");
            } else {
                container.classList.add("right-panel-active");
            }
        });
    }

    if (loginButton) {
        loginButton.addEventListener("click", () => {
            if (isMobile()) {
                container.classList.add("show-login");
                container.classList.remove("show-register");
            } else {
                container.classList.remove("right-panel-active");
            }
        });
    }

    if (toRegisterLink) {
        toRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            container.classList.add("show-register");
            container.classList.remove("show-login");
        });
    }

    if (toLoginLink) {
        toLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            container.classList.add("show-login");
            container.classList.remove("show-register");
        });
    }
});
