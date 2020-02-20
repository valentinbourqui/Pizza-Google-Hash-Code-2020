var fs = require("fs");
var readline = require("readline");

// Files Name
/*
const fileNames = [
  "a_example",
  "b_small",
  "c_medium",
  "d_quite_big",
  "e_also_big"
];
**/

const MAX_DEEP = 5;

const fileNames = [
  "a_example",
  "b_small",
  "c_medium",
  "d_quite_big",
  "e_also_big"
];

// Reading file one by one
fileNames.forEach(filename => {
  var lineReader = readline.createInterface({
    input: fs.createReadStream(`./Input/${filename}.in`)
  });

  let data = [];

  lineReader.on("line", function(line) {
    data.push(line.split(" "));
  });

  lineReader.on("close", function() {
    let max, n, inputs;
    [max, n] = data[0];
    inputs = data[1];
    solve(max, n, inputs, filename);
  });
});

// max: maximum slices
// n: types of pizza
// inputs: array (the number of slices in each type of pizza)
const solve = (max, n, inputs, filename) => {
  let index;
  let solve = [];
  let sumList = [];
  let total = 0;

  // Create a list with the sum of all values
  sumList[0] = Number(inputs[0]);
  for (let i = 1; i < n - 1; i++) {
    sumList[i] = sumList[i - 1] + Number(inputs[i]);
  }

  for (let i = n - 1; i >= 0; i--) {
    index = i;

    // Check if we have the max or if the rest of the sum list is smaller than the best result
    if (sumList[i] < total || total == max) {
      break;
    }

    // Traverse the current Pizza array in reverse order
    const results = solveRecursive(index, inputs, max, total, 0, [], 0);
    if (total < results.total) {
      total = results.total;
      solve = results.solve;
    }
  }

  console.log("Max Score: ", total);
  console.log("No. of Pizzas: ", solve.length);

  const path = `./Output/${filename}.out`;
  //    console.log(solve.join(" "));
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }

  fs.open(path, "a", (err, fd) => {
    if (err) throw err;
    fs.appendFile(fd, solve.length + "\n" + solve.join(" "), function(err) {
      if (err) return console.log(err);
      fs.close(fd, err => {
        if (err) throw err;
      });
    });
  });
};

const solveRecursive = (index, inputs, max, total, sum, tempsolve, deep) => {
  let solve = [];
  for (let j = index; j >= 0; j--) {
    let value = Number(inputs[j]);

    let tempsum = sum + value;

    if (tempsum == max) {
      sum = tempsum;
      tempsolve.unshift(j);
      break;
    } else if (tempsum > max) {
      if (j === 0 || deep > MAX_DEEP) {
        continue;
      }
      // If the tempsum is higher than the max with the last value we delete the last value inside tempsolveTmp and we continue to resolve this specifique part
      const tempsolveTmp = JSON.parse(JSON.stringify(tempsolve));
      const jOld = tempsolveTmp.shift();
      const sumOld = tempsum - value - Number(inputs[jOld]);
      const result = solveRecursive(
        j,
        inputs,
        max,
        total,
        sumOld,
        tempsolveTmp,
        deep + 1
      );
      // Update total if the result is better
      if (total < result.total) {
        total = result.total;
        solve = result.solve;
      }
      if (result.total == max) {
        break;
      }
      continue;
    } else if (tempsum < max) {
      sum = tempsum;
      tempsolve.unshift(j);
      continue;
    }
  }
  // Update total if the result is better
  if (total < sum) {
    total = sum;
    solve = tempsolve;
  }

  return { total, solve };
};
