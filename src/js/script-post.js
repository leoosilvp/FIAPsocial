document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed") || document.getElementById("feed-home");
  const likedSection = document.getElementById("feed-liked-posts");
  const savedSection = document.getElementById("feed-saved-posts");
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

  function atualizarMensagens() {
    document.querySelector(".no-post-liked").style.display = likedSection.querySelectorAll("article.post").length ? "none" : "flex";
    document.querySelector(".no-post-saved").style.display = savedSection.querySelectorAll("article.post").length ? "none" : "flex";
  }

  // ---------- RENDERIZAÇÃO ----------
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

    feed.prepend(article);
    inicializarPost(article, post);

    if (post.liked) criarCloneCurtido(post);
    if (post.saved) criarCloneSalvo(post);
    atualizarMensagens();
  }

  // ---------- INICIALIZAÇÃO ----------
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
    article.querySelector(".delete-post")?.addEventListener("click", () => {
      posts = posts.filter(p => p.id !== postId);
      salvarPosts();
      removerTodosClones(postId);
      article.remove();
      atualizarMensagens();
    });

    // Like
    const likeBtn = article.querySelector(".btn-like");
    const likeIcon = article.querySelector(".like-icon");
    likeBtn?.addEventListener("click", () => {
      post.liked = !post.liked;
      post.likesCount += post.liked ? 1 : -1;
      sincronizarTodosPosts(post);
      salvarPosts();
    });

    // Save
    const saveBtn = article.querySelector(".btn-save-post");
    saveBtn?.addEventListener("click", () => {
      post.saved = !post.saved;
      sincronizarTodosPosts(post);
      salvarPosts();
    });

    // Views
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          post.viewsCount++;
          sincronizarTodosPosts(post);
          salvarPosts();
          observer.unobserve(article);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(article);
  }

  // ---------- SINCRONIZAÇÃO DE CLONES ----------
  function sincronizarTodosPosts(post) {
    // Atualiza todos os clones no feed, liked e saved
    document.querySelectorAll(`[data-post-id="${post.id}"]`).forEach(p => {
      p.querySelector(".like-icon").textContent = ` ${post.likesCount}`;
      p.querySelector(".btn-like").classList.toggle("active", post.liked);
      p.querySelector(".btn-save-post").classList.toggle("active", post.saved);
      p.querySelector(".views-icon").textContent = ` ${post.viewsCount}`;
    });

    post.liked ? criarCloneCurtido(post) : removerCloneCurtido(post.id);
    post.saved ? criarCloneSalvo(post) : removerCloneSalvo(post.id);
    atualizarMensagens();
  }

  function criarCloneCurtido(post) {
    if (!likedSection.querySelector(`[data-post-id="${post.id}"]`)) {
      const clone = document.querySelector(`[data-post-id="${post.id}"]`).cloneNode(true);
      likedSection.prepend(clone); // Mais recente no topo
      inicializarPost(clone, post);
    }
  }

  function removerCloneCurtido(postId) {
    document.querySelectorAll(`#feed-liked-posts [data-post-id="${postId}"]`).forEach(e => e.remove());
  }

  function criarCloneSalvo(post) {
    if (!savedSection.querySelector(`[data-post-id="${post.id}"]`)) {
      const clone = document.querySelector(`[data-post-id="${post.id}"]`).cloneNode(true);
      savedSection.prepend(clone); // Mais recente no topo
      inicializarPost(clone, post);
    }
  }

  function removerCloneSalvo(postId) {
    document.querySelectorAll(`#feed-saved-posts [data-post-id="${postId}"]`).forEach(e => e.remove());
  }

  function removerTodosClones(postId) {
    document.querySelectorAll(`[data-post-id="${postId}"]`).forEach(e => e.remove());
  }

  // ---------- RENDERIZAÇÃO INICIAL ----------
  posts.forEach(renderizarPost);

  // ---------- TROCA DE SEÇÃO ----------
  const buttonMap = {
    'btn-section-feed': feed.id,
    'btn-section-liked-posts': 'feed-liked-posts',
    'btn-section-saved-posts': 'feed-saved-posts'
  };

  document.querySelectorAll('#change-feed .btn-change-feed').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#change-feed .btn-change-feed').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      Object.values(buttonMap).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
      });
      const a = button.querySelector('a');
      const targetId = buttonMap[a.id];
      const sectionToShow = document.getElementById(targetId);
      if (sectionToShow) sectionToShow.style.display = 'flex';
      atualizarMensagens();
    });
  });
});
