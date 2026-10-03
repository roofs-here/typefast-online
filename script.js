const words = [
  "The best way to improve your typing is to practice regularly and focus on accuracy before speed. Keep your hands relaxed and let your fingers move naturally across the keyboard.",
  "A clear goal makes practice easier. Start slowly, type each word carefully, and build speed as your accuracy becomes consistent. Small improvements add up over time.",
  "Good typing skills can make everyday computer work faster and less tiring. Practice common words, punctuation, and numbers so that your keyboard feels familiar.",
  "Working efficiently at a computer starts with comfortable typing. Keep your eyes on the screen, use both hands, and try to maintain a steady rhythm as you work.",
  "Consistent practice is more useful than trying to type as fast as possible. Focus on making fewer mistakes, and your speed will naturally improve with time.",
  "Typing is a skill that becomes easier when you practice a little every day. Stay relaxed, keep a steady pace, and concentrate on accuracy.",
  "Many everyday tasks become easier when you can type quickly and accurately. Emails, documents, forms, and data entry all benefit from strong keyboard skills."
];

const nums = "482 719 305 664 218 907 531 846 290 175 638 402 951 327 760 184 593 816 245 670 318 904 562 137 829 450 716 283 605 941";

let duration = 30;
let remaining = 30;
let mode = "words";
let text = "";
let started = false;
let done = false;
let timer = null;

const $ = selector => document.querySelector(selector);
const input = $("#input");
const display = $("#display");

function generateText() {
    if (mode === "numbers") {
        return Array(25).fill(nums).join(" ");
    }

    const passages = [];

    for (let i = 0; i < 20; i++) {
        passages.push(words[Math.floor(Math.random() * words.length)]);
    }

    return passages.join(" ");
}

function render() {
    const typed = input.value;

    display.innerHTML = [...text].map((char, index) => {
        let className = "";

        if (index < typed.length) {
            className = typed[index] === char ? "correct" : "wrong";
        } else if (index === typed.length) {
            className = "current";
        }

        return `<span class="${className}">${char}</span>`;
    }).join("");

    keepCurrentPositionVisible();
}

function keepCurrentPositionVisible() {
    const current = display.querySelector(".current");

    if (!current) return;

    const displayRect = display.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();

    const topBuffer = 35;
    const bottomBuffer = 85;

    if (currentRect.bottom > displayRect.bottom - bottomBuffer) {
        display.scrollTop += currentRect.bottom - (displayRect.bottom - bottomBuffer);
    }

    if (currentRect.top < displayRect.top + topBuffer) {
        display.scrollTop -= (displayRect.top + topBuffer) - currentRect.top;
    }
}

function calculate() {
    const typed = input.value;

    let correct = 0;
    let errors = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === text[i]) {
            correct++;
        } else {
            errors++;
        }
    }

    const elapsedSeconds = Math.max(duration - remaining, 1);
    const minutes = elapsedSeconds / 60;

    const wpm = Math.round((correct / 5) / minutes);
    const accuracy = typed.length
        ? Math.round((correct / typed.length) * 100)
        : 100;

    $("#wpm").textContent = wpm;
    $("#accuracy").textContent = accuracy + "%";
    $("#errors").textContent = errors;

    return {
        wpm,
        accuracy,
        errors,
        characters: typed.length
    };
}

function reset() {
    clearInterval(timer);

    started = false;
    done = false;
    remaining = duration;

    $("#time").textContent = remaining;
    $("#wpm").textContent = 0;
    $("#accuracy").textContent = "100%";
    $("#errors").textContent = 0;

    input.value = "";
    input.disabled = false;

    $("#results").classList.add("hidden");

    text = generateText();

    display.scrollTop = 0;

    render();

    input.focus();
}

function startTimer() {
    if (started) return;

    started = true;

    timer = setInterval(() => {
        remaining--;

        $("#time").textContent = remaining;

        calculate();

        if (remaining <= 0) {
            finish();
        }
    }, 1000);
}

function finish() {
    if (done) return;

    done = true;

    clearInterval(timer);

    input.disabled = true;

    const result = calculate();

    $("#fwpm").textContent = result.wpm;
    $("#facc").textContent = result.accuracy + "%";
    $("#ferr").textContent = result.errors;
    $("#fchars").textContent = result.characters;

    $("#fdur").textContent =
        duration >= 60
            ? duration / 60 + " min"
            : duration + "s";

    $("#results").classList.remove("hidden");

    $("#results").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

input.addEventListener("input", () => {
    if (done) return;

    startTimer();

    /*
      If the user somehow gets very close to the end
      of the generated text, add another batch automatically.
    */
    if (input.value.length > text.length - 500) {
        const oldLength = text.length;

        if (mode === "numbers") {
            text += " " + Array(10).fill(nums).join(" ");
        } else {
            const extra = [];

            for (let i = 0; i < 10; i++) {
                extra.push(
                    words[Math.floor(Math.random() * words.length)]
                );
            }

            text += " " + extra.join(" ");
        }
    }

    render();
    calculate();
});

input.addEventListener("paste", event => {
    event.preventDefault();
});

document.querySelectorAll(".dur button").forEach(button => {
    button.onclick = () => {
        document.querySelector(".dur .active").classList.remove("active");

        button.classList.add("active");

        duration = Number(button.dataset.time);

        reset();
    };
});

document.querySelectorAll(".tabs button").forEach(button => {
    button.onclick = () => {
        document.querySelector(".tabs .active").classList.remove("active");

        button.classList.add("active");

        mode = button.dataset.mode;

        reset();
    };
});

$("#restart").onclick = reset;

$("#again").onclick = reset;

$("#theme").onclick = () => {
    document.body.classList.toggle("dark");

    $("#theme").textContent =
        document.body.classList.contains("dark")
            ? "☀"
            : "☾";
};

reset();
