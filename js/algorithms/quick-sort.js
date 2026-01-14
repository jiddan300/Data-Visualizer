function quickSortSteps(arr) {
  let steps = [];
  let a = [...arr];

  function quickSort(low, high) {
    if (low < high) {
      let pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  function partition(low, high) {
    let pivot = a[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        array: [...a],
        indices: [j, high],
        explanation: `Compare with pivot ${pivot}`
      });

      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({
          array: [...a],
          indices: [i, j],
          explanation: "Swap"
        });
      }
    }

    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push({
      array: [...a],
      indices: [i + 1],
      explanation: "Place pivot"
    });

    return i + 1;
  }

  quickSort(0, a.length - 1);
  return steps;
}
