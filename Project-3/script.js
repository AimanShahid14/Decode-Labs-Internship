const quizData = [
  {
    question: "What does DOM stand for?",
    options: [
      "Document Object Model",
      "Data Output Method",
      "Display Object Machine",
      "Document Order Map"
    ],
    correctIndex: 0
  },
  {
    question: "Which method is used to select an element by CSS selector?",
    options: [
      "document.getElement()",
      "document.querySelector()",
      "document.findElement()",
      "document.selectItem()"
    ],
    correctIndex: 1
  },
  {
    question: "Which keyword should you avoid using for variable declarations in modern JavaScript?",
    options: ["const", "let", "var", "static"],
    correctIndex: 2
  },
  {
    question: "Which method attaches a function to run when an event occurs?",
    options: [
      "element.onEvent()",
      "element.runEvent()",
      "element.addEventListener()",
      "element.triggerEvent()"
    ],
    correctIndex: 2
  },
  {
    question: "Which property should you use instead of innerHTML to safely insert text?",
    options: ["outerText", "textContent", "innerText", "htmlContent"],
    correctIndex: 1
  }
];

const TIME_PER_QUESTION = 15; // seconds

// ---------- STATE ----------
let currentQuestionIndex = 0;
let score = 0;
let hasAnswered = false;
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;

// ---------- PHASE 1: INPUT — grab elements ----------
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');

const questionCounter = document.getElementById('questionCounter');
const scoreDisplay = document.getElementById('scoreDisplay');
const questionText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const progressFill = document.getElementById('progressFill');

const timerFill = document.getElementById('timerFill');
const timerText = document.getElementById('timerText');

const resultScore = document.getElementById('resultScore');
const resultMessage = document.getElementById('resultMessage');

const themeSwatches = document.querySelectorAll('.js-theme-swatch');

themeSwatches.forEach(function (swatch) {
  swatch.addEventListener('click', function () {
    const chosenTheme = swatch.dataset.theme;

    document.body.className = document.body.className
      .split(' ')
      .filter(function (cls) { return !cls.startsWith('theme-'); })
      .join(' ');
    document.body.classList.add('theme-' + chosenTheme);

    themeSwatches.forEach(function (s) { s.classList.remove('is-active'); });
    swatch.classList.add('is-active');
  });
});

document.body.classList.add('theme-indigo');
if (themeSwatches[0]) themeSwatches[0].classList.add('is-active');

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach(function (screen) {
    screen.classList.toggle('is-hidden', screen !== screenToShow);
  });
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  timerInterval = setInterval(function () {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!hasAnswered) {
        handleAnswer(-1, null); 
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerText.textContent = timeLeft + 's';
  const percent = (timeLeft / TIME_PER_QUESTION) * 100;
  timerFill.style.width = percent + '%';

  timerFill.classList.remove('is-warning', 'is-danger');
  if (timeLeft <= 5) {
    timerFill.classList.add('is-danger');
  } else if (timeLeft <= 9) {
    timerFill.classList.add('is-warning');
  }
}

function renderQuestion() {
  hasAnswered = false;
  nextBtn.classList.add('is-hidden');

  const currentQuestion = quizData[currentQuestionIndex];

  questionCounter.textContent = 'Question ' + (currentQuestionIndex + 1) + ' / ' + quizData.length;
  scoreDisplay.textContent = 'Score: ' + score;
  questionText.textContent = currentQuestion.question;

  const progressPercent = (currentQuestionIndex / quizData.length) * 100;
  progressFill.style.width = progressPercent + '%';


  optionsList.textContent = '';

  currentQuestion.options.forEach(function (optionText, index) {
    const optionBtn = document.createElement('button');
    optionBtn.className = 'option-btn js-option-btn';
    optionBtn.textContent = optionText;
    optionBtn.dataset.index = index;

    optionBtn.addEventListener('click', function () {
      handleAnswer(index, optionBtn);
    });

    optionsList.appendChild(optionBtn);
  });

  startTimer();
}

function handleAnswer(selectedIndex, selectedBtn) {
  if (hasAnswered) return; 
  hasAnswered = true;
  clearInterval(timerInterval);

  const currentQuestion = quizData[currentQuestionIndex];
  const allOptionButtons = document.querySelectorAll('.js-option-btn');

  allOptionButtons.forEach(function (btn) {
    btn.disabled = true;
    const btnIndex = Number(btn.dataset.index);

    if (btnIndex === currentQuestion.correctIndex) {
      btn.classList.add('is-correct');
    } else if (btnIndex === selectedIndex) {
      btn.classList.add('is-wrong');
    }
  });

  if (selectedIndex === currentQuestion.correctIndex) {
    score++;
    scoreDisplay.textContent = 'Score: ' + score;
  }

  nextBtn.classList.remove('is-hidden');
}

function goToNextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < quizData.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  clearInterval(timerInterval);
  progressFill.style.width = '100%';
  resultScore.textContent = 'You scored ' + score + ' / ' + quizData.length;

  let message;
  if (score === quizData.length) {
    message = 'Perfect score! You really know your DOM basics.';
    launchConfetti();
  } else if (score >= quizData.length / 2) {
    message = 'Nice work! A little more practice and you will master this.';
  } else {
    message = 'Keep practicing — review the DOM and event listener basics and try again.';
  }
  resultMessage.textContent = message;

  showScreen(resultScreen);
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showScreen(quizScreen);
  renderQuestion();
}

startBtn.addEventListener('click', function () {
  showScreen(quizScreen);
  renderQuestion();
});

nextBtn.addEventListener('click', goToNextQuestion);
restartBtn.addEventListener('click', restartQuiz);

const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let confettiAnimationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createConfettiPiece() {
  const colors = ['#6c8cff', '#34c37a', '#e5544d', '#f0a13c', '#b07ae0'];
  return {
    x: Math.random() * canvas.width,
    y: -20,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12
  };
}

function launchConfetti() {
  confettiPieces = [];
  for (let i = 0; i < 120; i++) {
    confettiPieces.push(createConfettiPiece());
  }
  if (!confettiAnimationId) {
    animateConfetti();
  }

  setTimeout(function () {
    confettiPieces = [];
  }, 4000);
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces.forEach(function (piece) {
    piece.y += piece.speedY;
    piece.x += piece.speedX;
    piece.rotation += piece.rotationSpeed;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate((piece.rotation * Math.PI) / 180);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
    ctx.restore();
  });

  confettiPieces = confettiPieces.filter(function (p) { return p.y < canvas.height + 20; });

  confettiAnimationId = requestAnimationFrame(animateConfetti);
}
