// renderer.js — builds the DOM from state
// Uses tap-to-select / tap-to-place on mobile (no native drag API)
// Native drag is kept for desktop as a bonus but is not relied on.

export function render(state, actions){
  renderStock(state, actions);
  renderWaste(state, actions);
  renderFoundations(state, actions);
  renderTableau(state, actions);
  renderUI(state, actions);
}

/* ─── helpers ─────────────────────────────────────────── */

function isHintSource(state, type, col, index){
  if(!state.hint) return false;
  const s = state.hint.source;
  if(type === "waste") return s.type === "waste";
  return s.type === "tableau" && s.col === col && s.index === index;
}

function isHintTarget(state, type, index){
  if(!state.hint) return false;
  return state.hint.target === type && state.hint.targetIndex === index;
}

/* ─── STOCK ─────────────────────────────────────────────── */

function renderStock(state, actions){
  const stock = document.getElementById("stock");
  if(!stock) return;
  stock.innerHTML = "";

  const el = document.createElement("div");
  el.className = "card back";
  if(!state.stock.length) el.classList.add("stock-empty");

  el.onclick = () => actions.draw();
  stock.appendChild(el);
}

/* ─── WASTE ─────────────────────────────────────────────── */

function renderWaste(state, actions){
  const waste = document.getElementById("waste");
  if(!waste) return;
  waste.innerHTML = "";
  waste.style.width = "";   // reset any previous inline width

  if(!state.waste.length) return;

  const showCount  = state.drawMode === 3 ? Math.min(3, state.waste.length) : 1;
  const startIndex = state.waste.length - showCount;

  // In draw-3 we fan cards to the right; widen the waste slot accordingly
  if(showCount > 1){
    const cardW   = getCardWidth();
    const fanStep = Math.round(cardW * 0.38);
    waste.style.width = `${cardW + (showCount - 1) * fanStep}px`;
  }

  for(let i = 0; i < showCount; i++){
    const card  = state.waste[startIndex + i];
    const isTop = (i === showCount - 1);

    const el = document.createElement("div");
    el.className = "card";

    if(showCount > 1){
      const cardW   = getCardWidth();
      const fanStep = Math.round(cardW * 0.38);
      el.style.position = "absolute";
      el.style.left = `${i * fanStep}px`;
      el.style.zIndex = i;
    }

    if(isTop && state.selected?.type === "waste") el.classList.add("selected");
    if(isTop && isHintSource(state, "waste"))      el.classList.add("hint-source");

    el.innerHTML = `<span class="card-value ${card.color}">${card.value}${card.suit}</span>`;

    if(isTop){
      el.onclick = () => actions.selectWaste();
      el.ondblclick = () => { actions.selectWaste(); actions.autoFoundation(); };
    }

    waste.appendChild(el);
  }
}

/* ─── FOUNDATIONS ────────────────────────────────────────── */

function renderFoundations(state, actions){
  document.querySelectorAll(".foundation").forEach((f, index) => {
    f.innerHTML = "";
    f.classList.toggle("hint-target", isHintTarget(state, "foundation", index));
    f.onclick = () => { if(state.selected) actions.moveFoundation(index); };

    const top = state.foundations[index].slice(-1)[0];
    if(top){
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `<span class="card-value ${top.color}">${top.value}${top.suit}</span>`;
      f.appendChild(el);
    }
  });
}

/* ─── TABLEAU ────────────────────────────────────────────── */

function renderTableau(state, actions){
  document.querySelectorAll(".column").forEach((colEl, colIndex) => {
    colEl.innerHTML = "";
    colEl.classList.toggle("hint-target", isHintTarget(state, "tableau", colIndex));

    // tapping the empty column background places the selected card
    colEl.onclick = () => { if(state.selected) actions.moveColumn(colIndex); };

    const cardW   = getCardWidth();
    const fanStep = Math.round(cardW * 0.38);  // matches CSS --fan-step

    state.tableau[colIndex].forEach((card, cardIndex) => {
      const el = document.createElement("div");
      el.className = "card";
      el.style.position = "absolute";
      el.style.top      = `${cardIndex * fanStep}px`;
      el.style.zIndex   = cardIndex;

      const isSelected = state.selected?.type === "tableau" &&
                         state.selected.col   === colIndex  &&
                         state.selected.index === cardIndex;
      const isHintSrc  = isHintSource(state, "tableau", colIndex, cardIndex);

      if(isSelected) el.classList.add("selected");
      if(isHintSrc)  el.classList.add("hint-source");

      if(!card.faceUp){
        el.classList.add("back");
      } else {
        el.innerHTML = `<span class="card-value ${card.color}">${card.value}${card.suit}</span>`;
      }

      el.onclick = e => {
        e.stopPropagation();
        if(!card.faceUp) return;
        if(state.selected) actions.moveColumn(colIndex);
        else               actions.selectTableau(colIndex, cardIndex);
      };

      el.ondblclick = e => {
        e.stopPropagation();
        if(!card.faceUp) return;
        actions.selectTableau(colIndex, cardIndex);
        actions.autoFoundation();
      };

      colEl.appendChild(el);
    });

    // update column min-height so the container grows with the stack
    const count    = state.tableau[colIndex].length;
    const cardH    = Math.round(getCardWidth() * 1.4);
    colEl.style.minHeight = count > 0
      ? `${(count - 1) * fanStep + cardH}px`
      : `${cardH}px`;
  });
}

/* ─── UI BAR ─────────────────────────────────────────────── */

function renderUI(state, actions){
  let ui = document.getElementById("ui");
  if(!ui){
    ui = document.createElement("div");
    ui.id = "ui";
    document.getElementById("game").appendChild(ui);
  }

  const drawLabel = state.drawMode === 3 ? "Draw 1" : "Draw 3";

  ui.innerHTML = `
    <div class="score-box">Score: <strong>${state.score}</strong></div>
    <div class="ui-buttons">
      <button id="undoBtn">↩ Undo</button>
      <button id="hintBtn">💡 Hint</button>
      <button id="drawBtn">${drawLabel}</button>
      <button id="newBtn">New Game</button>
    </div>
  `;

  document.getElementById("undoBtn").onclick = actions.undo;
  document.getElementById("hintBtn").onclick = actions.hint;
  document.getElementById("newBtn").onclick   = () => actions.newGame();
  document.getElementById("drawBtn").onclick  = () => {
    actions.setDrawMode(state.drawMode === 1 ? 3 : 1);
  };

  if(state.won && !document.getElementById("win")){
    const win = document.createElement("div");
    win.id = "win";
    win.innerHTML = `🎉 You Win! &nbsp; Final Score: ${state.score}`;
    document.getElementById("game").appendChild(win);
  }
}

/* ─── UTILITY ────────────────────────────────────────────── */

// Read the computed --card-w value from CSS so JS stays in sync
function getCardWidth(){
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--card-w").trim();
  // raw is a calc() expression — measure an actual card element instead
  const card = document.querySelector(".card");
  if(card) return card.offsetWidth;
  // fallback: parse viewport-based calc manually
  return Math.floor((window.innerWidth - 16 - 6 * 5) / 7);
}
