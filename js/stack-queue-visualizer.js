let mode = "stack"; // stack | queue
let items = [];

let isAnimating = false;
let animationDelay = 400;

const container = document.getElementById("structureContainer");
const logPanel = document.getElementById("explanationPanel");
const speedSlider = document.getElementById("speedSlider");

speedSlider.addEventListener("input", () => {
  animationDelay = 800 - ((speedSlider.value - 50) / 150) * 700;
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ===== Logging ===== */

function log(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  logPanel.appendChild(li);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function clearLog() {
  logPanel.innerHTML = "";
}

/* ===== Mode ===== */

function switchMode() {
  mode = document.getElementById("modeSelect").value;
  clearAll();

  document.getElementById("stackOps").style.display =
    mode === "stack" ? "flex" : "none";

  document.getElementById("queueOps").style.display =
    mode === "queue" ? "flex" : "none";

  container.className = mode;
  log(`Switched to ${mode.toUpperCase()}`);
}

/* ===== Render ===== */

function render(activeIndex = null) {
  container.innerHTML = "";

  items.forEach((value, index) => {
    const box = document.createElement("div");
    box.className = "box";
    box.textContent = value;

    if (index === activeIndex) {
      box.classList.add("highlight");
    }

    container.appendChild(box);
  });
}

/* ===== Animation ===== */

async function runSteps(steps) {
  isAnimating = true;

  for (const step of steps) {
    if (step.type === "log") log(step.text);
    if (step.type === "highlight") render(step.index);
    if (step.type === "mutate") {
      step.action();
      render();
    }
    await sleep(animationDelay);
  }

  isAnimating = false;
}

/* ===== Create ===== */

async function handleCreate() {
  const value = Number(valueInput.value);
  if (isNaN(value)) return;

  clearLog();
  await runSteps([
    {
      type: "log",
      text: mode === "stack"
        ? `Add ${value} to stack`
        : `Add ${value} to queue`
    },
    {
      type: "mutate",
      action: () => items.push(value)
    }
  ]);
}

function createRandom() {
  clearLog();
  items = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 90) + 10
  );
  render();
  log("Random structure created");
}

/* ===== Peek ===== */

async function peekFront() {
  clearLog();
  if (items.length === 0) return log("Structure is empty");

  await runSteps([
    { type: "highlight", index: 0 },
    {
      type: "log",
      text:
        mode === "stack"
          ? `Bottom element is ${items[0]}`
          : `Front element is ${items[0]}`
    }
  ]);
}

async function peekBack() {
  clearLog();
  if (items.length === 0) return log("Structure is empty");

  const idx = items.length - 1;

  await runSteps([
    { type: "highlight", index: idx },
    {
      type: "log",
      text:
        mode === "stack"
          ? `Top element is ${items[idx]}`
          : `Rear element is ${items[idx]}`
    }
  ]);
}

/* ===== Stack ===== */

async function handlePush() {
  await handleCreate();
}

async function handlePop() {
  if (items.length === 0) return log("Stack is empty");

  clearLog();
  const idx = items.length - 1;

  await runSteps([
    { type: "highlight", index: idx },
    { type: "log", text: `Pop ${items[idx]} from stack` },
    {
      type: "mutate",
      action: () => items.pop()
    }
  ]);
}

/* ===== Queue ===== */

async function handleEnqueue() {
  await handleCreate();
}

async function handleDequeue() {
  if (items.length === 0) return log("Queue is empty");

  clearLog();

  await runSteps([
    { type: "highlight", index: 0 },
    { type: "log", text: `Dequeue ${items[0]} from queue` },
    {
      type: "mutate",
      action: () => items.shift()
    }
  ]);
}

/* ===== Clear ===== */

function clearAll() {
  items = [];
  clearLog();
  render();
}

/* ===== Init ===== */

switchMode();
