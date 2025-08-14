document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.querySelector(".textarea");
    const btnPublish = document.getElementById("btn-publish");

    // Recupera posts salvos
    let postsSalvos = JSON.parse(localStorage.getItem("postsPerfil")) || [];

    function salvarPosts() {
        localStorage.setItem("postsPerfil", JSON.stringify(postsSalvos));
    }

    function gerarPostId() {
        return `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    function criarPostObj(texto, imagem = "", link = "") {
        return {
            id: gerarPostId(),
            texto,
            imagem,
            link,
            liked: false,
            saved: false,
            likesCount: 0,
            viewsCount: 0,
            createdAt: new Date().toISOString()
        };
    }

    function processarTexto(texto) {
        const palavras = texto.split(/\s+/);
        let link = "";
        let textoFinal = texto;

        for (let palavra of palavras) {
            if (/\w{2,}\.\w{2,}/.test(palavra)) {
                link = palavra;
                textoFinal = texto.replace(link, "").trim();
                break;
            }
        }

        return { textoFinal, link };
    }

    btnPublish.addEventListener("click", () => {
        const textoOriginal = textarea.value.trim();
        if (!textoOriginal) return alert("Escreva algo antes de publicar!");

        const { textoFinal, link } = processarTexto(textoOriginal);
        const imagem = ""; // placeholder para imagem

        const novoPost = criarPostObj(textoFinal, imagem, link);

        postsSalvos.push(novoPost);
        salvarPosts();

        textarea.value = "";

        console.log("Post criado e salvo:", novoPost);

        // Volta para a página anterior
        history.back();
    });
});
