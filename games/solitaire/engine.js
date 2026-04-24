// engine.js — game rules, moves, undo, hints, scoring

const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function getValueIndex(v){ return VALUES.indexOf(v); }

/* ─── RULES ─────────────────────────────────────────────── */

function canPlaceTableau(card, target){
  if(!target) return card.value === "K";
  if(card.color === target.color) return false;
  return getValueIndex(card.value) === getValueIndex(target.value) - 1;
}

function canPlaceFoundation(card, foundation){
  if(!foundation.length) return card.value === "A";
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit &&
    getValueIndex(card.value) === getValueIndex(top.value) + 1;
}

/* ─── SNAPSHOT (for undo) ───────────────────────────────── */

function snapshot(state){
  return JSON.parse(JSON.stringify({
    tableau:     state.tableau,
    stock:       state.stock,
    waste:       state.waste,
    foundations: state.foundations,
    score:       state.score,
    selected:    null,
    won:         state.won
  }));
}

function pushHistory(state){
  state.history.push(snapshot(state));
  // keep last 50 moves to avoid memory bloat
  if(state.history.length > 50) state.history.shift();
}

/* ─── UNDO ───────────────────────────────────────────────── */

export function undo(state){
  if(!state.history.length) return false;
  const prev = state.history.pop();
  Object.assign(state, prev);
  state.history = state.history; // keep existing ref
  state.selected = null;
  // Vegas scoring: undo costs 2 points
  state.score = Math.max(0, state.score - 2);
  return true;
}

/* ─── SELECTION ─────────────────────────────────────────── */

export function selectTableau(state, col, index){
  const card = state.tableau[col][index];
  if(!card || !card.faceUp) return;

  // clicking the already-selected card deselects
  if(state.selected?.type === "tableau" &&
     state.selected.col === col &&
     state.selected.index === index){
    state.selected = null;
    return;
  }

  // if something is already selected, try to move it here
  if(state.selected){
    const ok = moveToColumn(state, col);
    if(ok) return;
  }

  state.selected = { type:"tableau", col, index };
}

export function selectWaste(state){
  if(!state.waste.length) return;
  if(state.selected?.type === "waste"){
    state.selected = null;
    return;
  }
  if(state.selected){
    // waste was selected somewhere else — ignore and reselect waste
  }
  state.selected = { type:"waste" };
}

/* ─── STOCK ─────────────────────────────────────────────── */

export function drawFromStock(state){
  pushHistory(state);

  // recycle
  if(!state.stock.length){
    if(!state.waste.length) return;
    state.stock = [...state.waste].reverse().map(c => ({...c, faceUp:false}));
    state.waste = [];
    state.selected = null;
    // Vegas scoring: recycling costs 100 points
    state.score = Math.max(0, state.score - 100);
    return;
  }

  // draw-1 or draw-3
  const drawCount = state.drawMode === 3 ? 3 : 1;
  for(let i = 0; i < drawCount && state.stock.length; i++){
    const card = state.stock.pop();
    card.faceUp = true;
    state.waste.push(card);
  }
  state.selected = null;
}

/* ─── MOVE TO COLUMN ────────────────────────────────────── */

export function moveToColumn(state, toCol){
  if(!state.selected) return false;

  const targetCol = state.tableau[toCol];
  const targetTop = targetCol[targetCol.length - 1] || null;

  if(state.selected.type === "tableau"){
    if(state.selected.col === toCol){ state.selected = null; return false; }

    const sourceCol = state.tableau[state.selected.col];
    const moving    = sourceCol.slice(state.selected.index);
    const card      = moving[0];

    if(!canPlaceTableau(card, targetTop)){ return false; }

    pushHistory(state);
    sourceCol.splice(state.selected.index);
    if(sourceCol.length) sourceCol[sourceCol.length-1].faceUp = true;
    targetCol.push(...moving);

    // Vegas: +5 for tableau→tableau only if flipping a card
    if(sourceCol.length && !sourceCol[sourceCol.length-1].faceUp) state.score += 5;
  }

  else if(state.selected.type === "waste"){
    const card = state.waste[state.waste.length - 1];
    if(!canPlaceTableau(card, targetTop)){ return false; }

    pushHistory(state);
    state.waste.pop();
    targetCol.push(card);
    state.score += 5; // Vegas: waste→tableau = +5
  }

  state.selected = null;
  checkWin(state);
  return true;
}

/* ─── MOVE TO FOUNDATION ────────────────────────────────── */

export function moveToFoundation(state, index){
  if(!state.selected) return false;

  const foundation = state.foundations[index];
  let card;

  if(state.selected.type === "waste"){
    card = state.waste[state.waste.length - 1];
    if(!canPlaceFoundation(card, foundation)) return false;

    pushHistory(state);
    state.waste.pop();
    state.score += 10; // Vegas: waste→foundation = +10
  }

  else if(state.selected.type === "tableau"){
    const col = state.tableau[state.selected.col];
    // can only send the TOP card of a stack to foundation
    if(state.selected.index !== col.length - 1) return false;

    card = col[state.selected.index];
    if(!canPlaceFoundation(card, foundation)) return false;

    pushHistory(state);
    col.splice(state.selected.index);
    if(col.length) col[col.length-1].faceUp = true;
    state.score += 10; // Vegas: tableau→foundation = +10
  }

  else return false;

  foundation.push(card);
  state.selected = null;
  checkWin(state);
  return true;
}

/* ─── AUTO-SEND TO ANY FOUNDATION (double-click) ────────── */

export function autoSendToFoundation(state){
  if(!state.selected) return false;
  for(let i = 0; i < 4; i++){
    const ok = moveToFoundation(state, i);
    if(ok) return true;
  }
  return false;
}

/* ─── HINT ───────────────────────────────────────────────── */

export function findHint(state){
  const moves = [];

  function tryFoundation(card, source){
    for(let f = 0; f < 4; f++){
      if(canPlaceFoundation(card, state.foundations[f])){
        moves.push({ source, target:"foundation", targetIndex:f });
      }
    }
  }

  function tryTableau(card, source){
    for(let c = 0; c < 7; c++){
      const col = state.tableau[c];
      const top = col[col.length-1] || null;
      if(canPlaceTableau(card, top)){
        // avoid suggesting moving a king to another empty column (pointless)
        if(card.value === "K" && !top && source.type === "tableau"){
          const srcCol = state.tableau[source.col];
          if(srcCol.length === 1) continue; // king already at base of empty col
        }
        moves.push({ source, target:"tableau", targetIndex:c });
      }
    }
  }

  // check waste top
  if(state.waste.length){
    const card = state.waste[state.waste.length - 1];
    tryFoundation(card, { type:"waste" });
    tryTableau(card, { type:"waste" });
  }

  // check each tableau column's face-up cards
  for(let c = 0; c < 7; c++){
    const col = state.tableau[c];
    for(let i = 0; i < col.length; i++){
      if(!col[i].faceUp) continue;
      const card = col[i];
      tryFoundation(card, { type:"tableau", col:c, index:i });
      tryTableau(card, { type:"tableau", col:c, index:i });
    }
  }

  if(!moves.length) return null;

  // prefer foundation moves
  const foundationMove = moves.find(m => m.target === "foundation");
  return foundationMove || moves[0];
}

/* ─── WIN ────────────────────────────────────────────────── */

export function checkWin(state){
  state.won = state.foundations.every(f => f.length === 13);
  if(state.won) state.score += 700; // Vegas win bonus
}
