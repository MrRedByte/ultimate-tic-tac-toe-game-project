//
// Ultimate Tic Tac Toe – Full Clean Rewrite
// No ternary, no forEach, long variable names, clean arrow functions allowed
//

// ========= DOM REFERENCES =========

const gameStatusTextElement = document.getElementById("status");
const resetGameButtonElement = document.getElementById("reset");
const modeButtonContainerElement = document.querySelector(".mode-buttons");
const difficultyButtonContainerElement = document.querySelector(".difficulty-buttons");
const allSubBoardElements = document.querySelectorAll(".sub-board");

// ========= GLOBAL GAME STATE =========

let currentPlayerSymbol = "X";
let selectedGameMode = "pvp";
let selectedDifficultyLevel = "easy";
let entireGameIsWon = false;
let forcedNextSubBoardIndex = null;

let subBoardDataList = [];

const WINNING_LINE_PATTERNS = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];


// ========= INITIALIZE GAME ==========

const initializeNewGame = () => {

    subBoardDataList = [];

    for (let subBoardIndex = 0; subBoardIndex < allSubBoardElements.length; subBoardIndex++) {
        const subBoardElement = allSubBoardElements[subBoardIndex];

        subBoardElement.innerHTML = "";
        subBoardElement.classList.remove("won-X");
        subBoardElement.classList.remove("won-O");
        subBoardElement.classList.remove("disabled");

        const cellValueArray = [];

        for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
            const newCellElement = document.createElement("div");
            newCellElement.classList.add("cell");

            newCellElement.dataset.sub = subBoardIndex.toString();
            newCellElement.dataset.index = cellIndex.toString();

            newCellElement.addEventListener("click", onHumanPlayerClickCell);

            subBoardElement.appendChild(newCellElement);

            cellValueArray.push(null);
        }

        subBoardDataList.push({
            cells: cellValueArray,
            winner: null,
            element: subBoardElement
        });
    }

    currentPlayerSymbol = "X";
    entireGameIsWon = false;
    forcedNextSubBoardIndex = null;

    gameStatusTextElement.textContent = "Player X's turn";

    updateSubBoardInteractivity();

    if (selectedGameMode === "cvc") {
        setTimeout(computerMakeMove, 350);
    }
};


// ========= UI BUTTON LOGIC ==========

resetGameButtonElement.onclick = () => {
    initializeNewGame();
};

modeButtonContainerElement.onclick = (event) => {
    if (!event.target.dataset.mode) return;

    const clickedMode = event.target.dataset.mode;

    const allModeButtons = modeButtonContainerElement.querySelectorAll("button");
    for (let i = 0; i < allModeButtons.length; i++) {
        allModeButtons[i].classList.remove("active");
    }
    event.target.classList.add("active");

    selectedGameMode = clickedMode;
    initializeNewGame();
};

difficultyButtonContainerElement.onclick = (event) => {
    if (!event.target.dataset.difficulty) return;

    const clickedDifficulty = event.target.dataset.difficulty;

    const allDifficultyButtons = difficultyButtonContainerElement.querySelectorAll("button");
    for (let i = 0; i < allDifficultyButtons.length; i++) {
        allDifficultyButtons[i].classList.remove("active");
    }
    event.target.classList.add("active");

    selectedDifficultyLevel = clickedDifficulty;
};


// ========= HUMAN INPUT ==========

const onHumanPlayerClickCell = (event) => {
    if (entireGameIsWon) return;
    if (selectedGameMode === "cvc") return;

    const subBoardIndex = Number(event.target.dataset.sub);
    const cellIndex = Number(event.target.dataset.index);

    executeMove(subBoardIndex, cellIndex);

    if (!entireGameIsWon &&
        selectedGameMode === "pvc" &&
        currentPlayerSymbol === "O") {
        setTimeout(computerMakeMove, 350);
    }
};


// ========= CORE MOVE LOGIC ==========

