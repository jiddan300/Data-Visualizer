let array = [];
let steps = [];
let currentStep = 0;
let timer = null;
let playing = false;

/* =======================
   DATA INPUT
======================= */

function generateArray() {
  array = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 100) + 10
  );
  reset();
}

function applyManualInput() {
  const input = document.getElementById("manualInput").value;
  if (!input) return;

  const values = input
    .split(",")
    .map(v => parseInt(v.trim()))
    .filter(v => !isNaN(v));

  if (values.length === 0) {
    alert("Please enter valid numbers separated by commas.");
    return;
  }

  array = values;
  reset();
}

/* =======================
   TYPE & ALGORITHM
======================= */

const algorithmType = document.getElementById("algorithmType");
const algorithmSelect = document.getElementById("algorithmSelect");
const targetWrapper = document.getElementById("targetWrapper");
const searchTarget = document.getElementById("searchTarget");

algorithmType.addEventListener("change", () => {
  reset();

  if (algorithmType.value === "sorting") {
    targetWrapper.style.display = "none";
    algorithmSelect.innerHTML = `
      <option value="bubble">Bubble Sort</option>
      <option value="selection">Selection Sort</option>
      <option value="insertion">Insertion Sort</option>
      <option value="merge">Merge Sort</option>
      <option value="quick">Quick Sort</option>
    `;
  } else {
    targetWrapper.style.display = "inline-block";
    algorithmSelect.innerHTML = `
      <option value="linear">Linear Search</option>
      <option value="binary">Binary Search</option>
      <option value="jump">Jump Search</option>
    `;
  }
});

/* =======================
   LOAD STEPS
======================= */

function loadSteps() {
  const type = algorithmType.value;
  const algo = algorithmSelect.value;

  if (type === "sorting") {
    if (algo === "bubble") steps = bubbleSortSteps(array);
    if (algo === "selection") steps = selectionSortSteps(array);
    if (algo === "insertion") steps = insertionSortSteps(array);
    if (algo === "merge") steps = mergeSortSteps(array);
    if (algo === "quick") steps = quickSortSteps(array);
  }

  if (type === "searching") {
    const target = parseInt(searchTarget.value);
    if (isNaN(target)) {
      alert("Please enter a target value.");
      return;
    }

    if (algo === "linear") {
      steps = linearSearchSteps(array, target);
    }

    if (algo === "binary") {
      steps = binarySearchSteps(array, target);
    }

    if (algo === "jump") {
      steps = jumpSearchSteps(array, target);
    }
  }
}

/* =======================
   EXPLANATION LOG
======================= */

function addExplanation(text) {
  const panel = document.getElementById("explanationPanel");
  const item = document.createElement("li");
  item.innerText = text;
  panel.appendChild(item);
  panel.scrollTop = panel.scrollHeight;
}

function clearExplanation() {
  document.getElementById("explanationPanel").innerHTML = "";
}

/* =======================
   RENDER
======================= */

function render(step) {
  const visualizer = document.getElementById("visualizer");
  visualizer.innerHTML = "";

  step.array.forEach((value, index) => {
    const container = document.createElement("div");
    container.className = "bar-container";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = value + "px";

    if (step.indices && step.indices.includes(index)) {
      bar.classList.add("active");
    }

    if (step.foundIndex === index) {
      bar.classList.add("found");
    }

    if (step.notFound) {
      bar.classList.add("not-found");
    }

    const label = document.createElement("span");
    label.className = "bar-value";
    label.innerText = value;

    container.appendChild(bar);
    container.appendChild(label);
    visualizer.appendChild(container);
  });

  if (step.explanation) {
    addExplanation(step.explanation);
  }
}

/* =======================
   SPEED
======================= */

function getDelay() {
  const speed = document.getElementById("speedSlider").value;
  return 2100 - speed * 10;
}

/* =======================
   TIMER
======================= */

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    if (currentStep >= steps.length) {
      pause();
      return;
    }
    render(steps[currentStep++]);
  }, getDelay());
}

/* =======================
   CONTROLS
======================= */

function play() {
  if (playing) return;
  playing = true;

  if (steps.length === 0) {
    loadSteps();
  }

  startTimer();
}

function pause() {
  playing = false;
  clearInterval(timer);
}

function step() {
  if (currentStep < steps.length) {
    render(steps[currentStep++]);
  }
}

function reset() {
  pause();
  currentStep = 0;
  steps = [];
  clearExplanation();
  render({ array, indices: [] });
}

/* =======================
   LIVE SPEED UPDATE
======================= */

document.getElementById("speedSlider").addEventListener("input", () => {
  if (playing) {
    startTimer();
  }
});

/* =======================
   INIT
======================= */

generateArray();
