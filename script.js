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

  // --------------------------------------------------
  // WORD BANK
  // --------------------------------------------------

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
    "problem","money","question","water","room","area","business",
    "story","today","night","friend","children","follow","during",
    "without","under","early","example","together","until","once",
    "possible","better","however","really","anything","nothing",
    "enough","almost","away","left","kind","sure","next","high",
    "old","young","best","public","open","line","end","begin","move",
    "read","write","learn","understand","remember","answer","create",
    "build","try","continue","close","show","tell","call","provide",
    "service","information","program","website","online","computer"
  ];

  // --------------------------------------------------
  // SETTINGS
  // --------------------------------------------------

  let duration = 30;
  let words = [];

  let currentWord = 0;
  let totalTyped = 0;
  let correctTyped = 0;
  let totalErrors = 0;

  let started = false;
  let finished = false;

  let timeLeft = duration;
  let timer = null;

  // The number of words that belong to the
  // current visual line.
  let lineStarts = [];

  // --------------------------------------------------
  // GENERATE WORDS
  // --------------------------------------------------

  function generateWords(amount = 300) {
    const result = [];

    for (let i = 0; i < amount; i++) {
      result.push(
        wordBank[Math.floor(Math.random() * wordBank.length)]
      );
    }

    return result;
  }

  // --------------------------------------------------
  // BUILD PASSAGE
  // --------------------------------------------------

  function buildPassage() {
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

    // Wait until the browser has laid out the text.
    requestAnimationFrame(() => {
      calculateLines();
      updateCurrentWord();
    });
  }

  // --------------------------------------------------
  // CALCULATE VISUAL LINES
  // --------------------------------------------------

  function calculateLines() {
    const wordElements = [...display.querySelectorAll(".word")];

    lineStarts = [];

    let previousTop = null;

    wordElements.forEach((word, index) => {
      const top = Math.round(word.offsetTop);

      if (previousTop === null || top !== previousTop) {
        lineStarts.push(index);
        previousTop = top;
      }
    });
  }

  // --------------------------------------------------
  // CURRENT LINE
  // --------------------------------------------------

  function getCurrentLine() {
    let line = 0;

    for (let i = 0; i < lineStarts.length; i++) {
      if (currentWord >= lineStarts[i]) {
        line = i;
      }
    }

    return line;
  }

  // --------------------------------------------------
  // KEEP CURRENT LINE IN PLACE
  // --------------------------------------------------

  function updateCurrentWord() {
    const wordElements = display.querySelectorAll(".word");

    wordElements.forEach((word, index) => {
      word.classList.remove(
        "current",
        "correct",
        "wrong"
      );

      if (index === currentWord) {
        word.classList.add("current");
      }
    });
  }

  // --------------------------------------------------
  // ROLL TO NEXT LINE
  // --------------------------------------------------

  function rollToLine(lineNumber) {
    const wordElements = display.querySelectorAll(".word");

    if (!wordElements.length) return;

    const targetIndex = lineStarts[lineNumber];

    if (targetIndex === undefined) return;

    const targetWord = wordElements[targetIndex];

    // The amount the passage needs to move upward.
    const amount = targetWord.offsetTop;

    display.style.transition = "transform 280ms ease";
    display.style.transform = `translateY(-${amount}px)`;
  }

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  function handleInput() {
    if (!started || finished) return;

    const typed = input.value;
    const target = words[currentWord];

    if (!target) {
      finishTest();
      return;
    }

    // Prevent typing beyond the word.
    if (typed.length > target.length) {
      input.value = typed.slice(0, target.length);
      return;
    }

    // Count this word's characters.
    totalTyped = 0;
    correctTyped = 0;
    totalErrors = 0;

    // Completed words.
    for (let i = 0; i < currentWord; i++) {
      totalTyped += words[i].length;
      correctTyped += words[i].length;
    }

    // Current word.
    totalTyped += typed.length;

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) {
        correctTyped++;
      } else {
        totalErrors++;
      }
    }

    // Update current word appearance.
    const currentElement =
      display.querySelector(
        `.word[data-index="${currentWord}"]`
      );

    if (currentElement) {
      currentElement.classList.remove("wrong");

      if (
        typed.length > 0 &&
        typed !== target.substring(0, typed.length)
      ) {
        currentElement.classList.add("wrong");
      }
    }

    // ------------------------------------------------
    // WORD FINISHED
    // ------------------------------------------------

    if (typed === target) {
      currentElement?.classList.remove("current");
      currentElement?.classList.add("correct");

      currentWord++;

      input.value = "";

      // Determine whether we moved onto a new line.
      const oldLine = getCurrentLine();

      requestAnimationFrame(() => {
        const newLine = getCurrentLine();

        if (newLine > oldLine) {
          rollToLine(newLine);
        }

        updateCurrentWord();
      });

      if (currentWord >= words.length - 1) {
        finishTest();
        return;
      }
    }

    updateStats();
  }

  // --------------------------------------------------
  // SPACE KEY
  // --------------------------------------------------

  function handleKeydown(event) {
    if (!started || finished) return;

    if (event.key === " ") {
      event.preventDefault();

      const typed = input.value;
      const target = words[currentWord];

      // Only advance when the word is completely correct.
      if (typed === target) {
        input.value = "";

        const currentElement =
          display.querySelector(
            `.word[data-index="${currentWord}"]`
          );

        currentElement?.classList.remove("current");
        currentElement?.classList.add("correct");

        const oldLine = getCurrentLine();

        currentWord++;

        requestAnimationFrame(() => {
          const newLine = getCurrentLine();

          if (newLine > oldLine) {
            rollToLine(newLine);
          }

          updateCurrentWord();
        });
      }
    }
  }

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  function updateStats() {
    const elapsed = Math.max(
      1,
      duration - timeLeft
    );

    const minutes = elapsed / 60;

    const wpm =
      minutes > 0
        ? Math.round((correctTyped / 5) / minutes)
        : 0;

    const accuracy =
      totalTyped > 0
        ? Math.round(
            (correctTyped / totalTyped) * 100
          )
        : 100;

    wpmEl.textContent = wpm;
    accuracyEl.textContent = accuracy + "%";
    errorsEl.textContent = totalErrors;
    timeEl.textContent = timeLeft;
  }

  // --------------------------------------------------
  // START
  // --------------------------------------------------

  function startTest() {
    clearInterval(timer);

    duration = parseInt(
      document.querySelector(".dur button.active")?.dataset.time || "30",
      10
    );

    words = generateWords(300);

    currentWord = 0;
    totalTyped = 0;
    correctTyped = 0;
    totalErrors = 0;

    timeLeft = duration;

    started = true;
    finished = false;

    display.style.transition = "none";
    display.style.transform = "translateY(0)";

    buildPassage();

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

  // --------------------------------------------------
  // FINISH
  // --------------------------------------------------

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
    fchars.textContent = totalTyped;
    fdur.textContent = duration + "s";

    results.classList.remove("hidden");
  }

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  function resetTest() {
    clearInterval(timer);

    started = false;
    finished = false;

    currentWord = 0;
    totalTyped = 0;
    correctTyped = 0;
    totalErrors = 0;

    timeLeft = duration;

    input.value = "";
    input.disabled = true;

    display.style.transition = "none";
    display.style.transform = "translateY(0)";

    words = generateWords(300);
    buildPassage();

    results.classList.add("hidden");

    updateStats();
  }

  // --------------------------------------------------
  // DURATION BUTTONS
  // --------------------------------------------------

  timeButtons.forEach(button => {
    button.addEventListener("click", () => {
      timeButtons.forEach(b =>
        b.classList.remove("active")
      );

      button.classList.add("active");

      if (!started) {
        duration = parseInt(button.dataset.time, 10);
        timeLeft = duration;
        updateStats();
      }
    });
  });

  // --------------------------------------------------
  // MODE BUTTONS
  // --------------------------------------------------

  modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      modeButtons.forEach(b =>
        b.classList.remove("active")
      );

      button.classList.add("active");
    });
  });

  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------

  input.addEventListener("input", handleInput);
  input.addEventListener("keydown", handleKeydown);

  restartBtn.addEventListener("click", resetTest);

  againBtn.addEventListener("click", () => {
    results.classList.add("hidden");
    startTest();
  });

  // --------------------------------------------------
  // INITIAL STATE
  // --------------------------------------------------

  duration = 30;
  timeLeft = 30;

  words = generateWords(300);

  input.disabled = true;

  buildPassage();
  updateStats();
});

 
 
 
 
 
