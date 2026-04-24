export function enableDrag(el, onDrop) {
  let dragged = null;

  el.addEventListener("mousedown", (e) => {
    dragged = el;
    el.classList.add("moving");
  });

  document.addEventListener("mouseup", () => {
    if (dragged) {
      onDrop();
      dragged.classList.remove("moving");
      dragged = null;
    }
  });
}
