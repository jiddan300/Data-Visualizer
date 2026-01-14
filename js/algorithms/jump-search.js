function jumpSearchSteps(arr, target) {
  let steps = [];
  let a = [...arr].sort((x, y) => x - y);
  const n = a.length;
  const stepSize = Math.floor(Math.sqrt(n));

  steps.push({
    array: [...a],
    explanation: `Array sorted for Jump Search (step size = ${stepSize})`
  });

  let prev = 0;
  let curr = stepSize;

  // Jump phase
  while (curr < n && a[curr - 1] < target) {
    steps.push({
      array: [...a],
      indices: [curr - 1],
      explanation: `Jump to index ${curr - 1} (value = ${a[curr - 1]})`
    });

    prev = curr;
    curr += stepSize;
  }

  steps.push({
    array: [...a],
    explanation: `Target must be between index ${prev} and ${Math.min(curr - 1, n - 1)}`
  });

  // Linear search in block
  for (let i = prev; i < Math.min(curr, n); i++) {
    steps.push({
      array: [...a],
      indices: [i],
      explanation: `Linear check at index ${i} (value = ${a[i]})`
    });

    if (a[i] === target) {
      steps.push({
        array: [...a],
        foundIndex: i,
        explanation: `✅ Found ${target} at index ${i}`
      });
      return steps;
    }
  }

  steps.push({
    array: [...a],
    notFound: true,
    explanation: `❌ ${target} not found in array`
  });

  return steps;
}