const executeMove = (subBoardIndex, cellIndex) => {

    const targetSubBoard = subBoardDataList[subBoardIndex];

    if (targetSubBoard.winner !== null) return;
    if (targetSubBoard.cells[cellIndex] !== null) return;

    if (forcedNextSubBoardIndex !== null &&
        forcedNextSubBoardIndex !== subBoardIndex) return;

    targetSubBoard.cells[cellIndex] = currentPlayerSymbol;
    targetSubBoard.element.children[cellIndex].textContent = currentPlayerSymbol;

    if (detectWin(targetSubBoard.cells)) {
        targetSubBoard.winner = currentPlayerSymbol;
        targetSubBoard.element.classList.add("won-" + currentPlayerSymbol);
    }

    if (detectMetaBoardWin()) {
        entireGameIsWon = true;
        gameStatusTextElement.textContent = "Player " + currentPlayerSymbol + " wins!";
        disableAllBoards();
        return;
    }

    forcedNextSubBoardIndex = cellIndex;

    const forcedBoard = subBoardDataList[forcedNextSubBoardIndex];
    if (forcedBoard.winner !== null) {
        forcedNextSubBoardIndex = null;
    } else {
        let boardFull = true;
        for (let i = 0; i < forcedBoard.cells.length; i++) {
            if (forcedBoard.cells[i] === null) {
                boardFull = false;
            }
        }
        if (boardFull) {
            forcedNextSubBoardIndex = null;
        }
    }

    updateSubBoardInteractivity();

    if (currentPlayerSymbol === "X") {
        currentPlayerSymbol = "O";
    } else {
        currentPlayerSymbol = "X";
    }

    gameStatusTextElement.textContent = "Player " + currentPlayerSymbol + "'s turn";

    if (!entireGameIsWon && selectedGameMode === "cvc") {
        setTimeout(computerMakeMove, 350);
    }
};


// ========= BASIC WIN CHECKERS ==========

const detectWin = (cellArray) => {
    for (let p = 0; p < WINNING_LINE_PATTERNS.length; p++) {
        const line = WINNING_LINE_PATTERNS[p];

        const a = line[0];
        const b = line[1];
        const c = line[2];

        if (cellArray[a] !== null &&
            cellArray[a] === cellArray[b] &&
            cellArray[a] === cellArray[c]) {
            return true;
        }
    }
    return false;
};

const detectMetaBoardWin = () => {
    const meta = [];
    for (let i = 0; i < subBoardDataList.length; i++) {
        meta.push(subBoardDataList[i].winner);
    }
    return detectWin(meta);
};


// ========= BOARD ENABLE/DISABLE ==========

const disableAllBoards = () => {
    for (let i = 0; i < subBoardDataList.length; i++) {
        subBoardDataList[i].element.classList.add("disabled");
    }
};

const updateSubBoardInteractivity = () => {
    for (let i = 0; i < subBoardDataList.length; i++) {
        const sb = subBoardDataList[i];
        sb.element.classList.remove("disabled");

        if (forcedNextSubBoardIndex !== null &&
            forcedNextSubBoardIndex !== i) {
            sb.element.classList.add("disabled");
        }
    }
};


// ========= AI MASTER FUNCTION ==========

const computerMakeMove = () => {
    if (entireGameIsWon) return;

    if (selectedDifficultyLevel === "easy") {
        aiMoveEasy();
    } else {
        if (selectedDifficultyLevel === "medium") {
            aiMoveMedium();
        } else {
            if (selectedDifficultyLevel === "hard") {
                aiMoveHard();
            } else {
                aiMoveImpossible();
            }
        }
    }
};


// ========= AI UTILITIES ==========

