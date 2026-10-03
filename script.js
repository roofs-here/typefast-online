document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const input = document.getElementById("input");

  const timeEl = document.getElementById("time");
  const wpmEl = document.getElementById("wpm");
  const accuracyEl = document.getElementById("accuracy");
  const errorsEl = document.getElementById("errors");

  const restartBtn = document.getElementById("restart");
  const againBtn = document.getElementById("again");

  const timeButtons = document.querySelectorAll(".dur button");
  const modeButtons = document.querySelectorAll(".tabs button");

  const results = document.getElementById("results");
  const fwpm = document.getElementById("fwpm");
  const facc = document.getElementById("facc");
  const ferr = document.getElementById("ferr");
  const fchars = document.getElementById("fchars");
  const fdur = document.getElementById("fdur");

  const wordBank = [
    "the","and","you","that","was","for","are","with","this","have",
    "from","they","will","would","there","their","what","about","which",
    "when","make","can","like","time","just","know","take","people",
    "into","year","your","good","some","could","them","see","other",
    "than","then","now","look","only","come","its","over","think",
    "also","back","after","use","two","how","our","work","first",
    "well","way","even","new","want","because","these","give","day",
    "most","us","find","here","thing","many","more","very","where",
    "much","before","right","through","too","same","around","still",
    "while","last","never","another","place","life","little","world",
    "great","home","small","every","found","those","long","help",
    "keep","start","hand","part","turn","need","important","different",
    "change","system","between","point","again","something","always",
    "house","school","family","country","company","number","group",
    "problem","money","room","area","business","story","today","night",
    "friend","children","follow","during","without","under","early",
    "example","together","until","once","possible","better","however",
    "really","anything","nothing","enough","almost","away","left",
    "kind","sure","next","high","old","young","best","public","open",
    "line","end","begin","move","read","write","learn","understand",
    "remember","answer","create","build","try","continue","close",
    "show","tell","call","provide","service","information","program",
    "website","online","computer"
  ];

  let words = [];
  let currentWord = 0;

  let duration = 30;
  let timeLeft = 30;

  let started = false;
  let finished = false;
  let timer = null;

  let typedCharacters = 0;
  let correctCharacters = 0;
  let errorCount = 0;

  function makeWords(count = 300) {
    const result = [];

    for (let i = 0; i < count; i++) {
      result.push(
        wordBank[Math.floor(Math.random() * wordBank.length)]
      );
    }

    return result;
  }

  function renderWords() {
    display.innerHTML = "";

    words.forEach((word, index) => {
      const span = document.createElement("span");

      span.className = "word";
      span.dataset.index = index;
      span.textContent = word;

      display.appendChild(span);

      if (index < words.length - 1) {
        display.appendChild(document.createTextNode(" "));
      }
    });

    markCurrentWord();
  }

  function markCurrentWord() {
    display
      .querySelectorAll(".word")
      .forEach((word, index) => {
        word.classList.remove("current");

        if (index === currentWord) {
          word.classList.add("current");
        }
      });
  }

  function updateStats() {
    const elapsed = Math.max(1, duration - timeLeft);
    const minutes = elapsed / 60;

    const wpm = Math.round(
      (correctCharacters / 5) / minutes
    );

    const accuracy =
      typedCharacters === 0
        ? 100
        : Math.round(
            (correctCharacters / typedCharacters) * 100
          );

    timeEl.textContent = timeLeft;
    wpmEl.textContent = Math.max(0, wpm);
    accuracyEl.textContent = accuracy + "%";
    errorsEl.textContent = errorCount;
  }

  function startTest() {
    clearInterval(timer);

    duration = parseInt(
      document.querySelector(".dur button.active")?.dataset.time || "30",
      10
    );

    timeLeft = duration;

    words = makeWords();

    currentWord = 0;
    typedCharacters = 0;
    correctCharacters = 0;
    errorCount = 0;

    started = true;
    finished = false;

    display.style.transform = "translateY(0)";
    display.style.transition = "none";

    renderWords();

    input.disabled = false;
    input.value = "";
    input.focus();

    results.classList.add("hidden");

    updateStats();

    timer = setInterval(() => {
      timeLeft--;

      updateStats();

      if (timeLeft <= 0) {
        finishTest();
      }
    }, 1000);
  }

  function finishTest() {
    if (finished) return;

    finished = true;
    started = false;

    clearInterval(timer);

    input.disabled = true;

    updateStats();

    fwpm.textContent = wpmEl.textContent;
    facc.textContent = accuracyEl.textContent;
    ferr.textContent = errorsEl.textContent;
    fchars.textContent = typedCharacters;
    fdur.textContent = duration + "s";

    results.classList.remove("hidden");
  }

  function handleInput() {
    if (!started || finished) return;

    const typed = input.value;
    const target = words[currentWord];

    typedCharacters = 0;
    correctCharacters = 0;
    errorCount = 0;

    for (let i = 0; i < currentWord; i++) {
      typedCharacters += words[i].length;
      correctCharacters += words[i].length;
    }

    typedCharacters += typed.length;

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) {
        correctCharacters++;
      } else {
        errorCount++;
      }
    }

    const current = display.querySelector(
      `.word[data-index="${currentWord}"]`
    );

    if (current) {
      current.classList.remove("wrong");

      if (
        typed.length > 0 &&
        typed !== target.substring(0, typed.length)
      ) {
        current.classList.add("wrong");
      }
    }

    if (typed === target) {
      if (current) {
        current.classList.remove("current");
        current.classList.add("correct");
      }

      currentWord++;

      input.value = "";

      markCurrentWord();

      if (currentWord >= words.length) {
        finishTest();
      }
    }

    updateStats();
  }

  function resetTest() {
    clearInterval(timer);

    started = false;
    finished = false;

    currentWord = 0;
    typedCharacters = 0;
    correctCharacters = 0;
    errorCount = 0;

    timeLeft = duration;

    input.value = "";
    input.disabled = true;

    display.style.transform = "translateY(0)";
    display.style.transition = "none";

    words = makeWords();

    renderWords();

    results.classList.add("hidden");

    updateStats();
  }

  timeButtons.forEach(button => {
    button.addEventListener("click", () => {
      timeButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      if (!started) {
        duration = parseInt(button.dataset.time, 10);
        timeLeft = duration;
        updateStats();
      }
    });
  });

  modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      modeButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
    });
  });

  input.addEventListener("input", handleInput);

  restartBtn.addEventListener("click", resetTest);

  againBtn.addEventListener("click", startTest);

  // Initial page
  words = makeWords();
  input.disabled = true;

  renderWords();
  updateStats();
});
