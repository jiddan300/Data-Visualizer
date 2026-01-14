function binarySearchSteps(arr, target) {
  let steps = [];
  let a = [...arr].sort((x, y) => x - y);

  steps.push({
    array: [...a],
    explanation: `Array sorted for Binary Search`
  });

  let low = 0;
  let high = a.length - 1;

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);

    steps.push({
      array: [...a],
      low,
      mid,
      high,
      explanation: `low=${low}, mid=${mid}, high=${high}`
    });

    if (a[mid] === target) {
      steps.push({
        array: [...a],
        foundIndex: mid,
        explanation: `✅ Found ${target} at index ${mid}`
      });
      return steps;
    }

    if (a[mid] < target) {
      steps.push({
        array: [...a],
        explanation: `${a[mid]} < ${target}, searching right half`
      });
      low = mid + 1;
    } else {
      steps.push({
        array: [...a],
        explanation: `${a[mid]} > ${target}, searching left half`
      });
      high = mid - 1;
    }
  }

  steps.push({
    array: [...a],
    notFound: true,
    explanation: `❌ ${target} not found in array`
  });

  return steps;
}
