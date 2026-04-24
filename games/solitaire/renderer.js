export function render(state, actions) {
  renderStock(state, actions);
  renderWaste(state, actions);
  renderTableau(state, actions);
  renderUI(state, actions);
}

/* ---------------- STOCK ---------------- */

function renderStock(state, actions) {
  const stock = document.getElementById("stock");
  stock.innerHTML = "";

  const back = document.createElement("div");
  back.className = "card back";
  back.textContent = "Deck";

  back.onclick = () => actions.draw();

  stock.appendChild(back);
}

/* ---------------- WASTE ---------------- */

function renderWaste(state, actions) {
  const waste = document.getElementById("waste");
  if (!waste) return;

  waste.innerHTML = "";

  const card = state.waste[state.waste.length - 1];
  if (!card) return;

  const el = document.createElement("div");
  el.className = "card";
  el.textContent = card.value + card.suit;

  el.onclick = () => actions.selectWaste();

  waste.appendChild(el);
}

/* ---------------- TABLEAU ---------------- */

function renderTableau(state, actions) {
  const cols = document.querySelectorAll(".column");

  cols.forEach((col, colIndex) => {
    col.innerHTML = "";

    state.tableau[colIndex].forEach((card, cardIndex) => {
      const el = document.createElement("div");
      el.className = "card";

      if (!card.faceUp) {
        el.classList.add("back");
        el.textContent = "";
      } else {
        el.textContent = card.value + card.suit;
      }

      if (
        state.selected &&
        state.selected.type === "tableau" &&
        state.selected.col === colIndex &&
        state.selected.index === cardIndex
      ) {
        el.classList.add("selected");
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
      actions.moveColumn(colIndex);
    };

    if (state._invalid) {
      col.classList.add("invalid-flash");
      setTimeout(() => col.classList.remove("invalid-flash"), 200);
    }
  });
}

/* ---------------- UI (WIN + CONTROLS) ---------------- */

function renderUI(state, actions) {
  let ui = document.getElementById("ui");

  if (!ui) {
    ui = document.createElement("div");
    ui.id = "ui";
    document.body.appendChild(ui);
  }

  ui.innerHTML = `
    <button id="undoBtn">Undo</button>
    <button id="hintBtn">Hint</button>
  `;

  document.getElementById("undoBtn").onclick = actions.undo;
  document.getElementById("hintBtn").onclick = actions.hint;

  renderWin(state);
}

/* ---------------- WIN SCREEN ---------------- */

function renderWin(state) {
  if (!state.won) return;

  let win = document.getElementById("win");

  if (!win) {
    win = document.createElement("div");
    win.id = "win";
    document.body.appendChild(win);
  }

  win.innerHTML = `
    <div class="win-box">
      🎉 You Win! 🎉
    </div>
  `;
}
}
