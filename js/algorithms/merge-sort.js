function mergeSortSteps(arr) {
  let steps = [];
  let a = [...arr];

  function mergeSort(l, r) {
    if (r - l <= 1) return;
    let m = Math.floor((l + r) / 2);
    mergeSort(l, m);
    mergeSort(m, r);
    merge(l, m, r);
  }

  function merge(l, m, r) {
    let left = a.slice(l, m);
    let right = a.slice(m, r);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
      a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
      steps.push({ array: [...a], indices: [k - 1], explanation: "Merge" });
    }

    while (i < left.length) {
      a[k++] = left[i++];
      steps.push({ array: [...a], indices: [k - 1], explanation: "Copy left" });
    }

    while (j < right.length) {
      a[k++] = right[j++];
      steps.push({ array: [...a], indices: [k - 1], explanation: "Copy right" });
    }
  }

  mergeSort(0, a.length);
  return steps;
}
