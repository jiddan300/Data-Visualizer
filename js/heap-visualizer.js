/* =====================================================
   GLOBAL STATE
===================================================== */

let heap = [];
let heapMode = "min";
let isAnimating = false;
let animationDelay = 500;
let edgeElements = {};

let highlight = {
  current: null,
  compare: null
};

let heapSize = 0;
let isSorting = false;


// store previous positions for smooth movement
let nodePositions = {};

const canvas = document.getElementById("heapCanvas");
const arrayView = document.getElementById("heapArray");
const logPanel = document.getElementById("explanationPanel");
const modeSelect = document.getElementById("heapMode");
const heapInput = document.getElementById("heapInput");
const speedSlider = document.getElementById("speedSlider");

speedSlider.addEventListener("input", () => {
  animationDelay = Number(speedSlider.value);
});

/* =====================================================
   UTIL
===================================================== */

const sleep = ms => new Promise(r => setTimeout(r, ms));

function compare(a, b) {
  return heapMode === "min" ? a < b : a > b;
}

/* =====================================================
   LOGGING
===================================================== */

function log(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  logPanel.appendChild(li);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function clearLog() {
  logPanel.innerHTML = "";
}

/* =====================================================
   MODE
===================================================== */

modeSelect.addEventListener("change", () => {
  heapMode = modeSelect.value;
  clearHeap();
  log(`Switched to ${heapMode.toUpperCase()} Heap`);
});

/* =====================================================
   BUILD HEAP (ANIMATED)
===================================================== */

async function handleBuildArray() {
  if (isAnimating) return;

  const input = document.getElementById("arrayInput").value;
  if (!input.trim()) return;

  clearLog();
  heap = input
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v));

  render();

  isAnimating = true;
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
    await heapifyDownAnimated(i);
  }
  isAnimating = false;

  log("Heap built");
}

async function handleBuildRandom() {
  if (isAnimating) return;

  clearLog();

  heap = Array.from({ length: 7 }, () =>
    Math.floor(Math.random() * 90) + 10
  );

  render();

  isAnimating = true;
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
    await heapifyDownAnimated(i);
  }
  isAnimating = false;

  log("Heap built");
}

/* =====================================================
   INSERT (ANIMATED)
===================================================== */

async function handleInsert() {
  if (isAnimating) return;

  const value = Number(heapInput.value);
  if (isNaN(value)) return;

  clearLog();
  heap.push(value);
  log(`Insert ${value}`);

  render();
  isAnimating = true;
  await heapifyUpAnimated(heap.length - 1);
  isAnimating = false;

  render();
}

function handleInsertRandom() {
  const value = Math.floor(Math.random() * 90) + 10;
  heapInput.value = value;
  handleInsert();
}

/* =====================================================
   POP ROOT (ANIMATED)
===================================================== */

async function handlePop() {
  if (isAnimating) return;

  if (heap.length === 0) {
    log("Heap is empty");
    return;
  }

  clearLog();
  isAnimating = true;

  log(`Remove root: ${heap[0]}`);
  heap[0] = heap[heap.length - 1];
  heap.pop();

  render();
  await heapifyDownAnimated(0);

  isAnimating = false;
  render();
}

/* =====================================================
   PEEK (ANIMATED)
===================================================== */

async function handlePeek() {
  if (isAnimating) return;

  if (heap.length === 0) {
    log("Heap is empty");
    return;
  }

  clearLog();
  highlight.current = 0;
  render();

  await sleep(animationDelay);
  log(`Root value: ${heap[0]}`);

  highlight.current = null;
  render();
}

/* =====================================================
   HEAP SORT
===================================================== */
async function handleHeapSort() {
  if (isAnimating || heap.length === 0) return;

  clearLog();
  isSorting = true;
  isAnimating = true;

  log("Start Heap Sort");

  // Heap sort requires max heap
  const prevMode = heapMode;
  heapMode = "max";

  heapSize = heap.length;

  // Ensure heap property
  for (let i = Math.floor(heapSize / 2) - 1; i >= 0; i--) {
    await heapifyDownAnimated(i, heapSize);
  }

  // Sorting loop
  for (let end = heapSize - 1; end > 0; end--) {
    log(`Swap root with index ${end}`);
    swap(0, end);
    render();
    await sleep(animationDelay);

    heapSize--;
    await heapifyDownAnimated(0, heapSize);
  }

  heapSize = heap.length;
  heapMode = prevMode;

  isSorting = false;
  isAnimating = false;

  render();
  log("Heap Sort complete");
}


