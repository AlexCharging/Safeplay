export function render(state, actions) {
  renderStock(state, actions);
  renderWaste(state, actions);
  renderTableau(state, actions);
  renderFoundations(state, actions);
  renderUI(state, actions);
}

/* ---------------- STOCK ---------------- */

function renderStock(state, actions) {
  const stock = document.getElementById("stock");
  if (!stock) return;

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

  el.innerHTML = `
    <span class="card-value ${card.color}">
      ${card.value}${card.suit}
    </span>
  `;

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
      } else {
        el.innerHTML = `
          <span class="card-value ${card.color}">
            ${card.value}${card.suit}
          </span>
        `;
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
  });
}

/* ---------------- FOUNDATIONS ---------------- */

function renderFoundations(state, actions) {
  const foundations = document.querySelectorAll(".foundation");

  foundations.forEach((f, index) => {
    f.innerHTML = "";

    const pile = state.foundations[index];
    const top = pile[pile.length - 1];

    if (top) {
      const el = document.createElement("div");
      el.className = "card";

      el.innerHTML = `
        <span class="card-value ${top.color}">
          ${top.value}${top.suit}
        </span>
      `;

      f.appendChild(el);
    }

    f.onclick = () => {
      if (!state.selected) return;
      actions.moveFoundation(index);
    };
  });
}

/* ---------------- UI ---------------- */

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

  const undoBtn = document.getElementById("undoBtn");
  const hintBtn = document.getElementById("hintBtn");

  if (undoBtn) undoBtn.onclick = actions.undo;
  if (hintBtn) hintBtn.onclick = actions.hint;

  if (state.won) {
    let win = document.getElementById("win");

    if (!win) {
      win = document.createElement("div");
      win.id = "win";
      document.body.appendChild(win);
    }

    win.innerHTML = "🎉 You Win! 🎉";
  }
}
