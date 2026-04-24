function render() {
  renderTableau();
  renderStock();
  renderWaste();
}

function renderStock() {
  const stock = document.getElementById("stock");
  stock.innerHTML = "";

  const back = document.createElement("div");
  back.className = "card back";
  back.textContent = "";

  back.onclick = () => {
    drawFromStock();
  };

  stock.appendChild(back);
}

function renderWaste() {
  const waste = document.getElementById("waste");
  waste.innerHTML = "";

  if (!gameState.waste.length) return;

  const card = gameState.waste[gameState.waste.length - 1];

  const el = document.createElement("div");
  el.className = "card";
  el.textContent = `${card.value}${card.suit}`;

  // allow moving from waste
  el.onclick = () => {
    selected = { from: "waste" };
    render();
  };

  waste.appendChild(el);
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
  if (!selected) return;
  moveCard(colIndex);
    };
  });
}
