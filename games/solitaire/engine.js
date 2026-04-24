const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function getValue(v) {
  return values.indexOf(v);
}

/* ---------------- RULES ---------------- */

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

/* ---------------- SELECTION ---------------- */

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

/* ---------------- STOCK ---------------- */

export function drawFromStock(state) {
  if (!state.stock.length) {
    state.stock = state.waste.reverse();
    state.stock.forEach(c => (c.faceUp = false));
    state.waste = [];
    return;
  }

  const card = state.stock.pop();
  card.faceUp = true;
  state.waste.push(card);
}

/* ---------------- TABLEAU MOVE ---------------- */

export function moveToColumn(state, toCol) {
  if (!state.selected) return false;

  const targetCol = state.tableau[toCol];
  const targetTop = targetCol[targetCol.length - 1];

  let card;
  let sourceCol = null;

  if (state.selected.type === "tableau") {
    sourceCol = state.tableau[state.selected.col];
    const moving = sourceCol.slice(state.selected.index);
    card = moving[0];

    if (targetTop) {
      if (!canPlaceTableau(card, targetTop)) return false;
    } else {
      if (card.value !== "K") return false;
    }

    sourceCol.splice(state.selected.index);
    targetCol.push(...moving);

    if (sourceCol.length) {
      sourceCol[sourceCol.length - 1].faceUp = true;
    }
  }

  if (state.selected.type === "waste") {
    card = state.waste[state.waste.length - 1];

    if (targetTop) {
      if (!canPlaceTableau(card, targetTop)) return false;
    } else {
      if (card.value !== "K") return false;
    }

    state.waste.pop();
    targetCol.push(card);
  }

  state.selected = null;
  checkWin(state);
  return true;
}

/* ---------------- FOUNDATION MOVE ---------------- */

export function moveToFoundation(state, index) {
  if (!state.selected) return false;

  const foundation = state.foundations[index];
  let card;

  if (state.selected.type === "waste") {
    card = state.waste[state.waste.length - 1];

    if (!canPlaceFoundation(card, foundation)) return false;

    state.waste.pop();
  }

  if (state.selected.type === "tableau") {
    const col = state.tableau[state.selected.col];
    card = col[state.selected.index];

    if (!canPlaceFoundation(card, foundation)) return false;

    col.splice(state.selected.index);

    if (col.length) {
      col[col.length - 1].faceUp = true;
    }
  }

  foundation.push(card);
  state.selected = null;

  checkWin(state);
  return true;
}

/* ---------------- WIN ---------------- */

export function checkWin(state) {
  state.won = state.foundations.every(f => f.length === 13);
}
