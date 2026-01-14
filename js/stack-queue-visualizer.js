document.addEventListener("DOMContentLoaded", () => {

  let mode = "stack";
  let items = [];
  let isAnimating = false;

  const container = document.getElementById("structureContainer");
  const logPanel = document.getElementById("explanationPanel");
  const valueInput = document.getElementById("valueInput");

  const modeSelect = document.getElementById("modeSelect");
  const stackOps = document.getElementById("stackOps");
  const queueOps = document.getElementById("queueOps");

  const addBtn = document.getElementById("addBtn");
  const randomBtn = document.getElementById("randomBtn");
  const peekFrontBtn = document.getElementById("peekFrontBtn");
  const peekBackBtn = document.getElementById("peekBackBtn");
  const pushBtn = document.getElementById("pushBtn");
  const popBtn = document.getElementById("popBtn");
  const enqueueBtn = document.getElementById("enqueueBtn");
  const dequeueBtn = document.getElementById("dequeueBtn");
  const clearBtn = document.getElementById("clearBtn");

  function log(msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    logPanel.appendChild(li);
  }

  function clearLog() {
    logPanel.innerHTML = "";
  }

  function render(highlight = null) {
    container.innerHTML = "";
    items.forEach((v, i) => {
      const box = document.createElement("div");
      box.className = "box";
      if (i === highlight) box.classList.add("highlight");
      box.textContent = v;
      container.appendChild(box);
    });
  }

  function switchMode() {
    mode = modeSelect.value;
    items = [];
    clearLog();
    render();

    stackOps.style.display = mode === "stack" ? "flex" : "none";
    queueOps.style.display = mode === "queue" ? "flex" : "none";

    container.className = mode;
    log(`Switched to ${mode.toUpperCase()}`);
  }

  function addValue() {
    const v = Number(valueInput.value);
    if (isNaN(v)) return;
    items.push(v);
    render();
    log(`Added ${v}`);
  }

  function randomCreate() {
    items = Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 10);
    render();
    log("Random created");
  }

  function peekFront() {
    if (!items.length) return log("Empty");
    render(0);
    log(`Front: ${items[0]}`);
  }

  function peekBack() {
    if (!items.length) return log("Empty");
    render(items.length - 1);
    log(`Back: ${items.at(-1)}`);
  }

  function popStack() {
    if (!items.length) return log("Stack empty");
    log(`Pop ${items.pop()}`);
    render();
  }

  function dequeueQueue() {
    if (!items.length) return log("Queue empty");
    log(`Dequeue ${items.shift()}`);
    render();
  }

  /* BIND EVENTS */
  modeSelect.addEventListener("change", switchMode);
  addBtn.addEventListener("click", addValue);
  randomBtn.addEventListener("click", randomCreate);
  peekFrontBtn.addEventListener("click", peekFront);
  peekBackBtn.addEventListener("click", peekBack);
  pushBtn.addEventListener("click", addValue);
  popBtn.addEventListener("click", popStack);
  enqueueBtn.addEventListener("click", addValue);
  dequeueBtn.addEventListener("click", dequeueQueue);
  clearBtn.addEventListener("click", () => {
    items = [];
    clearLog();
    render();
  });

  /* INIT */
  switchMode();
});
