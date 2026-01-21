/* =====================================================
   GLOBAL STATE
===================================================== */

let treeMode = "binary";
let root = null;
let isAnimating = false;
let animationDelay = 400;
let traversalNode = null;

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 110;
const BASE_GAP = 200;
const MIN_GAP = 90;
const PADDING = 120;

const canvas = document.getElementById("treeCanvas");
const logPanel = document.getElementById("explanationPanel");
const speedSlider = document.getElementById("speedSlider");
const insertInput = document.getElementById("insertInput");
const deleteInput = document.getElementById("deleteInput");
const showAVLInfoCheckbox = document.getElementById("showAVLInfo");
const avlToggle = document.getElementById("avlToggle");

speedSlider.addEventListener("input", () => {
  animationDelay = 800 - ((speedSlider.value - 50) / 150) * 700;
});

showAVLInfoCheckbox.addEventListener("change", () => {
  renderTree();
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

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
   NODE
===================================================== */

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }
}

/* =====================================================
   MODE
===================================================== */

function switchTreeMode() {
  treeMode = document.getElementById("treeModeSelect").value;
  clearTree();
  avlToggle.style.display = treeMode === "avl" ? "flex" : "none";
  log(`Switched to ${treeMode.toUpperCase()} mode`);
}

/* =====================================================
   INSERT (FIXED ORDER)
===================================================== */

async function handleInsert() {
  const value = Number(insertInput.value);
  if (isNaN(value) || isAnimating) return;

  clearLog();
  isAnimating = true;

  // 1️⃣ Find path WITHOUT inserting
  const path = [];
  findInsertPath(root, value, path);

  // 2️⃣ Animate path
  for (const node of path) {
    traversalNode = node;
    renderTree();
    await sleep(animationDelay / 2);
  }

  traversalNode = null;

  // 3️⃣ Actually insert
  if (treeMode === "binary") root = insertLevelOrder(root, value);
  else if (treeMode === "bst") root = bstInsert(root, value);
  else root = avlInsert(root, value);

  log(`Inserted ${value}`);

  renderTree();
  isAnimating = false;
}

function handleInsertRandom() {
  if (isAnimating) return;

  const value = Math.floor(Math.random() * 90) + 10;
  insertInput.value = value;

  // reuse the SAME animation logic
  handleInsert();
}

function findInsertPath(node, value, path) {
  if (!node) return;

  path.push(node);

  if (treeMode === "binary") return;
  if (value < node.value) findInsertPath(node.left, value, path);
  else if (value > node.value) findInsertPath(node.right, value, path);
}

/* =====================================================
   DELETE (FIXED)
===================================================== */

async function handleDelete() {
  const value = Number(deleteInput.value);
  if (isNaN(value) || isAnimating) return;

  clearLog();
  isAnimating = true;

  // 1️⃣ Find path to value
  const path = [];
  findSearchPath(root, value, path);

  for (const node of path) {
    traversalNode = node;
    renderTree();
    await sleep(animationDelay / 2);
  }

  traversalNode = null;

  // 2️⃣ Perform delete
  let found = false;
  if (treeMode === "bst") [root, found] = bstDelete(root, value);
  else if (treeMode === "avl") [root, found] = avlDelete(root, value);
  else log("Binary Tree delete not supported");

  if (!found) log(`Value ${value} not found`);
  else log(`Deleted ${value}`);

  renderTree();
  isAnimating = false;
}

function findSearchPath(node, value, path) {
  if (!node) return;

  path.push(node);

  if (value < node.value) findSearchPath(node.left, value, path);
  else if (value > node.value) findSearchPath(node.right, value, path);
}

/* =====================================================
   TRAVERSALS (UNCHANGED)
===================================================== */

async function traverse(type) {
  if (!root || isAnimating) return;

  clearLog();
  isAnimating = true;

  const order = [];
  if (type === "inorder") inorder(root, order);
  if (type === "preorder") preorder(root, order);
  if (type === "postorder") postorder(root, order);
  if (type === "levelorder") levelOrder(root, order);

  log(`${type.toUpperCase()} traversal:`);

  for (const node of order) {
    traversalNode = node;
    renderTree();
    log(node.value);
    await sleep(animationDelay);
  }

  traversalNode = null;
  renderTree();
  isAnimating = false;
}

function inorder(node, result) {
  if (!node) return;
  inorder(node.left, result);
  result.push(node);
  inorder(node.right, result);
}

function preorder(node, result) {
  if (!node) return;
  result.push(node);
  preorder(node.left, result);
  preorder(node.right, result);
}

function postorder(node, result) {
  if (!node) return;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node);
}


function levelOrder(root, result) {
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}


/* =====================================================
   TREE LOGIC (STABLE)
===================================================== */

function insertLevelOrder(node, value) {
  const n = new TreeNode(value);
  if (!node) return n;

  const q = [node];
  while (q.length) {
    const cur = q.shift();
    if (!cur.left) return (cur.left = n), node;
    if (!cur.right) return (cur.right = n), node;
    q.push(cur.left, cur.right);
  }
}

function bstInsert(node, value) {
  if (!node) return new TreeNode(value);
  if (value < node.value) node.left = bstInsert(node.left, value);
  else if (value > node.value) node.right = bstInsert(node.right, value);
  return node;
}

function bstDelete(node, value) {
  if (!node) return [null, false];

  if (value < node.value) {
    const [l, f] = bstDelete(node.left, value);
    node.left = l;
    return [node, f];
  }

  if (value > node.value) {
    const [r, f] = bstDelete(node.right, value);
    node.right = r;
    return [node, f];
  }

  if (!node.left) return [node.right, true];
  if (!node.right) return [node.left, true];

  const min = findMin(node.right);
  node.value = min.value;
  const [r] = bstDelete(node.right, min.value);
  node.right = r;
  return [node, true];
}

