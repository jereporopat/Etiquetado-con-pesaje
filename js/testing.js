  document.querySelectorAll(".input-card").forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("active");
    });
  });