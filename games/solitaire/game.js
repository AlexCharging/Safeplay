let gameState = null;

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

function startGame() {
  const deck = createDeck();
  gameState = deal(deck);
  render();
}

window.onload = startGame;
