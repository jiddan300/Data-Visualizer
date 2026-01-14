function insertionSortSteps(arr) {
  let steps = [];
  let a = [...arr];

  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;

    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({
        array: [...a],
        indices: [j, j + 1],
        explanation: `Shift ${a[j]} right`
      });
      j--;
    }

    a[j + 1] = key;
    steps.push({
      array: [...a],
      indices: [j + 1],
      explanation: `Insert ${key}`
    });
  }
  return steps;
}
