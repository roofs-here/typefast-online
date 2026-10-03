```javascript
document.addEventListener("DOMContentLoaded", () => {
  const textDisplay = document.getElementById("text-display");
  const input = document.getElementById("typing-input");
  const timeSelect = document.getElementById("time-select");
  const startButton = document.getElementById("start-btn");
  const resetButton = document.getElementById("reset-btn");
  const timeDisplay = document.getElementById("timer");
  const wpmDisplay = document.getElementById("wpm");
  const accuracyDisplay = document.getElementById("accuracy");

  // --------------------------------------------------
  // WORD BANK
  // --------------------------------------------------

  const words = [
    "the", "and", "you", "that", "was", "for", "are", "with", "this",
    "have", "from", "they", "will", "would", "there", "their", "what",
    "about", "which", "when", "make", "can", "like", "time", "just",
    "know", "take", "people", "into", "year", "your", "good", "some",
    "could", "them", "see", "other", "than", "then", "now", "look",
    "only", "come", "its", "over", "think", "also", "back", "after",
    "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "these", "give", "day", "most",
    "us", "find", "here", "thing", "many", "more", "very", "where",
    "much", "before", "right", "through", "too", "same", "around",
    "still", "while", "last", "never", "another", "place", "life",
    "little", "world", "great", "home", "small", "every", "found",
    "those", "long", "help", "keep", "start", "hand", "part", "turn",
    "need", "important", "different", "change", "system", "between",
    "point", "again", "something", "always", "house", "school",
    "family", "country", "company", "number", "group", "problem",
    "money", "question", "water", "room", "area", "business", "story",
    "today", "night", "friend", "children", "follow", "during",
    "without", "under", "another", "early", "example", "together",
    "until", "once", "possible", "better", "however", "really",
    "anything", "nothing", "enough", "almost", "away", "left",
    "kind", "different", "sure", "next", "high", "old", "young",
    "important", "few", "large", "best", "public", "open", "line",
    "end", "begin", "move", "read", "write", "learn", "understand",
    "remember", "answer", "question", "create", "build", "try",
    "continue", "close", "follow", "show", "tell", "call", "provide",
    "service", "information", "program", "website", "online", "computer"
  ];

  // --------------------------------------------------
  // SETTINGS
  // --------------------------------------------------

  let testDuration = parseInt(timeSelect?.value || "60", 10);

  let testWords = [];
  let currentWordIndex = 0;
  let typedCharacters = 0;
  let correctCharacters = 0;
  let errors = 0;

  let testStarted = false;
  let testFinished = false;
  let timeRemaining = testDuration;
  let timerInterval = null;

  // Current line information
  let currentLine = [];
  let currentLineIndex = 0;
  let previousLineTop = null;

  // --------------------------------------------------
  // CREATE WORDS
  // --------------------------------------------------

  function generateWords(count = 250) {
    const result = [];

    for (let i = 0; i < count; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }

    return result;
  }

  // --------------------------------------------------
  // RENDER TEXT
  // --------------------------------------------------

  function renderText() {
    textDisplay.innerHTML = "";

    const fragment = document.createDocumentFragment();

    testWords.forEach((word, index) => {
      const span = document.createElement("span");

      span.className = "typing-word";
      span.dataset.index = index;
      span.textContent = word;

      fragment.appendChild(span);

      if (index < testWords.length - 1) {
        fragment.appendChild(document.createTextNode(" "));
      }
    });

    textDisplay.appendChild(fragment);

    currentLine = [];
    currentLineIndex = 0;

    requestAnimationFrame(updateCurrentLine);
  }

  // --------------------------------------------------
  // FIND CURRENT LINE
  // --------------------------------------------------

  function getLineWords() {
    const wordElements = [...textDisplay.querySelectorAll(".typing-word")];

    if (!wordElements.length) {
      return [];
    }

    const lines = [];
    let currentTop = null;
    let line = [];

    wordElements.forEach((element) => {
      const top = Math.round(element.getBoundingClientRect().top);

      if (currentTop === null) {
        currentTop = top;
        line = [element];
        return;
      }

      if (Math.abs(top - currentTop) <= 3) {
        line.push(element);
      } else {
        lines.push(line);
        line = [element];
        currentTop = top;
      }
    });

    if (line.length) {
      lines.push(line);
    }

    return lines;
  }

  // --------------------------------------------------
  // UPDATE CURRENT LINE
  // --------------------------------------------------

  function updateCurrentLine() {
    const lines = getLineWords();

    if (!lines.length) return;

    let activeLineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const containsCurrentWord = lines[i].some(
        (element) =>
          parseInt(element.dataset.index, 10) === currentWordIndex
      );

      if (containsCurrentWord) {
        activeLineNumber = i;
        break;
      }
    }

    // Remove old line classes
    textDisplay
      .querySelectorAll(".typing-line-active")
      .forEach((el) => el.classList.remove("typing-line-active"));

    // Highlight the active line
    lines[activeLineNumber].forEach((element) => {
      element.classList.add("typing-line-active");
    });

    currentLine = lines[activeLineNumber];
    currentLineIndex = activeLineNumber;

    // ----------------------------------------------
    // ROLL THE TEXT UP
    // ----------------------------------------------
    //
    // Once we move to a new line, the previous line
    // is shifted upward.
    //
    // We do NOT scroll the whole page/container.
    //

    if (
      previousLineTop !== null &&
      currentLine.length &&
      currentLine[0]
    ) {
      const newTop = currentLine[0].getBoundingClientRect().top;

      if (newTop > previousLineTop + 5) {
        const shiftAmount = newTop - previousLineTop;

        textDisplay.style.transform =
          `translateY(-${shiftAmount}px)`;

        // After the animation, keep the new line positioned
        // where the old line was.
        requestAnimationFrame(() => {
          textDisplay.style.transition =
            "transform 0.28s ease";

          textDisplay.style.transform =
            "translateY(-" + shiftAmount + "px)";
        });
      }
    }

    if (currentLine.length) {
      previousLineTop =
        currentLine[0].getBoundingClientRect().top;
    }
  }

  // --------------------------------------------------
  // UPDATE WORD DISPLAY
  // --------------------------------------------------

  function updateWordDisplay() {
    const wordElements =
      textDisplay.querySelectorAll(".typing-word");

    wordElements.forEach((element, index) => {
      element.classList.remove(
        "correct",
        "incorrect",
        "current"
      );

      if (index < currentWordIndex) {
        element.classList.add("correct");
      } else if (index === currentWordIndex) {
        element.classList.add("current");
      }
    });

    requestAnimationFrame(updateCurrentLine);
  }

  // --------------------------------------------------
  // START TEST
  // --------------------------------------------------

  function startTest() {
    if (testStarted && !testFinished) return;

    testDuration = parseInt(timeSelect?.value || "60", 10);

    testWords = generateWords(300);

    currentWordIndex = 0;
    typedCharacters = 0;
    correctCharacters = 0;
    errors = 0;

    testStarted = true;
    testFinished = false;
    timeRemaining = testDuration;

    previousLineTop = null;

    if (textDisplay) {
      textDisplay.style.transform = "translateY(0)";
      textDisplay.style.transition = "none";
    }

    renderText();

    if (input) {
      input.value = "";
      input.disabled = false;
      input.focus();
    }

    updateStats();

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timeRemaining--;

      if (timeRemaining < 0) {
        finishTest();
        return;
      }

      updateStats();

      if (timeDisplay) {
        timeDisplay.textContent = timeRemaining;
      }
    }, 1000);

    if (timeDisplay) {
      timeDisplay.textContent = timeRemaining;
    }
  }

  // --------------------------------------------------
  // HANDLE TYPING
  // --------------------------------------------------

  function handleInput() {
    if (!testStarted || testFinished) return;

    const value = input.value;
    const targetWord = testWords[currentWordIndex];

    if (!targetWord) {
      finishTest();
      return;
    }

    // Do not allow typing beyond the current word.
    if (value.length > targetWord.length) {
      input.value = value.substring(0, targetWord.length);
      return;
    }

    // Count characters
    typedCharacters = 0;
    correctCharacters = 0;
    errors = 0;

    for (let i = 0; i < currentWordIndex; i++) {
      typedCharacters += testWords[i].length;
      correctCharacters += testWords[i].length;
    }

    typedCharacters += value.length;

    // Check current word character by character
    for (let i = 0; i < value.length; i++) {
      if (value[i] === targetWord[i]) {
        correctCharacters++;
      } else {
        errors++;
      }
    }

    // If the entire word is correct, move forward.
    if (
      value.length === targetWord.length &&
      value === targetWord
    ) {
      currentWordIndex++;

      input.value = "";

      updateWordDisplay();

      if (currentWordIndex >= testWords.length) {
        finishTest();
        return;
      }
    }

    updateStats();
  }

  // --------------------------------------------------
  // HANDLE SPACE
  // --------------------------------------------------

  function handleKeydown(event) {
    if (!testStarted || testFinished) return;

    if (event.key === " " || event.code === "Space") {
      event.preventDefault();

      const value = input.value;
      const targetWord = testWords[currentWordIndex];

      if (value === targetWord) {
        currentWordIndex++;

        input.value = "";

        updateWordDisplay();

        if (currentWordIndex >= testWords.length) {
          finishTest();
        }
      }
    }
  }

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  function updateStats() {
    const elapsedSeconds =
      Math.max(1, testDuration - timeRemaining);

    const minutes = elapsedSeconds / 60;

    const wpm =
      minutes > 0
        ? Math.round((correctCharacters / 5) / minutes)
        : 0;

    const accuracy =
      typedCharacters > 0
        ? Math.round(
            (correctCharacters / typedCharacters) * 100
          )
        : 100;

    if (wpmDisplay) {
      wpmDisplay.textContent = wpm;
    }

    if (accuracyDisplay) {
      accuracyDisplay.textContent = accuracy + "%";
    }

    if (timeDisplay) {
      timeDisplay.textContent = timeRemaining;
    }
  }

  // --------------------------------------------------
  // FINISH
  // --------------------------------------------------

  function finishTest() {
    if (testFinished) return;

    testFinished = true;
    testStarted = false;

    clearInterval(timerInterval);

    if (input) {
      input.disabled = true;
    }

    updateStats();
  }

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  function resetTest() {
    clearInterval(timerInterval);

    testStarted = false;
    testFinished = false;

    currentWordIndex = 0;
    typedCharacters = 0;
    correctCharacters = 0;
    errors = 0;

    testDuration = parseInt(timeSelect?.value || "60", 10);
    timeRemaining = testDuration;

    previousLineTop = null;

    if (textDisplay) {
      textDisplay.style.transition = "none";
      textDisplay.style.transform = "translateY(0)";
    }

    if (input) {
      input.value = "";
      input.disabled = true;
    }

    testWords = generateWords(300);

    renderText();

    if (timeDisplay) {
      timeDisplay.textContent = timeRemaining;
    }

    updateStats();
  }

  // --------------------------------------------------
  // TIME SELECT
  // --------------------------------------------------

  if (timeSelect) {
    timeSelect.addEventListener("change", () => {
      if (!testStarted) {
        testDuration =
          parseInt(timeSelect.value || "60", 10);

        timeRemaining = testDuration;

        if (timeDisplay) {
          timeDisplay.textContent = timeRemaining;
        }
      }
    });
  }

  // --------------------------------------------------
  // BUTTONS
  // --------------------------------------------------

  if (startButton) {
    startButton.addEventListener("click", startTest);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetTest);
  }

  // --------------------------------------------------
  // INPUT
  // --------------------------------------------------

  if (input) {
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeydown);
  }

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  testWords = generateWords(300);
  renderText();

  if (input) {
    input.disabled = true;
  }

  if (timeDisplay) {
    timeDisplay.textContent = timeRemaining;
  }

  updateStats();
});
```

**One important thing:** this JavaScript assumes your existing HTML IDs are still `text-display`, `typing-input`, `time-select`, `start-btn`, `reset-btn`, `timer`, `wpm`, and `accuracy`.

If the words **still don't physically move upward** after replacing this, then the remaining problem is in the **CSS**, not `script.js`. In that case, send me your current `style.css` and I'll fix the scrolling animation there rather than making you keep replacing JavaScript.
