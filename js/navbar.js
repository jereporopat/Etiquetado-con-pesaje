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

function toggleConfigMenu() {
    const menu = document.getElementById("configMenu");
    menu.classList.toggle("active");
}
document.addEventListener("click", function(e) {
    const menu = document.getElementById("configMenu");
    const btn = document.querySelector(".config-btn");

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove("active");
    }
});