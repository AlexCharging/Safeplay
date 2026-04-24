export function render(state, actions) {
  renderStock(state, actions);
  renderWaste(state, actions);
  renderTableau(state, actions);
  renderUI(state, actions);

  state._invalid = false;
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

/* ---------------- UI CONTROLS ---------------- */

function renderUI(state, actions) {
  let ui = document.getElementById("ui");
  if (!ui) {
    ui = document.createElement("div");
    ui.id = "ui";
    document.body.appendChild(ui);
  }

  ui.innerHTML = `
    <button id="undo">Undo</button>
    <button id="hint">Hint</button>
  `;

  document.getElementById("undo").onclick = actions.undo;
  document.getElementById("hint").onclick = actions.hint;

  if (state.won) {
    const win = document.createElement("div");
    win.id = "win";
    win.innerHTML = "🎉 You Win! 🎉";
    document.body.appendChild(win);
  }
}
