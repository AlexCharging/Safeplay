export function getValue(v) {
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  return values.indexOf(v);
}

export function canPlace(card, target) {
  if (!target) return card.value === "K";
  if (card.color === target.color) return false;
  return getValue(card.value) === getValue(target.value) - 1;
}

export function drawFromStock(state) {
  if (!state.stock.length) {
    state.stock = state.waste.slice().reverse();
    state.stock.forEach(c => c.faceUp = false);
    state.waste = [];
    return;
  }

  const card = state.stock.pop();
  card.faceUp = true;
  state.waste.push(card);
}

export function selectTableau(state, colIndex, cardIndex) {
  const card = state.tableau[colIndex][cardIndex];
  if (!card || !card.faceUp) return;

  state.selected = { type: "tableau", colIndex, cardIndex };
}

export function selectWaste(state) {
  if (!state.waste.length) return;
  state.selected = { type: "waste" };
}

export function moveToColumn(state, toCol) {
  if (!state.selected) return false;

  const targetCol = state.tableau[toCol];
  const targetTop = targetCol[targetCol.length - 1];

  // FROM TABLEAU
  if (state.selected.type === "tableau") {
    const fromCol = state.tableau[state.selected.colIndex];
    const moving = fromCol.slice(state.selected.cardIndex);
    const card = moving[0];

    if (!canPlace(card, targetTop)) {
      return false;
    }

    fromCol.splice(state.selected.cardIndex);
    targetCol.push(...moving);
  }

  // FROM WASTE
  if (state.selected.type === "waste") {
    const card = state.waste[state.waste.length - 1];

    if (!canPlace(card, targetTop)) {
      return false;
    }

    state.waste.pop();
    targetCol.push(card);
  }

  state.selected = null;
  return true;
}
