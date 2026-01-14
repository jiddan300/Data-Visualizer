function bubbleSortSteps(arr) {
  let steps = [];
  let a = [...arr];

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({
        array: [...a],
        indices: [j, j + 1],
        explanation: `Compare ${a[j]} and ${a[j + 1]}`
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          indices: [j, j + 1],
          explanation: `Swap elements`
        });
      }
    }
  }
  return steps;
}
