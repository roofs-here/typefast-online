```javascript
document.addEventListener("DOMContentLoaded", function () {

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


  // -----------------------------
  // GENERATE WORDS
  // -----------------------------

  function generateWords(count) {

    const list = [];

    for (let i = 0; i < count; i++) {

      const random =
        Math.floor(Math.random() * wordBank.length);

      list.push(wordBank[random]);
    }

    return list;
  }


  // -----------------------------
  // DISPLAY WORDS
  // -----------------------------

  function renderWords() {

    display.innerHTML = "";

    words.forEach(function (word, index) {

      const span = document.createElement("span");

      span.className = "word";
      span.dataset.index = index;
      span.textContent = word;

      display.appendChild(span);

      if (index < words.length - 1) {
        display.appendChild(
          document.createTextNode(" ")
        );
      }

    });

    updateCurrentWord();
  }


  // -----------------------------
  // CURRENT WORD
  // -----------------------------

  function updateCurrentWord() {

    const wordElements =
      display.querySelectorAll(".word");

    wordElements.forEach(function (word, index) {

      word.classList.remove("current");

      if (index === currentWord) {
        word.classList.add("current");
      }

    });
  }


  // -----------------------------
  // STATS
  // -----------------------------

  function updateStats() {

    const elapsed =
      Math.max(1, duration - timeLeft);

    const minutes = elapsed / 60;

    const wpm =
      Math.round(
        (correctCharacters / 5) / minutes
      );

    let accuracy = 100;

    if (typedCharacters > 0) {

      accuracy =
        Math.round(
          (correctCharacters /
            typedCharacters) * 100
        );

    }

    timeEl.textContent = timeLeft;

    wpmEl.textContent =
      Math.max(0, wpm);

    accuracyEl.textContent =
      accuracy + "%";

    errorsEl.textContent =
      errorCount;
  }


  // -----------------------------
  // START TEST
  // -----------------------------

  function startTest() {

    clearInterval(timer);

    const active =
      document.querySelector(
        ".dur button.active"
      );

    if (active) {

      duration =
        parseInt(
          active.dataset.time,
          10
        );

    }

    timeLeft = duration;

    words =
      generateWords(300);

    currentWord = 0;

    typedCharacters = 0;
    correctCharacters = 0;
    errorCount = 0;

    started = true;
    finished = false;

    display.style.transform =
      "translateY(0)";

    display.style.transition =
      "none";

    renderWords();

    input.disabled = false;

    input.value = "";

    results.classList.add("hidden");

    updateStats();

    input.focus();


    timer = setInterval(function () {

      timeLeft--;

      updateStats();

      if (timeLeft <= 0) {

        finishTest();

      }

    }, 1000);

  }


  // -----------------------------
  // TYPING
  // -----------------------------

  function handleTyping() {

    if (!started || finished) {
      return;
    }

    const typed =
      input.value;

    const target =
      words[currentWord];


    // Count completed words

    typedCharacters = 0;
    correctCharacters = 0;
    errorCount = 0;


    for (
      let i = 0;
      i < currentWord;
      i++
    ) {

      typedCharacters +=
        words[i].length;

      correctCharacters +=
        words[i].length;

    }


    // Current word

    typedCharacters +=
      typed.length;


    for (
      let i = 0;
      i < typed.length;
      i++
    ) {

      if (
        typed[i] === target[i]
      ) {

        correctCharacters++;

      } else {

        errorCount++;

      }

    }


    // Current word display

    const current =
      display.querySelector(
        '.word[data-index="' +
        currentWord +
        '"]'
      );


    if (current) {

      current.classList.remove(
        "wrong"
      );

      if (
        typed.length > 0 &&
        typed !==
          target.substring(
            0,
            typed.length
          )
      ) {

        current.classList.add(
          "wrong"
        );

      }

    }


    // Word completed

    if (typed === target) {

      if (current) {

        current.classList.remove(
          "current"
        );

        current.classList.remove(
          "wrong"
        );

        current.classList.add(
          "correct"
        );

      }

      currentWord++;

      input.value = "";

      updateCurrentWord();


      if (
        currentWord >= words.length
      ) {

        finishTest();

      }

    }


    updateStats();

  }


  // -----------------------------
  // FINISH
  // -----------------------------

  function finishTest() {

    if (finished) {
      return;
    }

    finished = true;
    started = false;

    clearInterval(timer);

    input.disabled = true;

    updateStats();

    fwpm.textContent =
      wpmEl.textContent;

    facc.textContent =
      accuracyEl.textContent;

    ferr.textContent =
      errorsEl.textContent;

    fchars.textContent =
      typedCharacters;

    fdur.textContent =
      duration + "s";

    results.classList.remove(
      "hidden"
    );

  }


  // -----------------------------
  // RESET
  // -----------------------------

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

    input.disabled = false;

    display.style.transform =
      "translateY(0)";

    display.style.transition =
      "none";

    words =
      generateWords(300);

    renderWords();

    results.classList.add(
      "hidden"
    );

    updateStats();

  }


  // -----------------------------
  // TIME BUTTONS
  // -----------------------------

  timeButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          timeButtons.forEach(
            function (item) {
              item.classList.remove(
                "active"
              );
            }
          );

          button.classList.add(
            "active"
          );


          if (!started) {

            duration =
              parseInt(
                button.dataset.time,
                10
              );

            timeLeft =
              duration;

            updateStats();

          }

        }
      );

    }
  );


  // -----------------------------
  // WORDS / NUMBERS BUTTONS
  // -----------------------------

  modeButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          modeButtons.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );

          button.classList.add(
            "active"
          );

        }
      );

    }
  );


  // -----------------------------
  // START WHEN TEXT BOX IS CLICKED
  // -----------------------------

  input.addEventListener(
    "focus",
    function () {

      if (!started && !finished) {
        startTest();
      }

    }
  );


  // -----------------------------
  // TYPING EVENT
  // -----------------------------

  input.addEventListener(
    "input",
    handleTyping
  );


  // -----------------------------
  // RESTART
  // -----------------------------

  restartBtn.addEventListener(
    "click",
    resetTest
  );


  // -----------------------------
  // TRY AGAIN
  // -----------------------------

  againBtn.addEventListener(
    "click",
    startTest
  );


  // -----------------------------
  // INITIAL PAGE
  // -----------------------------

  words =
    generateWords(300);

  input.disabled = false;

  renderWords();

  updateStats();

});
```
