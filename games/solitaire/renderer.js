export function render(state, actions) {
  renderStock(state, actions);
  renderWaste(state, actions);
  renderTableau(state, actions);

  // reset invalid flag AFTER render
  state._invalid = false;

  // clear animation markers
  state.tableau.forEach(col =>
    col.forEach(c => delete c._moving)
  );

  state.waste.forEach(c => delete c._moving);
}

function renderStock(state, actions) {
  const stock = document.getElementById("stock");
  stock.innerHTML = "";

  const back = document.createElement("div");
  back.className = "card back";

  back.onclick = () => actions.draw();

  stock.appendChild(back);
}

function renderWaste(state, actions) {
  const waste = document.getElementById("waste");
  waste.innerHTML = "";

  const card = state.waste[state.waste.length - 1];
  if (!card) return;

  const el = document.createElement("div");
  el.className = "card";
  el.textContent = card.value + card.suit;

  el.onclick = () => actions.selectWaste();

  waste.appendChild(el);
}

function renderTableau(state, actions) {
  const cols = document.querySelectorAll(".column");

  cols.forEach((col, colIndex) => {
    col.innerHTML = "";

    state.tableau[colIndex].forEach((card, cardIndex) => {
      const el = document.createElement("div");
      el.className = "card";

      if (!card.faceUp) {
        el.classList.add("back");
      } else {
        el.textContent = card.value + card.suit;
      }

      if (state.selected &&
          state.selected.type === "tableau" &&
          state.selected.colIndex === colIndex &&
          state.selected.cardIndex === cardIndex) {
        el.classList.add("selected");
      }

      if (card._moving) {
        el.classList.add("moving");
      }

      el.onclick = (e) => {
        e.stopPropagation();
        if (!card.faceUp) return;
        actions.selectTableau(colIndex, cardIndex);
      };

      col.appendChild(el);
    });

    col.onclick = () => {
      if (!state.selected) return;
      actions.move(colIndex);
    };

    if (state._invalid) {
      col.classList.add("invalid-flash");
      setTimeout(() => col.classList.remove("invalid-flash"), 200);
    }
  });
}
