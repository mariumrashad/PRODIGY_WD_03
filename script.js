        document.addEventListener('DOMContentLoaded', function() {
            // Game state
            let gameState = ['', '', '', '', '', '', '', '', ''];
            let currentPlayer = 'X';
            let gameActive = false;
            let isAiGame = false;
            let scores = { X: 0, O: 0, ties: 0 };
            
            const cells = document.querySelectorAll('.cell');
            const playerXInfo = document.getElementById('playerXInfo');
            const playerOInfo = document.getElementById('playerOInfo');
            const playerXScore = document.getElementById('playerXScore');
            const playerOScore = document.getElementById('playerOScore');
            const restartBtn = document.getElementById('restartBtn');
            const resultOverlay = document.getElementById('resultOverlay');
            const winnerText = document.getElementById('winnerText');
            const playAgainBtn = document.getElementById('playAgainBtn');
            const modeOverlay = document.getElementById('modeOverlay');
            const modeBtns = document.querySelectorAll('.mode-btn');
            const changeModeBtn = document.getElementById('changeModeBtn');
            const changeModeBtn2 = document.getElementById('changeModeBtn2');
            const gameContainer = document.getElementById('gameContainer');
            
            function initGame() {
                showModeSelection();
                
                cells.forEach(cell => {
                    cell.addEventListener('click', handleCellClick);
                });
                
                restartBtn.addEventListener('click', resetGame);
                playAgainBtn.addEventListener('click', resetGame);
                changeModeBtn.addEventListener('click', showModeSelection);
                changeModeBtn2.addEventListener('click', showModeSelection);
                
                modeBtns.forEach(btn => {
                    btn.addEventListener('click', selectMode);
                });
            }
            
            function showModeSelection() {
                modeOverlay.classList.add('active');
                resultOverlay.classList.remove('active');
                gameContainer.style.opacity = '0.3';
                gameContainer.style.pointerEvents = 'none';
            }
            
            function selectMode(e) {
                isAiGame = e.target.dataset.mode === 'ai';
                modeOverlay.classList.remove('active');
                gameContainer.style.opacity = '1';
                gameContainer.style.pointerEvents = 'all';
                resetGame();
            }
            
            function handleCellClick(e) {
                if (!gameActive) return;
                
                const clickedCell = e.target;
                const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
                
                if (gameState[clickedCellIndex] !== '' || !gameActive) return;
                
                makeMove(clickedCellIndex);
                
                if (isAiGame && gameActive && currentPlayer === 'O') {
                    setTimeout(() => {
                        const bestMove = findBestMove();
                        makeMove(bestMove);
                    }, 500);
                }
            }
            
            function makeMove(index) {
                gameState[index] = currentPlayer;
                cells[index].setAttribute('data-value', currentPlayer);
                
                if (checkWinner()) {
                    handleGameEnd(false);
                    return;
                }
                
                if (isBoardFull()) {
                    handleGameEnd(true);
                    return;
                }
                
                swapPlayer();
            }
            
            function checkWinner() {
                const winningConditions = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                    [0, 4, 8], [2, 4, 6]             // diagonals
                ];
                
                for (let condition of winningConditions) {
                    const [a, b, c] = condition;
                    if (
                        gameState[a] !== '' && 
                        gameState[a] === gameState[b] && 
                        gameState[a] === gameState[c]
                    ) {
                        return true;
                    }
                }
                return false;
            }
            
            function isBoardFull() {
                return !gameState.includes('');
            }
            
            function swapPlayer() {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updatePlayerInfo();
            }
            
            function updatePlayerInfo() {
                playerXInfo.classList.toggle('active', currentPlayer === 'X');
                playerOInfo.classList.toggle('active', currentPlayer === 'O');
            }
            
            function handleGameEnd(isTie) {
                gameActive = false;
                
                if (isTie) {
                    winnerText.textContent = 'Game Tied!';
                    scores.ties++;
                } else {
                    winnerText.textContent = `Player ${currentPlayer} Wins!`;
                    scores[currentPlayer]++;
                }
                
                updateScores();
                resultOverlay.classList.add('active');
            }
            
            function updateScores() {
                playerXScore.textContent = scores.X;
                playerOScore.textContent = scores.O;
            }
            
            function resetGame() {
                gameState = ['', '', '', '', '', '', '', '', ''];
                currentPlayer = 'X';
                gameActive = true;
                
                cells.forEach(cell => {
                    cell.removeAttribute('data-value');
                });
                
                updatePlayerInfo();
                resultOverlay.classList.remove('active');
                
                if (isAiGame && currentPlayer === 'O') {
                    setTimeout(() => {
                        const bestMove = findBestMove();
                        makeMove(bestMove);
                    }, 500);
                }
            }
            
            function findBestMove() {
                let bestScore = -Infinity;
                let bestMove;
                
                for (let i = 0; i < 9; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'O';
                        const score = minimax(gameState, 0, false);
                        gameState[i] = '';
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = i;
                        }
                    }
                }
                
                return bestMove;
            }
            
            function minimax(board, depth, isMaximizing) {
                // Check terminal states
                if (checkForWin(board, 'O')) return 10 - depth;
                if (checkForWin(board, 'X')) return depth - 10;
                if (!board.includes('')) return 0;
                
                if (isMaximizing) {
                    let bestScore = -Infinity;
                    for (let i = 0; i < 9; i++) {
                        if (board[i] === '') {
                            board[i] = 'O';
                            const score = minimax(board, depth + 1, false);
                            board[i] = '';
                            bestScore = Math.max(score, bestScore);
                        }
                    }
                    return bestScore;
                } else {
                    let bestScore = Infinity;
                    for (let i = 0; i < 9; i++) {
                        if (board[i] === '') {
                            board[i] = 'X';
                            const score = minimax(board, depth + 1, true);
                            board[i] = '';
                            bestScore = Math.min(score, bestScore);
                        }
                    }
                    return bestScore;
                }
            }
            
            function checkForWin(board, player) {
                const winningConditions = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                    [0, 4, 8], [2, 4, 6]             
                ];
                
                for (let condition of winningConditions) {
                    const [a, b, c] = condition;
                    if (
                        board[a] === player && 
                        board[b] === player && 
                        board[c] === player
                    ) {
                        return true;
                    }
                }
                return false;
            }
            
            initGame();
        });
