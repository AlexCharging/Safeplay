import { enableDrag } from "./drag.js";

export function render(state,actions){
  renderStock(state,actions);
  renderWaste(state,actions);
  renderTableau(state,actions);
  renderFoundations(state,actions);
  renderUI(state,actions);
}

/* ---------- STOCK ---------- */

function renderStock(state,actions){

 const stock=
  document.getElementById("stock");

 if(!stock) return;

 stock.innerHTML="";

 if(!state.stock.length) return;

 const back=document.createElement("div");
 back.className="card back";

 back.onclick=()=>actions.draw();

 stock.appendChild(back);
}

/* ---------- WASTE ---------- */

function renderWaste(state,actions){

 const waste=
  document.getElementById("waste");

 if(!waste) return;

 waste.innerHTML="";

 const card=
  state.waste[
   state.waste.length-1
  ];

 if(!card) return;

 const el=document.createElement("div");
 el.className="card";

 if(state.selected?.type==="waste"){
  el.classList.add("selected");
 }

 el.innerHTML=`
 <span class="card-value ${card.color}">
 ${card.value}${card.suit}
 </span>
 `;

 el.onclick=()=>actions.selectWaste();

 enableDrag(el,{
  onDragStart:()=>actions.selectWaste()
 });

 waste.appendChild(el);
}

/* ---------- TABLEAU ---------- */

function renderTableau(state,actions){

 const cols=
  document.querySelectorAll(".column");

 cols.forEach((col,colIndex)=>{

   col.innerHTML="";

   /* proper drop zone */
   col.addEventListener(
    "dragover",
    e=>{
      e.preventDefault();
    }
   );

   col.addEventListener(
    "drop",
    e=>{
      e.preventDefault();

      if(state.selected){
        actions.moveColumn(
         colIndex
        );
      }
    }
   );

   state.tableau[colIndex].forEach(
   (card,cardIndex)=>{

    const el=document.createElement("div");
    el.className="card";

    el.style.top=
      `${cardIndex*24}px`;

    el.style.zIndex=cardIndex;

    if(
      state.selected &&
      state.selected.type==="tableau" &&
      state.selected.col===colIndex &&
      state.selected.index===cardIndex
    ){
      el.classList.add(
       "selected"
      );
    }

    if(!card.faceUp){
      el.classList.add("back");
    }
    else{
      el.innerHTML=`
      <span class="card-value ${card.color}">
      ${card.value}${card.suit}
      </span>
      `;
    }

    el.onclick=(e)=>{
      e.stopPropagation();

      if(!card.faceUp) return;

      actions.selectTableau(
       colIndex,
       cardIndex
      );
    };

    if(card.faceUp){
      enableDrag(el,{
       onDragStart:()=>{
         actions.selectTableau(
          colIndex,
          cardIndex
         );
       }
      });
    }

    col.appendChild(el);

   });

   col.onclick=()=>{
     if(!state.selected) return;
     actions.moveColumn(colIndex);
   };

 });
}

/* ---------- FOUNDATIONS ---------- */

function renderFoundations(
 state,
 actions
){

 const foundations=
  document.querySelectorAll(
   ".foundation"
  );

 foundations.forEach((f,index)=>{

  f.innerHTML="";

  f.addEventListener(
   "dragover",
   e=>{
    e.preventDefault();
   }
  );

  f.addEventListener(
   "drop",
   e=>{
    e.preventDefault();

    if(state.selected){
      actions.moveFoundation(
       index
      );
    }
   }
  );

  const pile=
   state.foundations[index];

  const top=
   pile[pile.length-1];

  if(top){

   const el=document.createElement("div");
   el.className="card";

   el.innerHTML=`
   <span class="card-value ${top.color}">
   ${top.value}${top.suit}
   </span>
   `;

   f.appendChild(el);
  }

  f.onclick=()=>{
   if(!state.selected) return;
   actions.moveFoundation(index);
  };

 });
}

/* ---------- UI ---------- */

function renderUI(state,actions){

 let ui=
  document.getElementById("ui");

 if(!ui){
  ui=document.createElement("div");
  ui.id="ui";

  document
   .getElementById("game")
   .appendChild(ui);
 }

 ui.innerHTML=`
 <button id="undoBtn">Undo</button>
 <button id="hintBtn">Hint</button>
 `;

 document
 .getElementById("undoBtn")
 .onclick=actions.undo;

 document
 .getElementById("hintBtn")
 .onclick=actions.hint;

 if(state.won){

 let win=
  document.getElementById("win");

 if(!win){
  win=document.createElement("div");
  win.id="win";

  document
   .getElementById("game")
   .appendChild(win);
 }

 win.innerHTML="🎉 You Win! 🎉";
 }
}
```

---

# 4) Add these at bottom of `main.css`

```css
/* drag fixes */
.moving{
 outline:3px solid #ffd54f;
}

.card{
 cursor:grab;
}

.card:active{
 cursor:grabbing;
}

/* buttons above cards */
#ui{
 position:relative;
 z-index:999;
 margin-top:40px;
}
