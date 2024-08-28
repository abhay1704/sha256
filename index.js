// Hashing functionality
const inputBox = document.getElementById("textInput");
const resultTextBox = document.getElementById("result-text");

function generateHash() {
  const input = inputBox.value;
  const hash = sha256(input);
  resultTextBox.innerText = hash;
}

inputBox.addEventListener("input", generateHash);

document.getElementById("clipboard").addEventListener("click", (e) => {
  navigator.clipboard.writeText(resultTextBox.innerText);

  e.target.closest("div").classList.add("success");

  setTimeout(() => {
    e.target.closest("div").classList.remove("success");
  }, 1000);
});

// Password guessing functionality
document.getElementById("startGuessing").addEventListener("click", () => {
  const hash = document.getElementById("passwordHash").value;
  if (!hash || hash.length !== 64) {
    alert("Please enter a valid password length.");
    return;
  }

  const worker = new Worker("worker.js");
  worker.postMessage({ hash });

  worker.onmessage = function (e) {
    if (e.data.success) {
      document.getElementById(
        "count"
      ).innerText = `Successfully guessed in ${e.data.iterations} iterations. Took ${e.data.timeTaken} seconds.`;
    } else if (e.data.inProgress) {
      document.getElementById(
        "count"
      ).innerText = `Attempted: ${e.data.progress} passwords...`;
    } else {
      document.getElementById("count").innerText =
        "Failed to guess the password. Keep input length less than or equals to 8 characters.";
    }
  };
});
