const boardSize = 10;
const symbols = ['🐶','🐱','🐰','🐻','🦊','🐼'];
let board = [];
let firstClick = null;
let timerInterval;
let remainingTime = 60;
let score = 0;

let isProcessing = false;
let isGameOver = false;

const boardEl = document.getElementById('game-board');
const messageEl = document.getElementById('message');
const timerEl = document.getElementById('timer');
const popSound = document.getElementById('pop-sound');
const restartBtn = document.getElementById('restart-btn');
const scoreEl = document.getElementById('score');

function startGame() {
    isGameOver = false;
    isProcessing = false;
  resetTimer();
  score = 0;
  scoreEl.textContent = `점수: ${score}`;
  generateBoard();
  startTimer();
  messageEl.textContent = '';
}

function generateBoard() {
  board = [];
  boardEl.innerHTML = '';
  for (let i = 0; i < boardSize * boardSize; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    board.push(symbol);

    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.textContent = symbol;
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleClick(i));
    boardEl.appendChild(cell);
  }
}

function handleClick(index) {
  if (firstClick === null) {
    firstClick = index;
    boardEl.children[index].style.border = '2px solid blue';
  } else {
    const second = index;
    if (isAdjacent(firstClick, second)) {
      boardEl.children[firstClick].style.border = '';
      animateSwap(firstClick, second, () => {
        if (checkMatches()) {
          popSound.play();
          setTimeout(() => {
            dropAndRefill();
          }, 500);
        } else {
          animateSwap(firstClick, second); // 원위치 복귀
        }
      });
    } else {
      boardEl.children[firstClick].style.border = '';
    }
    firstClick = null;
  }
}

function isAdjacent(i, j) {
  const x1 = i % boardSize, y1 = Math.floor(i / boardSize);
  const x2 = j % boardSize, y2 = Math.floor(j / boardSize);
  return (Math.abs(x1 - x2) + Math.abs(y1 - y2)) === 1;
}

function animateSwap(i, j, callback) {
  const cellA = boardEl.children[i];
  const cellB = boardEl.children[j];
  const rectA = cellA.getBoundingClientRect();
  const rectB = cellB.getBoundingClientRect();
  const dx = rectB.left - rectA.left;
  const dy = rectB.top - rectA.top;

  cellA.style.transform = `translate(${dx}px, ${dy}px)`;
  cellB.style.transform = `translate(${-dx}px, ${-dy}px)`;

  setTimeout(() => {
    [board[i], board[j]] = [board[j], board[i]];
    updateBoard();

    cellA.style.transform = '';
    cellB.style.transform = '';

    if (callback) callback();
  }, 300);
}

function updateBoard() {
  board.forEach((symbol, i) => {
    boardEl.children[i].textContent = symbol;
  });
}

function checkMatches() {
  let matched = false;
  let matchedIndices = new Set();

  for (let i = 0; i < board.length; i++) {
    const symbol = board[i];
    // 가로 체크
    if (i % boardSize <= boardSize - 3) {
      if (board[i + 1] === symbol && board[i + 2] === symbol) {
        matched = true;
        matchedIndices.add(i).add(i + 1).add(i + 2);
      }
    }
    // 세로 체크
    if (i + boardSize * 2 < board.length) {
      if (board[i + boardSize] === symbol && board[i + boardSize * 2] === symbol) {
        matched = true;
        matchedIndices.add(i).add(i + boardSize).add(i + boardSize * 2);
      }
    }
  }

  if (matched) {
    animateMatch([...matchedIndices]);
  }

  return matched;
}

function animateMatch(indices) {
    if (isProcessing) return;
    isProcessing = true;
  
    indices.forEach(i => {
      const cell = boardEl.children[i];
      cell.classList.add('burst');
    });
  
    setTimeout(() => {
      indices.forEach(i => {
        board[i] = null;
        boardEl.children[i].classList.remove('burst');
      });
      updateBoard();
      score += 100;
      scoreEl.textContent = `점수: ${score}`;
      isProcessing = false;
      dropAndRefill();
    }, 400);
  }  

function dropAndRefill() {
    if (isProcessing || isGameOver) return;
    isProcessing = true;
    
    for (let x = 0; x < boardSize; x++) {
      const column = [];
  
      for (let y = 0; y < boardSize; y++) {
        const index = y * boardSize + x;
        if (board[index] !== null) {
          column.push(board[index]);
        }
      }
  
      const missing = boardSize - column.length;
      const newSymbols = Array.from({ length: missing }, () =>
        symbols[Math.floor(Math.random() * symbols.length)]
      );
      const newColumn = [...newSymbols, ...column];
  
      for (let y = 0; y < boardSize; y++) {
        const index = y * boardSize + x;
        const newSymbol = newColumn[y];
        const cell = boardEl.children[index];
  
        board[index] = newSymbol;
        cell.textContent = newSymbol;
  
        cell.style.transform = `translateY(-60px)`;
        requestAnimationFrame(() => {
          cell.style.transition = 'transform 0.3s ease';
          cell.style.transform = 'translateY(0)';
        });
      }
    }
  
    setTimeout(() => {
      updateBoard();
      isProcessing = false;
  
      if (!isGameOver && checkMatches()) {
        setTimeout(dropAndRefill, 300);
      }
    }, 350);
  }  

function startTimer() {
  remainingTime = 60;
  timerEl.textContent = `⏰ ${remainingTime}`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    timerEl.textContent = `⏰ ${remainingTime}`;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  remainingTime = 60;
  timerEl.textContent = `⏰ ${remainingTime}`;
}


function endGame() {
  isGameOver = true;
  messageEl.textContent = `🎉 게임 종료! 점수: ${score}점`;
  for (let i = 0; i < boardEl.children.length; i++) {
    boardEl.children[i].onclick = null;
  }
}

restartBtn.addEventListener('click', startGame);

startGame();