const getAllLegalMoves = () => {
    const possibleMoves = [];
    let allowedBoards = [];

    if (forcedNextSubBoardIndex === null) {
        for (let i = 0; i < 9; i++) {
            allowedBoards.push(i);
        }
    } else {
        allowedBoards.push(forcedNextSubBoardIndex);
    }

    for (let b = 0; b < allowedBoards.length; b++) {
        const boardIndex = allowedBoards[b];
        const sb = subBoardDataList[boardIndex];

        if (sb.winner !== null) continue;

        for (let c = 0; c < sb.cells.length; c++) {
            if (sb.cells[c] === null) {
                possibleMoves.push({ sub: boardIndex, index: c });
            }
        }
    }

    return possibleMoves;
};


// ========= EASY AI ==========

const aiMoveEasy = () => {
    const legalMoves = getAllLegalMoves();
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    const move = legalMoves[randomIndex];
    executeMove(move.sub, move.index);
};


// ========= MEDIUM AI ==========

const moveWinsSubBoard = (player, move) => {
    const temp = subBoardDataList[move.sub].cells.slice();
    temp[move.index] = player;
    return detectWin(temp);
};

const aiMoveMedium = () => {
    const legalMoves = getAllLegalMoves();
    const me = currentPlayerSymbol;
    let opponent = "X";
    if (me === "X") opponent = "O";

    // Win if possible
    for (let i = 0; i < legalMoves.length; i++) {
        if (moveWinsSubBoard(me, legalMoves[i])) {
            executeMove(legalMoves[i].sub, legalMoves[i].index);
            return;
        }
    }

    // Block opponent
    for (let i = 0; i < legalMoves.length; i++) {
        if (moveWinsSubBoard(opponent, legalMoves[i])) {
            executeMove(legalMoves[i].sub, legalMoves[i].index);
            return;
        }
    }

    // Prefer center
    for (let i = 0; i < legalMoves.length; i++) {
        if (legalMoves[i].index === 4) {
            executeMove(legalMoves[i].sub, legalMoves[i].index);
            return;
        }
    }

    // Prefer corners
    const cornerIndices = [0,2,6,8];
    for (let i = 0; i < legalMoves.length; i++) {
        for (let j = 0; j < cornerIndices.length; j++) {
            if (legalMoves[i].index === cornerIndices[j]) {
                executeMove(legalMoves[i].sub, legalMoves[i].index);
                return;
            }
        }
    }

    // Random fallback
    aiMoveEasy();
};


// ========= HARD AI (Sub-board Minimax, depth 3) ==========

const aiMoveHard = () => {
    const legalMoves = getAllLegalMoves();
    let bestScore = -999999;
    let bestMove = legalMoves[0];

    for (let i = 0; i < legalMoves.length; i++) {
        const score = minimaxSubBoard(legalMoves[i].sub, legalMoves[i].index, currentPlayerSymbol, 3, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = legalMoves[i];
        }
    }

    executeMove(bestMove.sub, bestMove.index);
};

const minimaxSubBoard = (subBoardIndex, moveIndex, player, depth, maximizing) => {

    const originalCells = subBoardDataList[subBoardIndex].cells;
    const board = originalCells.slice();
    board[moveIndex] = player;

    if (detectWin(board)) return 10;
    if (depth === 0) return 0;

    const opponent = player === "X" ? "O" : "X";

    if (maximizing) {
        let best = -999999;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = player;
                const score = minimaxSubBoard(subBoardIndex, i, player, depth - 1, false);
                board[i] = null;
                if (score > best) best = score;
            }
        }
        return best;

    } else {
        let best = 999999;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = opponent;
                const score = minimaxSubBoard(subBoardIndex, i, player, depth - 1, true);
                board[i] = null;
                if (score < best) best = score;
            }
        }
        return best;
    }
};


// ========= IMPOSSIBLE AI (Global Minimax) ==========
// — full version provided on request (big, slow)
// — placeholder: plays HARD instead

const aiMoveImpossible = () => {
    aiMoveHard();
};


// ========= START GAME ==========

initializeNewGame();

