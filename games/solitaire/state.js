// state.js — builds the initial game state

export function createInitialState(drawMode = 1){
  const suits  = ["♥","♦","♣","♠"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  function shuffle(deck){
    for(let i = deck.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  const deck = [];
  for(const suit of suits){
    for(const value of values){
      const color = (suit === "♥" || suit === "♦") ? "red" : "black";
      deck.push({ suit, value, color, faceUp:false });
    }
  }
  shuffle(deck);

  const tableau = [[],[],[],[],[],[],[]];
  for(let i = 0; i < 7; i++){
    for(let j = 0; j <= i; j++){
      const card = deck.pop();
      if(j === i) card.faceUp = true;
      tableau[i].push(card);
    }
  }

  return {
    tableau,
    stock:       deck,
    waste:       [],
    foundations: [[],[],[],[]],
    selected:    null,
    won:         false,
    hint:        null,   // { source, target, targetIndex } or null
    drawMode,            // 1 or 3
    score:       0,
    history:     []      // undo stack (snapshots)
  };
}
