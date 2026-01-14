function selectionSortSteps(arr) {
  let steps = [];
  let a = [...arr];

  for (let i = 0; i < a.length; i++) {
    let min = i;

    for (let j = i + 1; j < a.length; j++) {
      steps.push({
        array: [...a],
        indices: [min, j],
        explanation: `Compare ${a[min]} and ${a[j]}`
      });
      if (a[j] < a[min]) min = j;
    }

    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      steps.push({
        array: [...a],
        indices: [i, min],
        explanation: `Swap minimum`
      });
    }
  }
  return steps;
}
