import { createInitialState } from "./state.js";
import { createController } from "./controller.js";
import { render } from "./renderer.js";

function startGame() {
  const state = createInitialState();
  const actions = createController(state);

  render(state, actions);
}

window.addEventListener("DOMContentLoaded", startGame);
