function render() {
  renderTableau();
}

function renderTableau() {
  const columns = document.querySelectorAll(".column");

  columns.forEach((col, colIndex) => {
    col.innerHTML = "";

    gameState.tableau[colIndex].forEach((card, cardIndex) => {
      const el = document.createElement("div");
      el.className = "card";

      if (!card.faceUp) {
        el.classList.add("back");
      } else {
        el.textContent = `${card.value}${card.suit}`;
      }

      // highlight selected card
      if (selected &&
          selected.colIndex === colIndex &&
          selected.cardIndex === cardIndex) {
        el.style.outline = "3px solid #2C5F2E";
      }

      el.addEventListener("click", () => {
        selectCard(colIndex, cardIndex);
      });

      col.appendChild(el);
    });

    // allow clicking column to move card
    col.onclick = () => {
      moveCard(colIndex);
    };
  });
}