/* =====================================================
   HEAPIFY ANIMATION
===================================================== */

async function heapifyUpAnimated(index) {
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);

    highlight.current = index;
    highlight.compare = parent;
    render();
    await sleep(animationDelay);

    if (compare(heap[index], heap[parent])) {
      swap(index, parent);
      render();
      await sleep(animationDelay);
      index = parent;
    } else break;
  }

  highlight.current = highlight.compare = null;
}
async function heapifyDownAnimated(index, limit = heap.length) {
  while (true) {
    let target = index;
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (left < limit) {
      highlight.current = index;
      highlight.compare = left;
      render();
      await sleep(animationDelay);
      if (compare(heap[left], heap[target])) target = left;
    }

    if (right < limit) {
      highlight.current = target;
      highlight.compare = right;
      render();
      await sleep(animationDelay);
      if (compare(heap[right], heap[target])) target = right;
    }

    if (target === index) break;

    swap(index, target);
    render();
    await sleep(animationDelay);

    index = target;
  }

  highlight.current = highlight.compare = null;
}


/* =====================================================
   HELPERS
===================================================== */

function swap(i, j) {
  [heap[i], heap[j]] = [heap[j], heap[i]];
}

function clearHeap() {
  heap = [];
  nodePositions = {};
  highlight.current = highlight.compare = null;
  clearLog();
  render();
}

/* =====================================================
   RENDER
===================================================== */

function render() {
  renderArray();
  renderTree();
}

/* ---------- ARRAY VIEW ---------- */

function renderArray() {
  arrayView.innerHTML = "";
  heap.forEach((v, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";

    if (isSorting && i >= heapSize) {
      cell.classList.add("sorted");
    } else if (i === highlight.current) {
      cell.classList.add("active");
    } else if (i === highlight.compare) {
      cell.classList.add("compare");
    }

    cell.textContent = v;
    arrayView.appendChild(cell);
  });
}

/* ---------- TREE VIEW (SMOOTH MOVEMENT) ---------- */
function renderTree() {
  const width = canvas.parentElement.clientWidth || 800;
  canvas.setAttribute("width", width);

  const levelHeight = 80;
  const r = 18;

  const newPositions = {};
  canvas.innerHTML = "";

  /* -------- Compute positions -------- */
  heap.forEach((_, index) => {
    const level = Math.floor(Math.log2(index + 1));
    const pos = index - (2 ** level - 1);
    const nodes = 2 ** level;

    const x = (pos + 1) * (width / (nodes + 1));
    const y = 40 + level * levelHeight;

    newPositions[index] = { x, y };
  });

  /* -------- Draw & animate edges -------- */
  heap.forEach((_, index) => {
    if (index === 0) return;

    const parent = Math.floor((index - 1) / 2);
    const edgeKey = `${parent}-${index}`;

    const prevP = nodePositions[parent] || newPositions[parent];
    const prevC = nodePositions[index] || newPositions[index];
    const newP = newPositions[parent];
    const newC = newPositions[index];

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    line.setAttribute("x1", prevP.x);
    line.setAttribute("y1", prevP.y);
    line.setAttribute("x2", prevC.x);
    line.setAttribute("y2", prevC.y);
    line.setAttribute("stroke", "#94a3b8");
    line.style.transition = `all ${animationDelay}ms ease`;

    requestAnimationFrame(() => {
      line.setAttribute("x1", newP.x);
      line.setAttribute("y1", newP.y);
      line.setAttribute("x2", newC.x);
      line.setAttribute("y2", newC.y);
    });

    canvas.appendChild(line);
  });

  /* -------- Draw & animate nodes -------- */
  heap.forEach((value, index) => {
    const pos = newPositions[index];
    const prev = nodePositions[index] || pos;

    const g = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    g.setAttribute(
      "transform",
      `translate(${prev.x}, ${prev.y})`
    );
    g.style.transition = `transform ${animationDelay}ms ease`;

    requestAnimationFrame(() => {
      g.setAttribute(
        "transform",
        `translate(${pos.x}, ${pos.y})`
      );
    });

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("r", r);
    circle.setAttribute(
      "fill",
      isSorting && index >= heapSize ? "#22c55e" :
      index === highlight.current ? "#f59e0b" :
      index === highlight.compare ? "#ef4444" :
      "#2563eb"
    );

    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "white");
    text.textContent = value;

    g.appendChild(circle);
    g.appendChild(text);
    canvas.appendChild(g);
  });

  nodePositions = newPositions;
}

