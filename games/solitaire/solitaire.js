import { createInitialState } from "./state.js";
import { createController } from "./controller.js";
import { render } from "./renderer.js";

const state = createInitialState();
const actions = createController(state);

window.onload = () => {
  render(state, actions);
};
