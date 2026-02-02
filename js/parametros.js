document.querySelectorAll(".info-icon").forEach(icon => {
  let timer;
  let tooltip;

  icon.addEventListener("mouseenter", () => {
    timer = setTimeout(() => {
      tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerText = icon.dataset.info || "aca va la info";
      document.body.appendChild(tooltip);

      const rect = icon.getBoundingClientRect();
      tooltip.style.top = rect.bottom + 6 + "px";
      tooltip.style.left = rect.left - 20 + "px";
    }, 500);
  });

  icon.addEventListener("mouseleave", () => {
    clearTimeout(timer);
    if (tooltip) tooltip.remove();
  });
});
