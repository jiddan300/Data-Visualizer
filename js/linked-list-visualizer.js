/* =========================
   NODE MODEL
========================= */

class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
    this.prev = null; // used only in doubly
  }
}

/* =========================
   GLOBAL STATE
========================= */

let head = null;
let listType = "singly"; // singly | doubly

let isAnimating = false;
let animationDelay = 400;

/* =========================
   DOM REFERENCES
========================= */

const container = document.getElementById("linkedListContainer");
const logPanel = document.getElementById("explanationPanel");
const speedSlider = document.getElementById("speedSlider");

/* =========================
   SPEED CONTROL
========================= */

speedSlider.addEventListener("input", () => {
  animationDelay = 800 - ((speedSlider.value - 50) / 150) * 700;
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* =========================
   LOGGING
========================= */

function log(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  logPanel.appendChild(li);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function clearLog() {
  logPanel.innerHTML = "";
}

/* =========================
   LIST TYPE SWITCH
========================= */

function switchListType() {
  if (isAnimating) return;
  listType = document.getElementById("listType").value;
  clearAll();
  log(`Switched to ${listType} linked list`);
}

/* =========================
   ENABLE / DISABLE INDEX
========================= */

function toggleInsertIndex() {
  document.getElementById("indexInput").disabled =
    document.getElementById("insertPosition").value !== "index";
}

function toggleRemoveIndex() {
  document.getElementById("removeIndexInput").disabled =
    document.getElementById("removePosition").value !== "index";
}

/* =========================
   AUTO SCROLL
========================= */

function scrollToNode(el) {
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest"
  });
}

/* =========================
   RENDERING
========================= */

function renderList(activeNode = null) {
  container.innerHTML = "";
  let curr = head;
  let index = 0;

  while (curr) {
    const wrapper = document.createElement("div");
    wrapper.className = "node-wrapper";

    const node = document.createElement("div");
    node.className = "node";

    if (curr === activeNode) {
      node.classList.add("traversing");
      setTimeout(() => scrollToNode(wrapper), 50);
    }

    if (index === 0) {
      const headLabel = document.createElement("div");
      headLabel.className = "node-label head";
      headLabel.textContent = "HEAD";
      wrapper.appendChild(headLabel);
    }

    if (!curr.next) {
      const tailLabel = document.createElement("div");
      tailLabel.className = "node-label tail";
      tailLabel.textContent = "TAIL";
      wrapper.appendChild(tailLabel);
    }

    node.innerHTML =
      listType === "doubly"
        ? `
          <div class="node-prev">prev</div>
          <div class="node-data">${curr.value}</div>
          <div class="node-next">next</div>
        `
        : `
          <div class="node-data">${curr.value}</div>
          <div class="node-next">next</div>
        `;

    wrapper.appendChild(node);
    container.appendChild(wrapper);

    if (curr.next) {
      const arrow = document.createElement("div");
      arrow.className = "arrow";
      arrow.textContent = listType === "doubly" ? "⇄" : "→";
      container.appendChild(arrow);
    }

    curr = curr.next;
    index++;
  }

  if (!head) {
    const empty = document.createElement("div");
    empty.className = "null";
    empty.textContent = "List is empty";
    container.appendChild(empty);
  }
}

/* =========================
   HELPERS (NO ANIMATION)
========================= */

function getNodeAt(index) {
  let curr = head;
  let i = 0;
  while (curr && i < index) {
    curr = curr.next;
    i++;
  }
  return curr;
}

/* =========================
   ANIMATION ENGINE
========================= */

async function runSteps(steps) {
  isAnimating = true;

  for (const step of steps) {
    if (step.type === "log") log(step.text);
    if (step.type === "highlight") renderList(step.node);
    if (step.type === "mutate") {
      step.action();
      renderList();
    }
    await sleep(animationDelay);
  }

  isAnimating = false;
}

/* =========================
   INSERT HANDLER
========================= */

async function handleInsert() {
  if (isAnimating) return;

  const value = Number(document.getElementById("valueInput").value);
  if (isNaN(value)) return;

  clearLog();
  const pos = document.getElementById("insertPosition").value;

  if (pos === "head") await insertHead(value);
  else if (pos === "tail") await insertTail(value);
  else await insertAtIndex(value);
}

/* =========================
   INSERT OPERATIONS
========================= */

async function insertHead(value) {
  const node = new Node(value);

  await runSteps([
    { type: "log", text: `Insert ${value} at head` },
    {
      type: "mutate",
      action: () => {
        node.next = head;
        if (head && listType === "doubly") head.prev = node;
        head = node;
      }
    }
  ]);
}

async function insertTail(value) {
  const node = new Node(value);
  const steps = [];

  if (!head) {
    steps.push({ type: "log", text: "List empty, node becomes head" });
    steps.push({ type: "mutate", action: () => (head = node) });
    await runSteps(steps);
    return;
  }

  let curr = head;
  let i = 0;

  while (curr.next) {
    steps.push({ type: "highlight", node: curr });
    steps.push({ type: "log", text: `Traverse index ${i}` });
    curr = curr.next;
    i++;
  }

  steps.push({ type: "highlight", node: curr });
  steps.push({ type: "log", text: `Insert ${value} after index ${i}` });

  steps.push({
    type: "mutate",
    action: () => {
      curr.next = node;
      if (listType === "doubly") node.prev = curr;
    }
  });

  await runSteps(steps);
}

async function insertAtIndex(value) {
  const index = Number(document.getElementById("indexInput").value);
  if (isNaN(index)) return;

  if (index === 0) {
    await insertHead(value);
    return;
  }

  const prev = getNodeAt(index - 1);
  if (!prev) {
    await runSteps([{ type: "log", text: "Index out of range" }]);
    return;
  }

  const node = new Node(value);
  const steps = [];
  let curr = head;
  let i = 0;

  while (curr !== prev) {
    steps.push({ type: "highlight", node: curr });
    steps.push({ type: "log", text: `Traverse index ${i}` });
    curr = curr.next;
    i++;
  }

  steps.push({ type: "highlight", node: prev });
  steps.push({ type: "log", text: `Reached index ${index - 1}` });
  steps.push({ type: "log", text: `Insert ${value} after index ${index - 1}` });

  steps.push({
    type: "mutate",
    action: () => {
      node.next = prev.next;
      if (listType === "doubly") node.prev = prev;
      if (prev.next && listType === "doubly") prev.next.prev = node;
      prev.next = node;
    }
  });

  await runSteps(steps);
}

/* =========================
   REMOVE HANDLER
========================= */

async function handleRemove() {
  if (isAnimating) return;

  clearLog();
  const pos = document.getElementById("removePosition").value;

  if (pos === "head") await removeHead();
  else if (pos === "tail") await removeTail();
  else await removeAtIndex();
}

/* =========================
   REMOVE OPERATIONS
========================= */

async function removeHead() {
  if (!head) {
    await runSteps([{ type: "log", text: "List is empty" }]);
    return;
  }

  const old = head;

  await runSteps([
    { type: "highlight", node: old },
    { type: "log", text: `Remove head (${old.value})` },
    {
      type: "mutate",
      action: () => {
        head = old.next;
        if (head && listType === "doubly") head.prev = null;
      }
    }
  ]);
}

async function removeTail() {
  if (!head) {
    await runSteps([{ type: "log", text: "List is empty" }]);
    return;
  }

  if (!head.next) {
    await runSteps([
      { type: "highlight", node: head },
      { type: "log", text: `Remove tail (${head.value})` },
      { type: "mutate", action: () => (head = null) }
    ]);
    return;
  }

  let curr = head;
  let i = 0;
  const steps = [];

  while (curr.next.next) {
    steps.push({ type: "highlight", node: curr });
    steps.push({ type: "log", text: `Traverse index ${i}` });
    curr = curr.next;
    i++;
  }

  steps.push({ type: "highlight", node: curr.next });
  steps.push({ type: "log", text: `Remove node at index ${i + 1}` });

  steps.push({
    type: "mutate",
    action: () => (curr.next = null)
  });

  await runSteps(steps);
}

async function removeAtIndex() {
  const index = Number(document.getElementById("removeIndexInput").value);
  if (isNaN(index)) return;

  if (!head) {
    await runSteps([{ type: "log", text: "List is empty" }]);
    return;
  }

  if (index === 0) {
    await removeHead();
    return;
  }

  const prev = getNodeAt(index - 1);
  if (!prev || !prev.next) {
    await runSteps([{ type: "log", text: "Index out of range" }]);
    return;
  }

  const steps = [];
  let curr = head;
  let i = 0;

  while (curr !== prev) {
    steps.push({ type: "highlight", node: curr });
    steps.push({ type: "log", text: `Traverse index ${i}` });
    curr = curr.next;
    i++;
  }

  const target = prev.next;

  steps.push({ type: "highlight", node: prev });
  steps.push({ type: "log", text: `Reached index ${index - 1}` });

  steps.push({ type: "highlight", node: target });
  steps.push({
    type: "log",
    text: `Remove node at index ${index} (${target.value})`
  });

  steps.push({
    type: "mutate",
    action: () => {
      prev.next = target.next;
      if (target.next && listType === "doubly") {
        target.next.prev = prev;
      }
    }
  });

  await runSteps(steps);
}

/* =========================
   BULK / CLEAR
========================= */

function addList() {
  if (isAnimating) return;

  clearLog();
  const input = document.getElementById("bulkInput").value;
  if (!input) return;

  input
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v))
    .forEach(v => {
      const n = new Node(v);
      n.next = head;
      if (head && listType === "doubly") head.prev = n;
      head = n;
    });

  renderList();
}

function addRandomList() {
  const count = Math.floor(Math.random() * 5) + 3;
  const values = Array.from({ length: count }, () =>
    Math.floor(Math.random() * 90) + 10
  );

  document.getElementById("bulkInput").value = values.join(", ");
  addList();
}

function clearAll() {
  
  if (isAnimating) return;


  head = null;
  clearLog();
  renderList();
}

/* =========================
   INIT
========================= */

renderList();
