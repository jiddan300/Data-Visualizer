const container = document.getElementById('container');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const generateBtn = document.getElementById('generateBtn');
const userInput = document.getElementById('userInput');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const dataModeRadios = document.querySelectorAll('input[name="dataMode"]');
const algorithmSelect = document.getElementById('algorithmSelect');

let data = [], originalData = [], bars = [];
let delay = 500; // base speed 500ms
let sorting = false, stopRequested = false;

speedRange.value = delay;
speedValue.textContent = `${delay} ms`;

startBtn.disabled = true;
resetBtn.disabled = true;

// --- Controls ---
dataModeRadios.forEach(radio => {
  radio.addEventListener('change', () => userInput.disabled = radio.value !== 'manual');
});

speedRange.addEventListener('input', () => {
  delay = parseInt(speedRange.value);
  speedValue.textContent = `${delay} ms`;
});

generateBtn.addEventListener('click', () => {
  if (sorting) return;
  const mode = document.querySelector('input[name="dataMode"]:checked').value;
  if (mode === 'manual') {
    const inputValues = userInput.value.trim().split(/\s+/).map(Number);
    if (inputValues.length === 0 || inputValues.some(isNaN)) {
      alert('Enter valid numbers separated by spaces.');
      return;
    }
    data = inputValues;
  } else {
    data = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 5);
  }
  originalData = data.slice();
  createBars();
  startBtn.disabled = false;
  resetBtn.disabled = false;
  startBtn.textContent = 'Start Sorting';
});