/* ================= AVL ================= */

function avlInsert(node, value) {
  if (!node) return new TreeNode(value);

  if (value < node.value) node.left = avlInsert(node.left, value);
  else if (value > node.value) node.right = avlInsert(node.right, value);
  else return node;

  updateHeight(node);
  return rebalance(node);
}

function avlDelete(node, value) {
  if (!node) return [null, false];

  if (value < node.value) [node.left] = avlDelete(node.left, value);
  else if (value > node.value) [node.right] = avlDelete(node.right, value);
  else {
    if (!node.left || !node.right)
      return [node.left || node.right, true];

    const min = findMin(node.right);
    node.value = min.value;
    [node.right] = avlDelete(node.right, min.value);
  }

  updateHeight(node);
  return [rebalance(node), true];
}

/* ================= AVL helpers ================= */

function height(n) { return n ? n.height : 0; }
function updateHeight(n) {
  n.height = Math.max(height(n.left), height(n.right)) + 1;
}
function getBalance(n) {
  return height(n.left) - height(n.right);
}
function rebalance(n) {
  const bf = getBalance(n);
  if (bf > 1) {
    if (getBalance(n.left) < 0) n.left = rotateLeft(n.left);
    return rotateRight(n);
  }
  if (bf < -1) {
    if (getBalance(n.right) > 0) n.right = rotateRight(n.right);
    return rotateLeft(n);
  }
  return n;
}
function rotateRight(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  return x;
}
function rotateLeft(x) {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  return y;
}
function findMin(n) {
  while (n.left) n = n.left;
  return n;
}

/* =====================================================
   LAYOUT + CENTERING (UNCHANGED)
===================================================== */

function renderTree() {
  canvas.innerHTML = "";
  if (!root) return;

  const totalNodes = countNodes(root);
  const scale = Math.min(Math.sqrt(totalNodes) / 1.5, 2.5);

  layout(root, 0, 40, BASE_GAP * scale);
  centerTree(root);

  const bounds = getBounds(root);
  const width = bounds.maxX - bounds.minX + PADDING * 2;
  const height = bounds.maxY - bounds.minY + PADDING * 2;

  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  canvas.setAttribute(
    "viewBox",
    `${bounds.minX - PADDING}
     ${bounds.minY - PADDING}
     ${width}
     ${height}`
  );

  drawEdges(root);
  drawNodes(root);
}

function layout(node, x, y, gap) {
  if (!node) return;
  node.x = x;
  node.y = y;

  const nextGap = Math.max(gap * 0.6, MIN_GAP);
  layout(node.left, x - nextGap, y + LEVEL_HEIGHT, nextGap);
  layout(node.right, x + nextGap, y + LEVEL_HEIGHT, nextGap);
}

function countNodes(node) {
  return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
}

function centerTree(node) {
  const b = getBounds(node);
  const offset = (b.minX + b.maxX) / 2;
  shiftTree(node, -offset);
}

function getBounds(node, b = {
  minX: Infinity, maxX: -Infinity,
  minY: Infinity, maxY: -Infinity
}) {
  if (!node) return b;
  b.minX = Math.min(b.minX, node.x);
  b.maxX = Math.max(b.maxX, node.x);
  b.minY = Math.min(b.minY, node.y);
  b.maxY = Math.max(b.maxY, node.y);
  if (node.left) getBounds(node.left, b);
  if (node.right) getBounds(node.right, b);
  return b;
}

function shiftTree(node, dx) {
  if (!node) return;
  node.x += dx;
  shiftTree(node.left, dx);
  shiftTree(node.right, dx);
}

/* =====================================================
   DRAW
===================================================== */

function drawEdges(node) {
  if (!node) return;
  if (node.left) drawLine(node, node.left);
  if (node.right) drawLine(node, node.right);
  drawEdges(node.left);
  drawEdges(node.right);
}

function drawLine(a, b) {
  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", a.x);
  l.setAttribute("y1", a.y);
  l.setAttribute("x2", b.x);
  l.setAttribute("y2", b.y);
  l.classList.add("tree-edge");
  canvas.appendChild(l);
}

function drawNodes(node) {
  if (!node) return;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.classList.add("tree-node");
  if (node === traversalNode) g.classList.add("traversal");

  g.setAttribute("transform", `translate(${node.x}, ${node.y})`);

  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("r", NODE_RADIUS);

  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "middle");
  t.textContent = node.value;

  g.appendChild(c);
  g.appendChild(t);

  if (treeMode === "avl" && showAVLInfoCheckbox.checked) {
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", -28);
    bg.setAttribute("y", 28);
    bg.setAttribute("width", 56);
    bg.setAttribute("height", 18);
    bg.classList.add("avl-info-bg");

    const info = document.createElementNS("http://www.w3.org/2000/svg", "text");
    info.setAttribute("y", 41);
    info.setAttribute("text-anchor", "middle");
    info.classList.add("avl-info");
    info.textContent = `h=${node.height} bf=${getBalance(node)}`;

    g.appendChild(bg);
    g.appendChild(info);
  }

  canvas.appendChild(g);
  drawNodes(node.left);
  drawNodes(node.right);
}

/* =====================================================
   CLEAR
===================================================== */

function clearTree() {
  if (isAnimating) return;

  root = null;
  traversalNode = null;
  canvas.innerHTML = "";
  clearLog();
}
