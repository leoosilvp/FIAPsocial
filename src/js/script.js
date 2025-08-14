var btnShowAside = document.getElementById("btn-menu-aside");
var displayAside = document.getElementById("menu-aside")
var closeAside = document.getElementById("content");

btnShowAside.addEventListener('click', () => {
    btnShowAside.style.display = 'none';
    displayAside.style.left = '0vw';
})

closeAside.addEventListener('click', () => {
    btnShowAside.style.display = 'flex';
    displayAside.style.left = '-80vw';
})

// news api
const url = `https://newsapi.org/v2/top-headlines?category=technology&apiKey=e5e8cea8009248c98f3132ba370f9e6f`;

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function truncateText(text, maxChars) {
    if (!text) return "";
    return text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
}

function createPost(article) {
    const date = formatDate(article.publishedAt);
    const title = article.title;
    const subtitle = truncateText(article.description || "", 300);
    const imgSrc = article.urlToImage || "../assets/img/img-post-news/no-img.png";

    return `
    <article class="post-news">
      <section class="img-post-news">
        <img src="${imgSrc}" alt="img-post-news" />
      </section>
      <section class="content-post-news">
        <h1 class="title">${title}</h1>
        <h2 class="subtitle">${subtitle}</h2>
        <p class="date">${date}</p>
      </section>
    </article>
  `;
}

function loadNews() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.articles) {
                console.error("Erro na API:", data);
                return;
            }
            const container = document.getElementById("news-container");
            container.innerHTML = "";

            data.articles.forEach(article => {
                container.innerHTML += createPost(article);
            });
        })
        .catch(error => {
            console.error("Erro ao buscar notícias:", error);
        });
}

document.addEventListener("DOMContentLoaded", loadNews);