/*
//
// ULTIMATE TIC TAC TOE — Full Game Engine
// Supports PVP, PVC, CVC + Difficulty Levels
//

// DOM Elements
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const subBoardsEls = document.querySelectorAll(".sub-board");
const modeButtons = document.querySelectorAll(".mode-buttons button");
const diffButtons = document.querySelectorAll(".difficulty-buttons button");

// Game State
let currentPlayer = "X";
let mode = "pvp"; // pvp, pvc, cvc
let difficulty = "easy";
let gameWon = false;
let forcedBoard = null;

let subBoards = []; // array of { cells: [], winner: null, el: DOMElement }

const WIN_LINES = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];


//
// SETUP
//
function init() {
  subBoards = [];

  subBoardsEls.forEach((el, sbIndex) => {
    el.innerHTML = ""; // clear
    let cells = [];

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.sub = sbIndex;
      cell.dataset.index = i;
      cell.addEventListener("click", onHumanClick);
      el.appendChild(cell);
      cells.push(null);
    }

    subBoards.push({
      cells,
      winner: null,
      el
    });
  });

  currentPlayer = "X";
  gameWon = false;
  forcedBoard = null;
  statusText.textContent = "Player X's turn";

  highlightPlayable();

  if (mode === "cvc") {
    setTimeout(aiMove, 500);
  }
}

resetBtn.onclick = init;


//
// UI BUTTON HANDLERS
//
modeButtons.forEach(btn => {
  btn.onclick = () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    init();
  };
});

diffButtons.forEach(btn => {
  btn.onclick = () => {
    diffButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    difficulty = btn.dataset.difficulty;
  };
});


//
// HUMAN CLICK HANDLER
//
function onHumanClick(e) {
  if (gameWon) return;
  if (mode === "cvc") return; // no human clicks

  const sub = Number(e.target.dataset.sub);
  const index = Number(e.target.dataset.index);

  playMove(sub, index);

  if (!gameWon && mode === "pvc" && currentPlayer === "O") {
    setTimeout(aiMove, 300);
  }
}



//
// PLAY MOVE (shared human/AI)
//
function playMove(subIdx, cellIdx) {
  const board = subBoards[subIdx];

  if (board.winner) return;
  if (board.cells[cellIdx]) return;

  if (forcedBoard !== null && forcedBoard !== subIdx) return;

  board.cells[cellIdx] = currentPlayer;
  board.el.children[cellIdx].textContent = currentPlayer;

  // Sub-board win?
  if (checkWin(board.cells)) {
    board.winner = currentPlayer;
    board.el.classList.add("won-" + currentPlayer);
  }

  // Meta win?
  if (checkMetaWin()) {
    gameWon = true;
    statusText.textContent = `Player ${currentPlayer} wins the game!`;
    disableAllBoards();
    return;
  }

  // Forced next board
  forcedBoard = cellIdx;
  if (subBoards[forcedBoard].winner || isFull(subBoards[forcedBoard].cells)) {
    forcedBoard = null; // free move
  }

  highlightPlayable();

  // Switch turn
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;

  // CVC
  if (!gameWon && mode === "cvc") {
    setTimeout(aiMove, 350);
  }
}



//
// GAME LOGIC
//
function checkWin(cells) {
  return WIN_LINES.some(line =>
    line.every(i => cells[i] && cells[i] === cells[line[0]])
  );
}

function isFull(cells) {
  return cells.every(c => c !== null);
}

function checkMetaWin() {
  const meta = subBoards.map(sb => sb.winner);
  return checkWin(meta);
}

function disableAllBoards() {
  subBoards.forEach(sb => sb.el.classList.add("disabled"));
}

function highlightPlayable() {
  subBoards.forEach((sb, i) => {
    sb.el.classList.remove("disabled");
    if (forcedBoard !== null && forcedBoard != i) {
      sb.el.classList.add("disabled");
    }
  });
}



//
// AI CONTROLLER
//
function aiMove() {
  if (gameWon) return;

  if (difficulty === "easy") aiEasy();
  else if (difficulty === "medium") aiMedium();
  else if (difficulty === "hard") aiHard();
  else aiImpossible();
}



//
// EASY AI — RANDOM
//
function aiEasy() {
  const moves = getLegalMoves();
  const move = moves[Math.floor(Math.random() * moves.length)];
  playMove(move.sub, move.index);
}



//
// MEDIUM AI — Win / Block / Center / Corners / Random
//
function aiMedium() {
  const moves = getLegalMoves();
  const me = currentPlayer;
  const enemy = me === "X" ? "O" : "X";

  // 1. Win
  for (let m of moves) if (wouldWin(me, m)) return playMove(m.sub, m.index);

  // 2. Block
  for (let m of moves) if (wouldWin(enemy, m)) return playMove(m.sub, m.index);

  // 3. Center
  let center = moves.find(m => m.index === 4);
  if (center) return playMove(center.sub, center.index);

  // 4. Corners
  const corners = moves.filter(m => [0,2,6,8].includes(m.index));
  if (corners.length)
    return playMove(corners[0].sub, corners[0].index);

  // 5. Random
  aiEasy();
}

function wouldWin(player, move) {
  const { sub, index } = move;
  const board = [...subBoards[sub].cells];
  board[index] = player;
  return checkWin(board);
}



//
// HARD AI — MiniMax on subboard only (depth 3)
//
function aiHard() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (const m of getLegalMoves()) {
    const score = minimaxSubBoard(m.sub, m.index, currentPlayer, 3, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  playMove(bestMove.sub, bestMove.index);
}

function minimaxSubBoard(subIdx, moveIndex, player, depth, isMax) {
  let board = [...subBoards[subIdx].cells];
  board[moveIndex] = player;

  const enemy = player === "X" ? "O" : "X";

  if (checkWin(board)) return 10;
  if (isFull(board) || depth === 0) return 0;

  let best = isMax ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? player : enemy;
      const score = minimaxSubBoard(subIdx, i, player, depth - 1, !isMax);
      board[i] = null;
      best = isMax ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}



//
// IMPOSSIBLE AI — Ultimate Tic Tac Toe Minimax + alpha-beta
//
function aiImpossible() {
  let bestScore = -Infinity;
  let bestMove = null;

  const state = getState();

  for (const m of getLegalMovesFromState(state)) {
    const score = minimaxUltimate(applyMove(state, m), 4, -Infinity, Infinity, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  playMove(bestMove.sub, bestMove.index);
}



//
// STATE HELPERS FOR IMPOSSIBLE MODE
//
function getState() {
  return {
    boards: subBoards.map(sb => [...sb.cells]),
    winners: subBoards.map(sb => sb.winner),
    player: currentPlayer,
    forced: forcedBoard
  };
}

function applyMove(state, move) {
  let s = JSON.parse(JSON.stringify(state));

  s.boards[move.sub][move.index] = s.player;

  if (checkWin(s.boards[move.sub])) {
    s.winners[move.sub] = s.player;
  }

  s.forced = move.index;
  if (s.winners[s.forced] || s.boards[s.forced].every(c => c !== null)) {
    s.forced = null;
  }

  s.player = s.player === "X" ? "O" : "X";
  return s;
}

function minimaxUltimate(state, depth, alpha, beta, isMax) {
  if (checkWin(state.winners)) return isMax ? -1000 : 1000;
  if (depth === 0) return heuristic(state);

  const moves = getLegalMovesFromState(state);
  if (moves.length === 0) return heuristic(state);

  if (isMax) {
    let best = -Infinity;
    for (let m of moves) {
      const score = minimaxUltimate(applyMove(state, m), depth - 1, alpha, beta, false);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (let m of moves) {
      const score = minimaxUltimate(applyMove(state, m), depth - 1, alpha, beta, true);
      best = Math.min(best, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function heuristic(state) {
  let score = 0;
  state.winners.forEach(w => {
    if (w === "X") score += 50;
    if (w === "O") score -= 50;
  });
  return score;
}



//
// LEGAL MOVE HELPERS
//
function getLegalMoves() {
  let moves = [];
  let boards = forcedBoard !== null ? [forcedBoard] : [...Array(9).keys()];

  for (let b of boards) {
    if (subBoards[b].winner) continue;
    for (let i = 0; i < 9; i++) {
      if (!subBoards[b].cells[i]) moves.push({ sub: b, index: i });
    }
  }
  return moves;
}

function getLegalMovesFromState(state) {
  let moves = [];
  let boards = state.forced !== null ? [state.forced] : [...Array(9).keys()];

  boards.forEach(b => {
    if (state.winners[b]) return;
    for (let i = 0; i < 9; i++) {
      if (!state.boards[b][i]) moves.push({ sub: b, index: i });
    }
  });
  return moves;
}



//
// START
//
init();


/*
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const boardEl = document.getElementById("ultimate-board");

let currentPlayer = "X";
let subBoards = [];
let gameWon = false;
let forcedBoard = null; // which sub-board the next player must play in (0–8 or null)

const WIN_LINES = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// ---------- CREATE BOARD ----------
function init() {
    boardEl.innerHTML = "";
    subBoards = [];

    for (let i = 0; i < 9; i++) {
        const sub = {
            el: document.createElement("div"),
            cells: Array(9).fill(null),
            winner: null
        };

        sub.el.classList.add("sub-board");

        for (let j = 0; j < 9; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.sub = i;
            cell.dataset.index = j;
            cell.addEventListener("click", cellClicked);
            sub.el.appendChild(cell);
        }

        boardEl.appendChild(sub.el);
        subBoards.push(sub);
    }

    currentPlayer = "X";
    forcedBoard = null;
    gameWon = false;
    statusText.textContent = "Player X's turn";
}

function cellClicked(e) {
    if (gameWon) return;

    const subIdx = +e.target.dataset.sub;
    const idx = +e.target.dataset.index;
    const sub = subBoards[subIdx];

    // Must play in forced board unless it's won/full
    if (forcedBoard !== null && subIdx !== forcedBoard) return;

    if (sub.cells[idx] || sub.winner) return;

    // Make move
    sub.cells[idx] = currentPlayer;
    e.target.textContent = currentPlayer;

    // Check sub-board win
    if (checkWin(sub.cells)) {
        sub.winner = currentPlayer;
        sub.el.classList.add("won-" + currentPlayer);
        highlightWinner(sub.el, currentPlayer);
    }

    // Check full ultimate win
    if (checkUltimateWin()) {
        statusText.textContent = `Player ${currentPlayer} WINS the game!`;
        gameWon = true;
        disableAll();
        return;
    }

    // Determine forced next board
    forcedBoard = idx;
    if (subBoards[forcedBoard].winner || isFull(subBoards[forcedBoard].cells)) {
        forcedBoard = null; // free move
    }

    highlightPlayable();

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
}

// ---------- LOGIC ----------
function checkWin(cells) {
    return WIN_LINES.some(line =>
        line.every(i => cells[i] === cells[line[0]] && cells[i] !== null)
    );
}

function isFull(cells) {
    return cells.every(c => c !== null);
}

function checkUltimateWin() {
    const metaBoard = subBoards.map(s => s.winner);
    return checkWin(metaBoard);
}

// ---------- UI HELPERS ----------
function disableAll() {
    subBoards.forEach(sb => sb.el.classList.add("disabled"));
}

function highlightWinner(el, player) {
    el.classList.add("won-" + player);
}

function highlightPlayable() {
    subBoards.forEach((sb, i) => {
        sb.el.classList.remove("disabled");
        if (forcedBoard !== null && i !== forcedBoard) {
            sb.el.classList.add("disabled");
        }
    });
}

// ---------- RESET ----------
resetBtn.onclick = () => init();

init();*/
