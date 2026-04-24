import {
  selectTableau,
  selectWaste,
  moveToColumn,
  drawFromStock,
  undo,
  findHint
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

    draw: () => {
      drawFromStock(state);
      render(state, actions);
    },

    undo: () => {
      undo(state);
      render(state, actions);
    },

    hint: () => {
      findHint(state);
      render(state, actions);
    }
  };

  return actions;
}
