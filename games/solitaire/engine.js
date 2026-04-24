const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function getValue(v) {
  return values.indexOf(v);
}

function canPlaceTableau(card, target) {
  if (!target) return card.value === "K";
  if (card.color === target.color) return false;
  return getValue(card.value) === getValue(target.value) - 1;
}

function canPlaceFoundation(card, foundation) {
  if (!foundation.length) return card.value === "A";
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit &&
         getValue(card.value) === getValue(top.value) + 1;
}

/* ---------------- HISTORY SYSTEM ---------------- */

function saveState(state) {
  state.history.push(JSON.stringify(state));
  if (state.history.length > 30) state.history.shift();
}

export function undo(state) {
  if (!state.history.length) return;

  const prev = JSON.parse(state.history.pop());

  Object.assign(state, prev);
}

/* ---------------- AUTO MOVE ---------------- */

function tryAutoFoundation(state, card, fromTableau = null, fromWaste = false) {
  for (let i = 0; i < 4; i++) {
    if (canPlaceFoundation(card, state.foundations[i])) {
      state.foundations[i].push(card);

      if (fromWaste) state.waste.pop();
      if (fromTableau) {
        fromTableau.splice(fromTableau.indexOf(card), 1);
        if (fromTableau.length) {
          fromTableau[fromTableau.length - 1].faceUp = true;
        }
      }

      return true;
    }
  }
  return false;
}

/* ---------------- STOCK ---------------- */

export function drawFromStock(state) {
  saveState(state);

  if (!state.stock.length) {
    state.stock = state.waste.reverse();
    state.stock.forEach(c => c.faceUp = false);
    state.waste = [];
    return;
  }

  const card = state.stock.pop();
  card.faceUp = true;
  state.waste.push(card);

  tryAutoFoundation(state, card, null, true);
}

/* ---------------- MOVE ---------------- */

export function moveToColumn(state, toCol) {
  if (!state.selected) return false;

  saveState(state);

  const targetCol = state.tableau[toCol];
  const targetTop = targetCol[targetCol.length - 1];

  if (state.selected.type === "tableau") {
    const fromCol = state.tableau[state.selected.col];
    const moving = fromCol.slice(state.selected.index);
    const card = moving[0];

    if (!canPlaceTableau(card, targetTop)) return false;

    fromCol.splice(state.selected.index);
    targetCol.push(...moving);

    tryAutoFoundation(state, card, fromCol);
  }

  if (state.selected.type === "waste") {
    const card = state.waste[state.waste.length - 1];

    if (!canPlaceTableau(card, targetTop)) return false;

    state.waste.pop();
    targetCol.push(card);

    tryAutoFoundation(state, card, null, true);
  }

  state.selected = null;
  checkWin(state);

  return true;
}

/* ---------------- HINT SYSTEM ---------------- */

export function findHint(state) {
  for (let c = 0; c < 7; c++) {
    for (let i = 0; i < state.tableau[c].length; i++) {
      const card = state.tableau[c][i];

      for (let t = 0; t < 7; t++) {
        if (c === t) continue;
        const top = state.tableau[t].slice(-1)[0];

        if (canPlaceTableau(card, top)) {
          state.hint = { from: c, index: i, to: t };
          return state.hint;
        }
      }
    }
  }

  return null;
}

/* ---------------- WIN ---------------- */

export function checkWin(state) {
  const won = state.foundations.every(f => f.length === 13);
  state.won = won;
  return won;
}
