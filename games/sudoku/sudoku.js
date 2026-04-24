// sudoku.js — complete Sudoku game

// ─── PUZZLE GENERATOR ──────────────────────────────────────

function generateSolved(){
  const board = Array.from({length:9}, () => Array(9).fill(0));
  solve(board);
  return board;
}

function isValid(board, row, col, num){
  for(let i = 0; i < 9; i++){
    if(board[row][i] === num) return false;
    if(board[i][col] === num) return false;
  }
  const br = Math.floor(row/3)*3;
  const bc = Math.floor(col/3)*3;
  for(let r = br; r < br+3; r++)
    for(let c = bc; c < bc+3; c++)
      if(board[r][c] === num) return false;
  return true;
}

function solve(board){
  for(let row = 0; row < 9; row++){
    for(let col = 0; col < 9; col++){
      if(board[row][col] === 0){
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for(const num of nums){
          if(isValid(board, row, col, num)){
            board[row][col] = num;
            if(solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(arr){
  for(let i = arr.length-1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

const REMOVE_COUNT = { easy:35, medium:46, hard:54 };

function generatePuzzle(difficulty){
  const solution = generateSolved();
  const puzzle   = solution.map(r => [...r]);
  const cells    = shuffle([...Array(81).keys()]);
  let   removed  = 0;
  const target   = REMOVE_COUNT[difficulty] || 35;

  for(const idx of cells){
    if(removed >= target) break;
    const r = Math.floor(idx/9), c = idx%9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    // quick uniqueness check (count solutions ≤ 2)
    if(countSolutions(puzzle.map(x=>[...x])) === 1){
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }
  return { puzzle, solution };
}

function countSolutions(board, count=0){
  for(let row=0; row<9; row++){
    for(let col=0; col<9; col++){
      if(board[row][col]===0){
        for(let num=1; num<=9; num++){
          if(isValid(board,row,col,num)){
            board[row][col]=num;
            count=countSolutions(board,count);
            board[row][col]=0;
            if(count>1) return count;
          }
        }
        return count;
      }
    }
  }
  return count+1;
}

// ─── STATE ─────────────────────────────────────────────────

let state = {
  puzzle:     null,   // 9x9, 0=empty
  solution:   null,   // 9x9 correct answer
  userGrid:   null,   // 9x9, user entries (0=empty)
  notes:      null,   // 9x9 arrays of sets
  selected:   null,   // {row,col} or null
  difficulty: "easy",
  errors:     0,
  notesMode:  false,
  timer:      0,
  timerInterval: null
};

function newGame(difficulty){
  clearInterval(state.timerInterval);
  state.difficulty = difficulty || state.difficulty;

  const {puzzle, solution} = generatePuzzle(state.difficulty);
  state.puzzle   = puzzle;
  state.solution = solution;
  state.userGrid = puzzle.map(r => [...r]);
  state.notes    = Array.from({length:9}, () =>
                     Array.from({length:9}, () => new Set()));
  state.selected = null;
  state.errors   = 0;
  state.timer    = 0;
  state.notesMode = false;

  state.timerInterval = setInterval(() => {
    state.timer++;
    renderTimer();
  }, 1000);

  saveState();
  renderAll();
}

// ─── SAVE / LOAD ────────────────────────────────────────────

function saveState(){
  try {
    const serialisable = {
      puzzle:     state.puzzle,
      solution:   state.solution,
      userGrid:   state.userGrid,
      notes:      state.notes.map(r => r.map(s => [...s])),
      difficulty: state.difficulty,
      errors:     state.errors,
      timer:      state.timer
    };
    localStorage.setItem("safeplay-sudoku", JSON.stringify(serialisable));
  } catch(e){}
}

function loadState(){
  try {
    const raw = localStorage.getItem("safeplay-sudoku");
    if(!raw) return false;
    const s = JSON.parse(raw);
    state.puzzle     = s.puzzle;
    state.solution   = s.solution;
    state.userGrid   = s.userGrid;
    state.notes      = s.notes.map(r => r.map(arr => new Set(arr)));
    state.difficulty = s.difficulty;
    state.errors     = s.errors;
    state.timer      = s.timer;
    return true;
  } catch(e){ return false; }
}

// ─── INPUT ─────────────────────────────────────────────────

function selectCell(row, col){
  if(state.puzzle[row][col] !== 0) return; // given cells can't be changed
  state.selected = {row, col};
  renderAll();
}

function enterNumber(num){
  if(!state.selected) return;
  const {row, col} = state.selected;
  if(state.puzzle[row][col] !== 0) return;

  if(state.notesMode){
    const noteSet = state.notes[row][col];
    if(noteSet.has(num)) noteSet.delete(num);
    else noteSet.add(num);
  } else {
    state.userGrid[row][col] = num;
    state.notes[row][col].clear();
    // check for error
    if(num !== 0 && num !== state.solution[row][col]){
      state.errors++;
    }
    // check win
    if(isSolved()){
      clearInterval(state.timerInterval);
      setTimeout(() => renderWin(), 300);
    }
  }
  saveState();
  renderAll();
}

function eraseCell(){
  if(!state.selected) return;
  const {row, col} = state.selected;
  if(state.puzzle[row][col] !== 0) return;
  state.userGrid[row][col] = 0;
  state.notes[row][col].clear();
  saveState();
  renderAll();
}

function hint(){
  if(!state.selected) return;
  const {row, col} = state.selected;
  if(state.puzzle[row][col] !== 0) return;
  state.userGrid[row][col] = state.solution[row][col];
  state.notes[row][col].clear();
  state.errors = Math.max(0, state.errors); // hints don't add errors
  saveState();
  renderAll();
}

function isSolved(){
  for(let r=0; r<9; r++)
    for(let c=0; c<9; c++)
      if(state.userGrid[r][c] !== state.solution[r][c]) return false;
  return true;
}

// ─── RENDER ─────────────────────────────────────────────────

function renderAll(){
  renderGrid();
  renderKeypad();
  renderControls();
}

function renderGrid(){
  const container = document.getElementById("sudoku-grid");
  if(!container) return;
  container.innerHTML = "";

  for(let r=0; r<9; r++){
    for(let c=0; c<9; c++){
      const cell = document.createElement("div");
      cell.className = "s-cell";

      const isGiven    = state.puzzle[r][c] !== 0;
      const userVal    = state.userGrid[r][c];
      const isSelected = state.selected?.row===r && state.selected?.col===c;
      const selVal     = state.selected ? state.userGrid[state.selected.row][state.selected.col] : 0;

      // highlight same number
      const isSameNum  = selVal > 0 && userVal === selVal;
      // highlight same row/col/box as selected
      const isRelated  = state.selected && (
        state.selected.row === r ||
        state.selected.col === c ||
        (Math.floor(state.selected.row/3)===Math.floor(r/3) &&
         Math.floor(state.selected.col/3)===Math.floor(c/3))
      );

      const isError    = !isGiven && userVal !== 0 && userVal !== state.solution[r][c];

      if(isSelected)  cell.classList.add("selected");
      else if(isSameNum) cell.classList.add("same-num");
      else if(isRelated) cell.classList.add("related");
      if(isGiven)     cell.classList.add("given");
      if(isError)     cell.classList.add("error");

      // thick borders for 3x3 boxes
      if(c % 3 === 0)   cell.classList.add("box-left");
      if(r % 3 === 0)   cell.classList.add("box-top");
      if(c === 8)       cell.classList.add("box-right");
      if(r === 8)       cell.classList.add("box-bottom");

      if(userVal !== 0){
        cell.textContent = userVal;
      } else if(state.notes[r][c].size > 0){
        cell.classList.add("has-notes");
        const noteGrid = document.createElement("div");
        noteGrid.className = "note-grid";
        for(let n=1; n<=9; n++){
          const spot = document.createElement("span");
          spot.textContent = state.notes[r][c].has(n) ? n : "";
          noteGrid.appendChild(spot);
        }
        cell.appendChild(noteGrid);
      }

      cell.addEventListener("click", () => selectCell(r, c));
      container.appendChild(cell);
    }
  }
}

function renderKeypad(){
  const kp = document.getElementById("keypad");
  if(!kp) return;
  // keypad is static HTML — just update notes-mode button
  document.getElementById("notesBtn")
    ?.classList.toggle("active", state.notesMode);
}

function renderControls(){
  const diff = document.getElementById("diff-label");
  if(diff) diff.textContent = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

  const errEl = document.getElementById("errors");
  if(errEl) errEl.textContent = `Mistakes: ${state.errors}`;
}

function renderTimer(){
  const el = document.getElementById("timer");
  if(!el) return;
  const m = String(Math.floor(state.timer/60)).padStart(2,"0");
  const s = String(state.timer%60).padStart(2,"0");
  el.textContent = `${m}:${s}`;
}

function renderWin(){
  const el = document.getElementById("sudoku-win");
  if(!el) return;
  const m = String(Math.floor(state.timer/60)).padStart(2,"0");
  const s = String(state.timer%60).padStart(2,"0");
  el.innerHTML = `🎉 Puzzle solved! &nbsp; Time: ${m}:${s} &nbsp; Mistakes: ${state.errors}`;
  el.style.display = "block";
}

// ─── KEYBOARD SUPPORT ───────────────────────────────────────

document.addEventListener("keydown", e => {
  if(!state.selected) return;
  const {row, col} = state.selected;

  if(e.key >= "1" && e.key <= "9"){ enterNumber(parseInt(e.key)); return; }
  if(e.key === "0" || e.key === "Backspace" || e.key === "Delete"){ eraseCell(); return; }
  if(e.key === "n" || e.key === "N"){ state.notesMode = !state.notesMode; renderKeypad(); return; }

  const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
  if(moves[e.key]){
    e.preventDefault();
    const [dr, dc] = moves[e.key];
    const nr = Math.max(0, Math.min(8, row+dr));
    const nc = Math.max(0, Math.min(8, col+dc));
    state.selected = {row:nr, col:nc};
    renderAll();
  }
});

// ─── BOOT ───────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {

  // Wire up keypad buttons
  document.querySelectorAll(".key-num").forEach(btn => {
    btn.addEventListener("click", () => enterNumber(parseInt(btn.dataset.num)));
  });
  document.getElementById("eraseBtn")?.addEventListener("click", eraseCell);
  document.getElementById("notesBtn")?.addEventListener("click", () => {
    state.notesMode = !state.notesMode;
    renderKeypad();
  });
  document.getElementById("hintBtn")?.addEventListener("click", hint);

  // Difficulty buttons
  document.querySelectorAll(".diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      newGame(btn.dataset.diff);
    });
  });

  document.getElementById("newGameBtn")?.addEventListener("click", () => newGame());

  // Try to resume saved game, otherwise start fresh
  if(!loadState()){
    newGame("easy");
  } else {
    // restart timer
    state.timerInterval = setInterval(() => {
      state.timer++;
      renderTimer();
    }, 1000);
    renderAll();
  }
});
