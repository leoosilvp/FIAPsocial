//verificar se tem o RM salvo
window.addEventListener("DOMContentLoaded", function () {
    const savedRM = localStorage.getItem("savedRM");
    if (savedRM) {
        document.getElementById("user").value = savedRM;
        document.getElementById("remember").checked = true;
    }
});

document.getElementById("btn").addEventListener("click", function (event) {
    event.preventDefault();

    const rm = document.getElementById("user").value.trim();
    const password = document.getElementById("password").value.trim();
    const rememberMe = document.getElementById("remember");
    const errorMsg = document.getElementById("errorMsg");

    // Validação do RM
    if (!/^\d{6}$/.test(rm)) {
        errorMsg.textContent = "Formato de RM inválido.";
        return;
    }

    // Validação da senha
    if (password.length < 8) {
        errorMsg.textContent = "A senha deve ter no mínimo 8 caracteres.";
        return;
    }

    // Verifica credenciais
    fetch("./db/users.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao carregar o banco de dados.");
            }
            return response.json();
        })
        .then(users => {
            const userFound = users.find(user => user.rm === rm && user.password === password);

            if (userFound) {
                errorMsg.textContent = "";

                // salva ou remove o RM do localStorage
                if (rememberMe.checked) {
                    localStorage.setItem("savedRM", rm);
                } else {
                    localStorage.removeItem("savedRM", rm);
                }

                window.location.href = "./src/pages/home.html";
            } else {
                errorMsg.textContent = "RM ou senha inválidos.";
                document.getElementById("password").value = "";
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            errorMsg.textContent = "Erro ao verificar login.";
        });
});