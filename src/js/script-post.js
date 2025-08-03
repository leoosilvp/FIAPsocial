document.addEventListener("DOMContentLoaded", () => {
  const posts = document.querySelectorAll("article.post");
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
  }, {
    threshold: 0.6
  });

  posts.forEach(post => {
    const postId = post.dataset.postId;
    if (!postId) return;

    // like
    const likeBtn = post.querySelector(".btn-like");
    const likeIcon = post.querySelector(".like-icon");

    const likeKey = `${postId}-likes`;
    const likedKey = `${postId}-liked`;

    let likeCount = parseInt(localStorage.getItem(likeKey)) || 0;
    let liked = localStorage.getItem(likedKey) === "true";

    likeIcon.textContent = ` ${likeCount}`;
    if (liked) likeBtn.classList.add("active");

    likeBtn.addEventListener("click", () => {
      liked = !liked;
      likeCount += liked ? 1 : -1;
      likeIcon.textContent = ` ${likeCount}`;
      likeBtn.classList.toggle("active", liked);
      localStorage.setItem(likeKey, likeCount);
      localStorage.setItem(likedKey, liked);
    });

    // views
    const viewsIcon = post.querySelector(".views-icon");
    const viewsKey = `${postId}-views`;
    const savedViews = parseInt(localStorage.getItem(viewsKey)) || 0;
    viewsIcon.textContent = ` ${savedViews}`;

    observer.observe(post);
  });


  const buttonMap = {
        'btn-section-feed': 'feed',
        'btn-section-liked-posts': 'feed-liked-posts',
        'btn-section-saved-posts': 'feed-saved-posts'
    };

    const buttons = document.querySelectorAll('#change-feed .btn-change-feed');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Oculta todas as seções
            Object.values(buttonMap).forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) section.style.display = 'none';
            });

            // Exibe a seção correspondente
            const a = button.querySelector('a');
            const targetId = buttonMap[a.id];
            const sectionToShow = document.getElementById(targetId);
            if (sectionToShow) sectionToShow.style.display = 'flex';
        });
    });
});