document.addEventListener("DOMContentLoaded", () => {
    // Detecta o feed correto: home (#feed-home) ou profile (#feed)
    const feedContainer = document.getElementById("feed-home") || document.getElementById("feed");
    if (!feedContainer) return; // sai se não houver container

    let posts = JSON.parse(localStorage.getItem("postsPerfil")) || [];

    function salvarPosts() {
        localStorage.setItem("postsPerfil", JSON.stringify(posts));
    }

    function tempoRelativo(data) {
        const now = new Date();
        const diff = Math.floor((now - new Date(data)) / 1000);
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
        return `${Math.floor(diff / 2592000)}mo`;
    }

    function renderizarPost(post) {
        const article = document.createElement("article");
        article.classList.add("post");
        article.dataset.postId = post.id;

        const dateText = post.createdAt ? tempoRelativo(post.createdAt) : "Agora";

        article.innerHTML = `
        <div class="user">
            <img src="../assets/img/img-profile/img-user/img-default.avif" alt="img-profile">
            <section class="ctn-info-user">
                <section class="info-user">
                    <h1 id="user_name"><a href="./profile.html">Leonardo Silva</a></h1>
                    <h2 id="id_user"><a href="./profile.html">@leeosilvp</a></h2>
                </section>
                <section class="conf-post">
                    <p id="dateTime">${dateText}</p>
                    <a id="btn-config-post"><i class="fa-solid fa-ellipsis-vertical"></i></a>
                </section>
            </section>
        </div>

        <section class="menu-post">
            <i class="delete-post fa-regular fa-trash-can"> Excluir post</i>
        </section>

        <div class="card-description">
            <h2>${post.link ? `${post.texto}<br><a href="${post.link}">${post.link}</a>` : post.texto}</h2>
        </div>

        ${post.imagem ? `<div class="img-post"><img src="${post.imagem}" alt=""></div>` : ""}

        <section class="ctn-engagement">
            <article class="engagement">
                <div class="comments">
                    <button class="btn-comment"><i class="fa-regular fa-comment comment-icon">0</i></button>
                </div>
                <div class="have-idea">
                    <button class="btn-have-idea"><i class="fa-regular fa-lightbulb idea-icon">0</i></button>
                </div>
                <div class="like">
                    <button class="btn-like ${post.liked ? "active" : ""}"><i class="fa-regular fa-heart like-icon"> ${post.likesCount}</i></button>
                </div>
                <div class="views">
                    <button class="views-counter"><i class="fa-regular fa-chart-bar views-icon"> ${post.viewsCount}</i></button>
                </div>
            </article>
            <article class="more">
                <button class="btn-share"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="btn-save-post ${post.saved ? "active" : ""}"><i class="fa-regular fa-bookmark"></i></button>
                <button class="btn-gift"><i class="fa-solid fa-gift"></i></button>
            </article>
        </section>
        `;

        feedContainer.prepend(article); // adiciona no feed correto
        inicializarPost(article, post);
    }

    function inicializarPost(article, post) {
        const postId = post.id;
        let menuAberto = null;

        // Menu
        const btnConfig = article.querySelector("#btn-config-post");
        const menu = article.querySelector(".menu-post");

        btnConfig?.addEventListener("click", e => {
            e.stopPropagation();
            if (!menu) return;
            if (menuAberto && menuAberto !== menu) menuAberto.classList.remove("ativo");
            menu.classList.toggle("ativo");
            menuAberto = menu.classList.contains("ativo") ? menu : null;
        });

        document.addEventListener("click", e => {
            if (menuAberto && !menuAberto.contains(e.target) && !e.target.matches("#btn-config-post")) {
                menuAberto.classList.remove("ativo");
                menuAberto = null;
            }
        });

        // Delete
        const deleteBtn = article.querySelector(".delete-post");
        deleteBtn?.addEventListener("click", () => {
            posts = posts.filter(p => p.id !== postId);
            salvarPosts();
            removerTodosClones(postId);
        });

        // Like
        const likeBtn = article.querySelector(".btn-like");
        const likeIcon = article.querySelector(".like-icon");
        likeBtn?.addEventListener("click", () => {
            post.liked = !post.liked;
            post.likesCount += post.liked ? 1 : -1;
            likeIcon.textContent = ` ${post.likesCount}`;
            likeBtn.classList.toggle("active", post.liked);
            salvarPosts();
            atualizarClones(post);
        });

        // Save
        const saveBtn = article.querySelector(".btn-save-post");
        saveBtn?.addEventListener("click", () => {
            post.saved = !post.saved;
            saveBtn.classList.toggle("active", post.saved);
            salvarPosts();
            atualizarClones(post);
        });

        // Views
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    post.viewsCount++;
                    article.querySelector(".views-icon").textContent = ` ${post.viewsCount}`;
                    salvarPosts();
                    observer.unobserve(article);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(article);
    }

    function atualizarClones(post) {
        const allPosts = document.querySelectorAll(`[data-post-id="${post.id}"]`);
        allPosts.forEach(p => {
            p.querySelector(".like-icon").textContent = ` ${post.likesCount}`;
            p.querySelector(".btn-like").classList.toggle("active", post.liked);
            p.querySelector(".btn-save-post").classList.toggle("active", post.saved);
        });

        post.liked ? criarCloneCurtido(post) : removerCloneCurtido(post.id);
        post.saved ? criarCloneSalvo(post) : removerCloneSalvo(post.id);
    }

    function criarCloneCurtido(post) {
        const likedSection = document.getElementById("feed-liked-posts");
        if (!likedSection.querySelector(`[data-post-id="${post.id}"]`)) {
            const clone = document.querySelector(`[data-post-id="${post.id}"]`).cloneNode(true);
            likedSection.appendChild(clone);
            inicializarPost(clone, post);
        }
    }

    function removerCloneCurtido(postId) {
        document.querySelectorAll(`#feed-liked-posts [data-post-id="${postId}"]`).forEach(e => e.remove());
    }

    function criarCloneSalvo(post) {
        const savedSection = document.getElementById("feed-saved-posts");
        if (!savedSection.querySelector(`[data-post-id="${post.id}"]`)) {
            const clone = document.querySelector(`[data-post-id="${post.id}"]`).cloneNode(true);
            savedSection.appendChild(clone);
            inicializarPost(clone, post);
        }
    }

    function removerCloneSalvo(postId) {
        document.querySelectorAll(`#feed-saved-posts [data-post-id="${postId}"]`).forEach(e => e.remove());
    }

    function removerTodosClones(postId) {
        document.querySelectorAll(`[data-post-id="${postId}"]`).forEach(e => e.remove());
    }

    // Renderiza todos os posts do localStorage no feed correto
    posts.forEach(p => renderizarPost(p));
});
