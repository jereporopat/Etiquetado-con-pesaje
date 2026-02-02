document.addEventListener("DOMContentLoaded", () => {
  fetch("../html/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);
    });
});

function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
  document.body.classList.toggle("menu-open");
}
