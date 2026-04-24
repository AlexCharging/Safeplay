// controller.js — wires UI events to engine actions

import {
  selectTableau,
  selectWaste,
  moveToColumn,
  moveToFoundation,
  autoSendToFoundation,
  drawFromStock,
  undo,
  findHint
} from "./engine.js";

import { render } from "./renderer.js";

export function createController(state){

  const actions = {

    selectTableau:(col, index) => {
      selectTableau(state, col, index);
      render(state, actions);
    },

    selectWaste:() => {
      selectWaste(state);
      render(state, actions);
    },

    moveColumn:(col) => {
      const ok = moveToColumn(state, col);
      if(!ok){ state.selected = null; }
      render(state, actions);
    },

    moveFoundation:(index) => {
      const ok = moveToFoundation(state, index);
      if(!ok){ state.selected = null; }
      render(state, actions);
    },

    // Double-click: send top card to the right foundation automatically
    autoFoundation:() => {
      autoSendToFoundation(state);
      render(state, actions);
    },

    draw:() => {
      drawFromStock(state);
      render(state, actions);
    },

    undo:() => {
      undo(state);
      render(state, actions);
    },

    hint:() => {
      // findHint returns the best move; we store it so renderer can highlight
      state.hint = findHint(state);
      render(state, actions);
      // clear hint highlight after 2 seconds
      setTimeout(() => {
        state.hint = null;
        render(state, actions);
      }, 2000);
    },

    newGame:(drawMode) => {
      // re-import state lazily to avoid circular deps
      import("./state.js").then(({ createInitialState }) => {
        const mode = drawMode ?? state.drawMode;
        Object.assign(state, createInitialState(mode));
        render(state, actions);
      });
    },

    setDrawMode:(mode) => {
      actions.newGame(mode);
    }

  };

  return actions;
}
