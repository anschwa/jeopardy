// Game Elements
const board             = document.getElementById('game-board-container');
const questionContainer = document.getElementById('questions-container');
const points            = document.getElementById('points');
const categories        = document.getElementById('categories');
const showAnswer        = document.getElementById('show-answer');
const back              = document.getElementById('back');
const question          = document.getElementById('question');
const details           = document.getElementById('question-details');
const answer            = document.getElementById('answer');
const random            = document.getElementById('random');
const questionSet       = document.getElementById('question-set');

// Game Globals
let allQuestions;
let allCategories;
let gameCategories = [];
let currentQuestionSet = 'default';

// Create question sets
const questionSetNames = ['strange-flood', 'literate-form', 'fast-stomach', 'behave-harbor', 'market-glove', 'gusty-stem', 'sheep-language', 'volcano-root', 'general-paste', 'friction-boot', 'faulty-purpose', 'polite-pizzas', 'earthy-sock', 'trains-tax', 'system-bulb', 'giraffe-book', 'thumb-grab', 'tent-shoes', 'icicle-soap', 'beef-canvas', 'sleep-hum'];

for (let i = 0; i < 10; i ++) {
  const option = document.createElement('option');
  option.innerText = questionSetNames[i];
  option.setAttribute('value', `round-1-batch-${i+1}`);
  questionSet.appendChild(option);
}

// Setup questions
const loadQuestionSet = (qsetUrl) => {
  const newQuestionSet = qsetUrl.split('.')[0]; // (round-x-batch-y.min.json)
  if (currentQuestionSet === newQuestionSet) {
    return;
  }

  allQuestions = null;
  allCategories = null;
  gameCategories = [];
  currentQuestionSet = newQuestionSet;

  return window.fetch(qsetUrl)
               .then(response => response.json())
               .then(data => {
                 allQuestions = data;
                 allCategories = allQuestions
                   .map(q => q.category)
                   .filter((x, i, self) => self.indexOf(x) === i);
               });
};

// Jeopardy!
const getRandom = (min, max) => (Math.random() * (max - min +1)) << 0;

const getCategories = () => {
  let randCategories = [];
  for (let i=0; i < 6; i++) {
    const c = allCategories[getRandom(0, allCategories.length-1)];
    randCategories.push(c);
  }

  return randCategories;
};

const setCategories = () => {
  const categoriesEl = document.getElementById('categories');
  gameCategories = getCategories();
  gameCategories.forEach((c) => {
    const el = document.createElement('th');
    el.innerText = c;
    categoriesEl.appendChild(el);
  });
};

back.addEventListener('click', () => {
  questionContainer.classList.add('hidden');
  board.classList.remove('hidden');
  answer.classList.add('hidden');
});

showAnswer.addEventListener('click', () => {
  answer.classList.remove('hidden');
  showAnswer.classList.add('hidden');
});


random.addEventListener('click', () => {
  showRandomQuestion();
  answer.classList.add('hidden');
  showAnswer.classList.remove('hidden');
});

const newQuestion = (el) => {
  const [pID, cID] = el.target.id.split('-');
  const category = gameCategories[cID];
  const points = `$${pID}00`;

  // Get question
  console.log(category);
  const choices = allQuestions.filter(q => q.category === category && q.value === points);
  const theQuestion = choices[getRandom(0, choices.length-1)];

  console.log(theQuestion);
  details.innerText = `${category} for ${points} (${theQuestion['air_date']})`;
  question.innerText = theQuestion.question;
  answer.innerText = theQuestion.answer;

  // Show question
  board.classList.add('hidden');
  showAnswer.classList.remove('hidden');
  questionContainer.classList.remove('hidden');

  el.target.classList.add('hidden');
};

const showRandomQuestion = () => {
  const theQuestion = allQuestions[getRandom(0, allQuestions.length-1)];
  details.innerText = `${theQuestion.category} for ${theQuestion.value} (${theQuestion['air_date']})`;
  question.innerText = theQuestion.question;
  answer.innerText = theQuestion.answer;

  board.classList.add('hidden');
  showAnswer.classList.remove('hidden');
  questionContainer.classList.remove('hidden');
};

// Setup board
const setupBoard = () => {
  [1,2,3,4,5].forEach((v) => {
    const row = document.createElement('tr');

    for (let i=0; i<6; i++) {
      const td = document.createElement('td');
      const btn = document.createElement('button');
      const qID = `${v}-${i}`;
      const points = `$${v}00`;
      btn.setAttribute('id', qID);
      btn.innerText = points;
      btn.addEventListener('click', newQuestion);

      const category = gameCategories[i];
      const possibleQuestions = allQuestions.filter(q => q.category === category && q.value === points);
      const questionExists = possibleQuestions.length > 0;

      if (questionExists) {
        td.appendChild(btn);
      }

      row.appendChild(td);
    };

    points.appendChild(row);
  });
};

// Start New Game
let isPlayAgain = false;
document.getElementById('new-game').addEventListener('click', async () => {
  let msg = 'Are you sure you want to start a new game?';
  const qset = questionSet.value;
  const qsetId = qset[qset.length-1]; // Get batch number (round-x-batch-y)

  if (qset !== "default") {
    msg += `\n\nQuestion set: ${questionSetNames[qsetId]}`;
  }

  // Confirm new game
  if (isPlayAgain && !window.confirm(msg)) {
    return;
  }

  // Fetch new questions
  if (qset === "default") {
    await loadQuestionSet('api/hello-jeopardy.json');
  } else {
    await loadQuestionSet(`api/round/1/${qset}.min.json`);
  }

  // Reset
  points.innerHTML = '';
  categories.innerHTML = '';

  // Setup
  setCategories();
  setupBoard();

  // Show board
  board.classList.remove('hidden');
  random.classList.remove('hidden');
  questionSet.classList.remove('hidden');
  isPlayAgain = true;
});
