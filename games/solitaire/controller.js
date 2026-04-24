import {
  selectTableau,
  selectWaste,
  moveToColumn,
  moveToFoundation,
  drawFromStock
} from "./engine.js";

import { render } from "./renderer.js";

export function createController(state) {
  const actions = {

    selectTableau: (c, i) => {
      selectTableau(state, c, i);
      render(state, actions);
    },

    selectWaste: () => {
      selectWaste(state);
      render(state, actions);
    },

    moveColumn: (col) => {
      const ok = moveToColumn(state, col);
      if (!ok) state._invalid = true;
      render(state, actions);
    },

    moveFoundation: (index) => {
      const ok = moveToFoundation(state, index);
      if (!ok) state._invalid = true;
      render(state, actions);
    },

    draw: () => {
      drawFromStock(state);
      render(state, actions);
    },

    undo: () => {
      // optional if you still have undo later
      render(state, actions);
    },

    hint: () => {
      render(state, actions);
    }
  };

  return actions;
}
}
