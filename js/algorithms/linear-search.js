function linearSearchSteps(arr, target) {
  let steps = [];

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      array: [...arr],
      indices: [i],
      explanation: `Checking index ${i} (value = ${arr[i]})`
    });

    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        foundIndex: i,
        explanation: `✅ Found ${target} at index ${i}`
      });
      return steps;
    }
  }

  steps.push({
    array: [...arr],
    notFound: true,
    explanation: `❌ ${target} not found in array`
  });

  return steps;
}
