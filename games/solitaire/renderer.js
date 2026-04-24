// renderer.js — builds the DOM from state

import { enableDrag } from "./drag.js";

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

  if(!state.stock.length){
    el.classList.add("stock-empty");
    el.title = "Click to recycle waste";
  }

  el.onclick = () => actions.draw();
  stock.appendChild(el);
}

/* ─── WASTE ─────────────────────────────────────────────── */

function renderWaste(state, actions){
  const waste = document.getElementById("waste");
  if(!waste) return;
  waste.innerHTML = "";

  if(!state.waste.length) return;

  // In draw-3 mode show up to 3 fanned cards; only top is interactive
  const showCount = state.drawMode === 3 ? Math.min(3, state.waste.length) : 1;
  const startIndex = state.waste.length - showCount;

  for(let i = 0; i < showCount; i++){
    const card = state.waste[startIndex + i];
    const isTop = (i === showCount - 1);

    const el = document.createElement("div");
    el.className = "card";
    el.style.position = "absolute";
    el.style.left = `${i * 18}px`;
    el.style.zIndex = i;

    const hintSrc = isTop && isHintSource(state, "waste");
    const selected = isTop && state.selected?.type === "waste";
    if(selected) el.classList.add("selected");
    if(hintSrc)  el.classList.add("hint-source");

    el.innerHTML = `<span class="card-value ${card.color}">${card.value}${card.suit}</span>`;

    if(isTop){
      el.onclick = () => actions.selectWaste();
      el.ondblclick = () => {
        actions.selectWaste();
        actions.autoFoundation();
      };
      enableDrag(el, { onDragStart:() => actions.selectWaste() });
    }

    waste.appendChild(el);
  }

  // widen waste zone for draw-3 fan
  waste.style.width = showCount > 1 ? `${80 + (showCount-1)*18}px` : "80px";
}

/* ─── FOUNDATIONS ────────────────────────────────────────── */

function renderFoundations(state, actions){
  const foundations = document.querySelectorAll(".foundation");

  foundations.forEach((f, index) => {
    f.innerHTML = "";

    const hintTgt = isHintTarget(state, "foundation", index);
    f.classList.toggle("hint-target", hintTgt);

    f.addEventListener("dragover",  e => e.preventDefault());
    f.addEventListener("drop", e => {
      e.preventDefault();
      if(state.selected) actions.moveFoundation(index);
    });
    f.onclick = () => { if(state.selected) actions.moveFoundation(index); };

    const pile = state.foundations[index];
    const top  = pile[pile.length - 1];

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
  const cols = document.querySelectorAll(".column");

  cols.forEach((colEl, colIndex) => {
    colEl.innerHTML = "";

    const hintTgt = isHintTarget(state, "tableau", colIndex);
    colEl.classList.toggle("hint-target", hintTgt);

    // drop zone for the column background
    colEl.addEventListener("dragover", e => e.preventDefault());
    colEl.addEventListener("drop", e => {
      e.preventDefault();
      if(state.selected) actions.moveColumn(colIndex);
    });

    // clicking EMPTY column area moves selected card there
    colEl.onclick = () => {
      if(state.selected) actions.moveColumn(colIndex);
    };

    state.tableau[colIndex].forEach((card, cardIndex) => {
      const el = document.createElement("div");
      el.className = "card";
      el.style.top    = `${cardIndex * 28}px`;
      el.style.zIndex = cardIndex;
      el.style.position = "absolute";

      const isSelected = state.selected?.type === "tableau" &&
                         state.selected.col === colIndex &&
                         state.selected.index === cardIndex;

      const isHintSrc = isHintSource(state, "tableau", colIndex, cardIndex);

      if(isSelected)  el.classList.add("selected");
      if(isHintSrc)   el.classList.add("hint-source");

      if(!card.faceUp){
        el.classList.add("back");
      } else {
        el.innerHTML = `<span class="card-value ${card.color}">${card.value}${card.suit}</span>`;
      }

      el.onclick = e => {
        e.stopPropagation();
        if(!card.faceUp) return;

        // KEY FIX: if something is already selected, clicking THIS card
        // should try to move the selection HERE (to this column), not re-select
        if(state.selected){
          actions.moveColumn(colIndex);
        } else {
          actions.selectTableau(colIndex, cardIndex);
        }
      };

      el.ondblclick = e => {
        e.stopPropagation();
        if(!card.faceUp) return;
        actions.selectTableau(colIndex, cardIndex);
        actions.autoFoundation();
      };

      if(card.faceUp){
        enableDrag(el, {
          onDragStart:() => actions.selectTableau(colIndex, cardIndex)
        });
      }

      colEl.appendChild(el);
    });
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

  // win banner
  const existing = document.getElementById("win");
  if(state.won && !existing){
    const win = document.createElement("div");
    win.id = "win";
    win.innerHTML = `🎉 You Win! &nbsp; Final Score: ${state.score}`;
    document.getElementById("game").appendChild(win);
  }
}
