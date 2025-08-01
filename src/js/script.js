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