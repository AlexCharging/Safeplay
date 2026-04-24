export function enableDrag(el, options) {
  const {
    onDragStart,
    onDrop
  } = options;

  el.draggable = true;

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    el.classList.add("moving");

    if (onDragStart) {
      onDragStart();
    }
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("moving");
  });

  if (onDrop) {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      onDrop();
    });
  }
}
