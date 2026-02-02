const columnsEl = document.getElementById("columns");
const colCountEl = document.getElementById("colCount");

const fieldListEls = document.querySelectorAll(".field-list .field");

let columns = [{ id: crypto.randomUUID(), fields: [] }];

let draggedField = null;
let fieldCounter = 1;

/* ---------- HELPERS ---------- */

function getUsedFieldIds() {
  return new Set(
    columns
      .flatMap(col => col.fields)
      .filter(f => !f.repeatable)
      .map(f => f.id)
  );
}

function recalcOrder() {
  let count = 1;
  columns.forEach(col => {
    col.fields.forEach(f => {
      f.order = count++;
    });
  });
  fieldCounter = count;
}

/* ---------- RENDER ---------- */

function render() {
  columnsEl.innerHTML = "";

  const usedFields = getUsedFieldIds();

  columns.forEach(col => {
    const colEl = document.createElement("div");
    colEl.className = "column" + (col.fields.length === 0 ? " empty" : "");

    colEl.addEventListener("dragover", e => {
      if (draggedField && col.fields.length < 4) {
        e.preventDefault();
      }
    });

    colEl.addEventListener("drop", () => {
      if (!draggedField) return;
      if (col.fields.length >= 4) return;

      col.fields.push({
        ...draggedField,
        order: fieldCounter++
      });

      draggedField = null;
      recalcOrder();
      render();
    });

    col.fields.forEach((f, index) => {
      const fieldEl = document.createElement("div");
      fieldEl.className = "field in-column";
      fieldEl.dataset.id = f.id;

      const label = document.createElement("span");
      label.textContent = f.label;

      const orderBadge = document.createElement("div");
      orderBadge.className = "field-order";
      orderBadge.textContent = f.order;

      const removeBtn = document.createElement("span");
      removeBtn.className = "remove";
      removeBtn.textContent = "×";

      removeBtn.onclick = e => {
        e.stopPropagation();
        col.fields.splice(index, 1);
        recalcOrder();
        render();
      };

      fieldEl.appendChild(orderBadge);
      fieldEl.appendChild(label);
      fieldEl.appendChild(removeBtn);
      colEl.appendChild(fieldEl);
    });

    columnsEl.appendChild(colEl);
  });

  fieldListEls.forEach(el => {
    const isUsed = usedFields.has(el.dataset.id);
    el.classList.toggle("disabled", isUsed);
    el.classList.toggle("repeatable", el.dataset.repeatable === "true");
    el.draggable = !isUsed;
  });

  colCountEl.textContent = `Columnas: ${columns.length}`;
}

/* ---------- DRAG ---------- */

fieldListEls.forEach(el => {
  el.addEventListener("dragstart", () => {
    if (el.classList.contains("disabled")) return;

    draggedField = {
      id: el.dataset.id,
      label: el.textContent,
      repeatable: el.dataset.repeatable === "true"
    };
  });
});

/* ---------- BUTTONS ---------- */

document.getElementById("addCol").onclick = () => {
  if (columns.length >= 5) return;

  columns.push({
    id: crypto.randomUUID(),
    fields: []
  });

  render();
};

document.getElementById("removeCol").onclick = () => {
  if (columns.length <= 1) return;

  columns.pop();
  recalcOrder();
  render();
};

/* INIT */
render();

const menu = document.querySelector(".side-menu");
const overlay = document.getElementById("overlay");

function toggleMenu() {
  menu.classList.toggle("open");
  overlay.classList.toggle("active");
}

overlay.addEventListener("click", () => {
  menu.classList.remove("open");
  overlay.classList.remove("active");
});