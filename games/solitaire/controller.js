import {
  selectTableau,
  selectWaste,
  moveToColumn,
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

    move: (col) => {
      moveToColumn(state, col);
      render(state, actions);
    },

    draw: () => {
      drawFromStock(state);
      render(state, actions);
    }
  };

  return actions;
}
