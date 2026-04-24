let gameState = null;
let selected = null;

const suits = ["♥", "♦", "♣", "♠"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck() {
  let deck = [];

  for (let s = 0; s < suits.length; s++) {
    for (let v = 0; v < values.length; v++) {
      deck.push({
        suit: suits[s],
        value: values[v],
        color: (s < 2) ? "red" : "black",
        faceUp: false
      });
    }
  }

  return shuffle(deck);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function deal(deck) {
  const tableau = [[],[],[],[],[],[],[]];

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      let card = deck.pop();
      if (j === i) card.faceUp = true;
      tableau[i].push(card);
    }
  }

  return {
    tableau,
    stock: deck,
    waste: [],
    foundations: [[],[],[],[]]
  };
}

// --------------------
// GAME START
// --------------------
function startGame() {
  const deck = createDeck();
  gameState = deal(deck);
  render();
}

window.onload = startGame;

// --------------------
// GAME ACTIONS
// --------------------
function selectCard(colIndex, cardIndex) {
  const card = gameState.tableau[colIndex][cardIndex];
  if (!card || !card.faceUp) return;

  selected = { colIndex, cardIndex };
  render();
}

function moveCard(toColIndex) {
  if (!selected) return;

  const fromCol = gameState.tableau[selected.colIndex];
  const card = fromCol[selected.cardIndex];

  if (!card) return;

  const targetCol = gameState.tableau[toColIndex];
  const targetTop = targetCol[targetCol.length - 1];

  if (canPlace(card, targetTop)) {
    fromCol.splice(selected.cardIndex, 1);
    targetCol.push(card);
  }

  selected = null;
  render();
}

// --------------------
// RULES (basic)
// --------------------
function canPlace(card, target) {
  if (!target) return card.value === "K";

  if (card.color === target.color) return false;

  return getValue(card.value) === getValue(target.value) - 1;
}

function getValue(v) {
  return values.indexOf(v);
}

function drawFromStock() {
  if (!gameState.stock.length) {
    // reset waste back into stock
    gameState.stock = gameState.waste.reverse();
    gameState.waste = [];

    gameState.stock.forEach(c => c.faceUp = false);
    render();
    return;
  }

  const card = gameState.stock.pop();
  card.faceUp = true;
  gameState.waste.push(card);

  render();
}
