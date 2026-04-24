function render() {
  renderTableau();
}

function renderTableau() {
  const columns = document.querySelectorAll(".column");

  columns.forEach((col, i) => {
    col.innerHTML = "";

    gameState.tableau[i].forEach(card => {
      const el = document.createElement("div");
      el.className = "card";

      if (!card.faceUp) {
        el.classList.add("back");
        el.textContent = "";
      } else {
        el.textContent = `${card.value}${card.suit}`;
      }

      col.appendChild(el);
    });
  });
}
