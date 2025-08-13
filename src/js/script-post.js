document.addEventListener("DOMContentLoaded", () => {
  const visiblePosts = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const post = entry.target;
      const postId = post.dataset.postId;
      if (!postId) return;

      if (entry.isIntersecting) {
        if (!visiblePosts.has(postId)) {
          const timeout = setTimeout(() => {
            const viewsIcon = post.querySelector(".views-icon");
            const viewsKey = `${postId}-views`;
            let views = parseInt(localStorage.getItem(viewsKey)) || 0;
            views++;
            viewsIcon.textContent = ` ${views}`;
            localStorage.setItem(viewsKey, views);
            visiblePosts.delete(postId);
          }, 2000);
          visiblePosts.set(postId, timeout);
        }
      } else {
        if (visiblePosts.has(postId)) {
          clearTimeout(visiblePosts.get(postId));
          visiblePosts.delete(postId);
        }
      }
    });
  }, { threshold: 0.6 });

  // Menu-post
  let menuAberto = null;

  // Abrir/fechar menu
  document.querySelectorAll("#btn-config-post").forEach(botao => {
    botao.addEventListener("click", (e) => {
      e.stopPropagation();

      const post = botao.closest("article.post");
      if (!post) return;

      const menu = post.querySelector(".menu-post");
      if (!menu) return;

      // Fecha outro menu aberto
      if (menuAberto && menuAberto !== menu) {
        menuAberto.classList.remove("ativo");
      }

      menu.classList.toggle("ativo");
      menuAberto = menu.classList.contains("ativo") ? menu : null;
    });
  });

  // Clique fora fecha qualquer menu aberto
  document.addEventListener("click", (e) => {
    if (menuAberto && !menuAberto.contains(e.target) && !e.target.matches("#btn-config-post")) {
      menuAberto.classList.remove("ativo");
      menuAberto = null;
    }
  });

  // ---------- DELETAR POST ----------
  document.querySelectorAll(".menu-post .delete-post").forEach(botao => {
    botao.addEventListener("click", (e) => {
      e.stopPropagation();
      const post = botao.closest("article.post");
      if (!post) return;

      const postId = post.dataset.postId;

      // Remove do feed principal
      const feedPost = document.querySelector(`#feed article.post[data-post-id="${postId}"]`);
      if (feedPost) feedPost.remove();

      // Remove da seção curtidos
      const likedPosts = document.querySelectorAll(`#feed-liked-posts article.post[data-post-id="${postId}"]`);
      likedPosts.forEach(p => p.remove());
      atualizarEstadoNoPostLiked(); // atualiza mensagem "sem posts"

      // Remove da seção salvos
      const savedPosts = document.querySelectorAll(`#feed-saved-posts article.post[data-post-id="${postId}"]`);
      savedPosts.forEach(p => p.remove());
      atualizarEstadoNoPostSalvo(); // atualiza mensagem "sem posts"

      menuAberto = null;
    });
  });

  // ---------- FUNÇÕES DE ATUALIZAÇÃO DE SEÇÃO ----------
  function atualizarEstadoNoPostLiked() {
    const likedSection = document.getElementById("feed-liked-posts");
    const noPostMessage = document.querySelector(".no-post-liked");
    const temPosts = likedSection.querySelectorAll("article.post").length > 0;
    noPostMessage.style.display = temPosts ? "none" : "block";
  }

  function atualizarEstadoNoPostSalvo() {
    const savedSection = document.getElementById("feed-saved-posts");
    const noPostMessage = document.querySelector(".no-post-saved");
    const temPosts = savedSection.querySelectorAll("article.post").length > 0;
    noPostMessage.style.display = temPosts ? "none" : "block";
  }


  // Inicializa eventos do post
  function inicializarPost(post) {
    const postId = post.dataset.postId;
    if (!postId) return;

    const likeBtn = post.querySelector(".btn-like");
    const likeIcon = post.querySelector(".like-icon");
    const saveBtn = post.querySelector(".btn-save-post");

    const likeKey = `${postId}-likes`;
    const likedKey = `${postId}-liked`;
    const savedKey = `${postId}-saved`;

    let likeCount = parseInt(localStorage.getItem(likeKey)) || 0;
    let liked = localStorage.getItem(likedKey) === "true";
    let saved = localStorage.getItem(savedKey) === "true";

    likeIcon.textContent = ` ${likeCount}`;
    if (liked) likeBtn.classList.add("active");
    if (saved) saveBtn.classList.add("active");

    likeBtn.addEventListener("click", () => {
      liked = !liked;
      likeCount += liked ? 1 : -1;
      localStorage.setItem(likeKey, likeCount);
      localStorage.setItem(likedKey, liked);
      atualizarTodosOsPosts(postId, "like", liked, likeCount);
    });

    saveBtn.addEventListener("click", () => {
      saved = !saved;
      localStorage.setItem(savedKey, saved);
      atualizarTodosOsPosts(postId, "save", saved);
    });

    const viewsIcon = post.querySelector(".views-icon");
    const viewsKey = `${postId}-views`;
    viewsIcon.textContent = ` ${parseInt(localStorage.getItem(viewsKey)) || 0}`;
    observer.observe(post);
  }

  // Atualiza todos os posts iguais no DOM
  function atualizarTodosOsPosts(postId, tipo, estado, count = null) {
    document.querySelectorAll(`[data-post-id="${postId}"]`).forEach(p => {
      if (tipo === "like") {
        const btn = p.querySelector(".btn-like");
        const icon = p.querySelector(".like-icon");
        btn.classList.toggle("active", estado);
        if (count !== null) icon.textContent = ` ${count}`;
      } else if (tipo === "save") {
        const btn = p.querySelector(".btn-save-post");
        btn.classList.toggle("active", estado);
      }
    });

    if (tipo === "like") {
      if (estado) criarCloneCurtido(postId);
      else removerCloneCurtido(postId);
    }
    if (tipo === "save") {
      if (estado) criarCloneSalvo(postId);
      else removerCloneSalvo(postId);
    }
  }

  // ---------- CURTIDOS ----------
  function criarCloneCurtido(postId) {
    const original = document.querySelector(`#feed article.post[data-post-id="${postId}"]`);
    const likedSection = document.getElementById("feed-liked-posts");
    if (!original || likedSection.querySelector(`[data-post-id="${postId}"]`)) return;

    const clone = original.cloneNode(true);
    likedSection.appendChild(clone);
    inicializarPost(clone);
    atualizarEstadoNoPostLiked();
  }

  function removerCloneCurtido(postId) {
    const likedSection = document.getElementById("feed-liked-posts");
    likedSection.querySelectorAll(`[data-post-id="${postId}"]`).forEach(e => e.remove());
    atualizarEstadoNoPostLiked();
  }

  function atualizarEstadoNoPostLiked() {
    const likedSection = document.getElementById("feed-liked-posts");
    const noPostMessage = document.querySelector(".no-post-liked");
    const temPosts = likedSection.querySelectorAll("article.post").length > 0;
    noPostMessage.style.display = temPosts ? "none" : "flex";
  }

  // ---------- SALVOS ----------
  function criarCloneSalvo(postId) {
    const original = document.querySelector(`#feed article.post[data-post-id="${postId}"]`);
    const savedSection = document.getElementById("feed-saved-posts");
    if (!original || savedSection.querySelector(`[data-post-id="${postId}"]`)) return;

    const clone = original.cloneNode(true);
    savedSection.appendChild(clone);
    inicializarPost(clone);
    atualizarEstadoNoPostSalvo();
  }

  function removerCloneSalvo(postId) {
    const savedSection = document.getElementById("feed-saved-posts");
    savedSection.querySelectorAll(`[data-post-id="${postId}"]`).forEach(e => e.remove());
    atualizarEstadoNoPostSalvo();
  }

  function atualizarEstadoNoPostSalvo() {
    const savedSection = document.getElementById("feed-saved-posts");
    const noPostMessage = document.querySelector(".no-post-saved");
    const temPosts = savedSection.querySelectorAll("article.post").length > 0;
    noPostMessage.style.display = temPosts ? "none" : "flex";
  }

  // ---------- INICIALIZAÇÃO ----------
  document.querySelectorAll("#feed article.post").forEach(post => {
    inicializarPost(post);
    if (localStorage.getItem(`${post.dataset.postId}-liked`) === "true") criarCloneCurtido(post.dataset.postId);
    if (localStorage.getItem(`${post.dataset.postId}-saved`) === "true") criarCloneSalvo(post.dataset.postId);
  });

  atualizarEstadoNoPostLiked();
  atualizarEstadoNoPostSalvo();

  // ---------- BOTÕES DE TROCA DE SEÇÃO ----------
  const buttonMap = {
    'btn-section-feed': 'feed',
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
    });
  });
});
