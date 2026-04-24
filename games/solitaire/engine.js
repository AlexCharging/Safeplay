const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function getValue(v) {
  return values.indexOf(v);
}

/* ---------------------------
   MOVE RULES
---------------------------- */

function canPlaceTableau(card, target) {
  if (!target) return card.value === "K";
  if (card.color === target.color) return false;
  return getValue(card.value) === getValue(target.value) - 1;
}

function canPlaceFoundation(card, foundation) {
  if (!foundation.length) return card.value === "A";

  const top = foundation[foundation.length - 1];

  return (
    card.suit === top.suit &&
    getValue(card.value) === getValue(top.value) + 1
  );
}

/* ---------------------------
   HISTORY (UNDO SUPPORT)
---------------------------- */

function saveState(state) {
  state.history.push(JSON.stringify({
    tableau: state.tableau,
    stock: state.stock,
    waste: state.waste,
    foundations: state.foundations,
    selected: null
  }));

  if (state.history.length > 30) {
    state.history.shift();
  }
}

export function undo(state) {
  if (!state.history.length) return;

  const prev = JSON.parse(state.history.pop());

  state.tableau = prev.tableau;
  state.stock = prev.stock;
  state.waste = prev.waste;
  state.foundations = prev.foundations;
  state.selected = null;
}

/* ---------------------------
   SELECTION (FIXED EXPORTS)
---------------------------- */

export function selectTableau(state, col, index) {
  const card = state.tableau[col][index];
  if (!card || !card.faceUp) return;

  state.selected = {
    type: "tableau",
    col,
    index
  };
}

export function selectWaste(state) {
  if (!state.waste.length) return;

  state.selected = {
    type: "waste"
  };
}

export function clearSelection(state) {
  state.selected = null;
}

/* ---------------------------
   AUTO MOVE TO FOUNDATION
---------------------------- */

function tryAutoFoundation(state, card, fromCol = null, fromWaste = false) {
  for (let i = 0; i < state.foundations.length; i++) {
    const foundation = state.foundations[i];

    if (canPlaceFoundation(card, foundation)) {
      foundation.push(card);

      if (fromWaste) {
        state.waste.pop();
      }

      if (fromCol) {
        fromCol.splice(fromCol.indexOf(card), 1);

        if (fromCol.length) {
          fromCol[fromCol.length - 1].faceUp = true;
        }
      }

      return true;
    }
  }

  return false;
}

/* ---------------------------
   STOCK / WASTE
---------------------------- */

export function drawFromStock(state) {
  saveState(state);

  if (!state.stock.length) {
    state.stock = state.waste.reverse();
    state.stock.forEach(c => (c.faceUp = false));
    state.waste = [];
    return;
  }

  const card = state.stock.pop();
  card.faceUp = true;
  state.waste.push(card);

  tryAutoFoundation(state, card, null, true);
}

/* ---------------------------
   MOVE TO TABLEAU
---------------------------- */

export function moveToColumn(state, toCol) {
  if (!state.selected) return false;

  saveState(state);

  const targetCol = state.tableau[toCol];
  const targetTop = targetCol[targetCol.length - 1];

  /* TABLEAU → TABLEAU */
  if (state.selected.type === "tableau") {
    const fromCol = state.tableau[state.selected.col];
    const moving = fromCol.slice(state.selected.index);
    const card = moving[0];

    if (!canPlaceTableau(card, targetTop)) return false;

    fromCol.splice(state.selected.index);
    targetCol.push(...moving);

    tryAutoFoundation(state, card, fromCol);
  }

  /* WASTE → TABLEAU */
  if (state.selected.type === "waste") {
    const card = state.waste[state.waste.length - 1];

    if (!canPlaceTableau(card, targetTop)) return false;

    state.waste.pop();
    targetCol.push(card);

    tryAutoFoundation(state, card, null, true);
  }

  clearSelection(state);
  checkWin(state);

  return true;
}

/* ---------------------------
   HINT SYSTEM
---------------------------- */

export function findHint(state) {
  for (let c = 0; c < 7; c++) {
    for (let i = 0; i < state.tableau[c].length; i++) {
      const card = state.tableau[c][i];

      for (let t = 0; t < 7; t++) {
        if (c === t) continue;

        const targetTop = state.tableau[t][state.tableau[t].length - 1];

        if (canPlaceTableau(card, targetTop)) {
          state.hint = { from: c, index: i, to: t };
          return state.hint;
        }
      }
    }
  }

  state.hint = null;
  return null;
}

/* ---------------------------
   WIN CONDITION
---------------------------- */

export function checkWin(state) {
  const won = state.foundations.every(f => f.length === 13);
  state.won = won;
  return won;
}
