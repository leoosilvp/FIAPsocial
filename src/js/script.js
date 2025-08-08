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