// --- Create Bars ---
function createBars() {
  container.innerHTML = '';
  data.forEach(value => {
    const wrapper = document.createElement('div');
    wrapper.className = 'bar-wrapper';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${value * 3}px`;

    const label = document.createElement('div');
    label.className = 'value-label';
    label.textContent = value;

    wrapper.append(bar, label);
    container.appendChild(wrapper);
  });
  bars = document.querySelectorAll('.bar');
}

// --- Utilities ---
function swap(i, j) {
  [data[i], data[j]] = [data[j], data[i]];
  bars[i].style.height = `${data[i] * 3}px`;
  bars[j].style.height = `${data[j] * 3}px`;
  bars[i].nextSibling.textContent = data[i];
  bars[j].nextSibling.textContent = data[j];
}

function waitDelay() { return new Promise(r => setTimeout(r, delay)); }
function checkStop() { if (stopRequested) throw 'stop'; }

// ================= Sorting Algorithms =================
async function bubbleSort() {
  let n = data.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      checkStop();
      bars[j].classList.add('highlight');
      bars[j+1].classList.add('highlight');
      await waitDelay();
      if (data[j] > data[j+1]) swap(j, j+1);
      bars[j].classList.remove('highlight');
      bars[j+1].classList.remove('highlight');
    }
    bars[n-i-1].classList.add('sorted');
  }
  bars[0].classList.add('sorted');
}

async function selectionSort() {
  let n = data.length;
  for (let i = 0; i < n-1; i++) {
    checkStop();
    let minIndex = i;
    bars[i].classList.add('highlight');
    for (let j = i+1; j < n; j++) {
      checkStop();
      bars[j].classList.add('highlight');
      bars[minIndex].classList.add('smallest');
      await waitDelay();
      if (data[j] < data[minIndex]) {
        bars[minIndex].classList.remove('smallest');
        minIndex = j;
        bars[minIndex].classList.add('smallest');
      }
      bars[j].classList.remove('highlight');
    }
    if (minIndex !== i) swap(i, minIndex);
    bars[i].classList.remove('highlight');
    bars[minIndex].classList.remove('smallest');
    bars[i].classList.add('sorted');
  }
  bars[n-1].classList.add('sorted');
}

async function insertionSort() {
  let n = data.length;
  bars[0].classList.add('sorted');
  for (let i = 1; i < n; i++) {
    checkStop();
    let key = data[i];
    let j = i-1;
    bars[i].classList.add('key'); await waitDelay();
    while (j >=0 && data[j] > key) {
      checkStop();
      data[j+1] = data[j];
      bars[j+1].style.height = `${data[j+1]*3}px`;
      bars[j+1].nextSibling.textContent = data[j+1];
      bars[j].classList.add('highlight'); await waitDelay(); bars[j].classList.remove('highlight');
      j--;
    }
    data[j+1] = key;
    bars[j+1].style.height = `${key*3}px`;
    bars[j+1].nextSibling.textContent = key;
    bars[i].classList.remove('key');
    for (let k=0;k<=i;k++) bars[k].classList.add('sorted'); 
    await waitDelay();
  }
}

async function mergeSort(start=0,end=data.length-1){
  checkStop();
  if(start>=end) return;
  const mid=Math.floor((start+end)/2);
  await mergeSort(start,mid);
  await mergeSort(mid+1,end);
  await merge(start,mid,end);
}

async function merge(start,mid,end){
  checkStop();
  let left=data.slice(start,mid+1), right=data.slice(mid+1,end+1);
  let i=0,j=0,k=start;
  while(i<left.length && j<right.length){
    checkStop();
    bars[k].classList.add('merge'); await waitDelay();
    if(left[i]<=right[j]) data[k]=left[i++]; else data[k]=right[j++];
    bars[k].style.height=`${data[k]*3}px`;
    bars[k].nextSibling.textContent=data[k];
    bars[k].classList.remove('merge'); k++;
  }
  while(i<left.length){ checkStop(); bars[k].classList.add('merge'); data[k]=left[i++]; bars[k].style.height=`${data[k]*3}px`; bars[k].nextSibling.textContent=data[k]; await waitDelay(); bars[k].classList.remove('merge'); k++; }
  while(j<right.length){ checkStop(); bars[k].classList.add('merge'); data[k]=right[j++]; bars[k].style.height=`${data[k]*3}px`; bars[k].nextSibling.textContent=data[k]; await waitDelay(); bars[k].classList.remove('merge'); k++; }
  for(let m=start;m<=end;m++) bars[m].classList.add('sorted');
}

async function quickSort(start = 0, end = data.length - 1) {
  checkStop();
  if (start >= end) return;

  let pivotIndex = await partition(start, end);

  // Mark pivot position as sorted after partitioning
  bars[pivotIndex].classList.remove('quick');
  bars[pivotIndex].classList.add('sorted');

  await quickSort(start, pivotIndex - 1);
  await quickSort(pivotIndex + 1, end);

  // When fully sorted (top call only), ensure all bars are green
  if (start === 0 && end === data.length - 1) {
    bars.forEach(bar => bar.classList.add('sorted'));
  }
}

async function partition(start, end) {
  checkStop();
  let pivot = data[end];
  bars[end].classList.add('quick');
  let i = start - 1;

  for (let j = start; j < end; j++) {
    checkStop();
    bars[j].classList.add('highlight');
    await waitDelay();

    if (data[j] < pivot) {
      i++;
      swap(i, j);
    }

    bars[j].classList.remove('highlight');
  }

  swap(i + 1, end);
  await waitDelay();

  bars[end].classList.remove('quick');
  return i + 1;
}


// ================= Controls =================
startBtn.addEventListener('click', async ()=>{
  if(data.length===0){ alert('Generate data first!'); return; }
  originalData=data.slice();
  sorting=true; stopRequested=false;
  startBtn.disabled=true; generateBtn.disabled=true; resetBtn.disabled=false;
  startBtn.textContent='Sorting...';
  const algo=algorithmSelect.value;
  try{
    if(algo==='bubble') await bubbleSort();
    else if(algo==='selection') await selectionSort();
    else if(algo==='insertion') await insertionSort();
    else if(algo==='merge') await mergeSort();
    else if(algo==='quick') await quickSort();
  }catch(e){ if(e!=='stop') throw e; }
  sorting=false; generateBtn.disabled=false; startBtn.textContent='Start Sorting';
});

resetBtn.addEventListener('click', ()=>{
  stopRequested=true;
  data=originalData.slice();
  bars.forEach((bar,idx)=>{
    bar.style.height=`${data[idx]*3}px`;
    bar.nextSibling.textContent=data[idx];
    bar.className='bar';
  });
  startBtn.disabled=false; generateBtn.disabled=false;
  startBtn.textContent='Start Sorting';
  sorting=false;
});
