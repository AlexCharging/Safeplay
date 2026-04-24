
function render() {
  renderTableau();
  renderStock();
  renderWaste();
}

// --------------------
// STOCK
// --------------------
function renderStock() {
  const stock = document.getElementById("stock");
  stock.innerHTML = "";

  const back = document.createElement("div");
  back.className = "card back";

  back.onclick = () => {
    drawFromStock();
  };

  stock.appendChild(back);
}

// --------------------
// WASTE
// --------------------
function renderWaste() {
  const waste = document.getElementById("waste");
  waste.innerHTML = "";

  if (!gameState.waste.length) return;

  const card = gameState.waste[gameState.waste.length - 1];

  const el = document.createElement("div");
  el.className = "card";
  el.textContent = `${card.value}${card.suit}`;

  el.onclick = () => {
    selected = {
      from: "waste",
      card: card
    };

    render();
  };

  waste.appendChild(el);
}

// --------------------
// TABLEAU
// --------------------
function renderTableau() {
  const columns = document.querySelectorAll(".column");

  columns.forEach((col, colIndex) => {
    col.innerHTML = "";

    gameState.tableau[colIndex].forEach((card, cardIndex) => {
      const el = document.createElement("div");
      el.className = "card";

      if (!card.faceUp) {
        el.classList.add("back");
        el.textContent = "";
      } else {
        el.textContent = `${card.value}${card.suit}`;
      }

      // highlight selected card
      if (
        selected &&
        selected.from !== "waste" &&
        selected.colIndex === colIndex &&
        selected.cardIndex === cardIndex
      ) {
        el.style.outline = "3px solid #2C5F2E";
      }

      el.onclick = (e) => {
        e.stopPropagation();

        if (!card.faceUp) return;

        selected = {
          from: "tableau",
          colIndex,
          cardIndex,
          card
        };

        render();
      };

      col.appendChild(el);
    });

    // CLICK COLUMN = attempt move
    col.onclick = () => {
      if (!selected) return;

      moveCard(colIndex);
    };
  });
}

