document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const gridSizeInput = document.getElementById('grid-size');
    const startBtn = document.getElementById('start-game');
    const perceptsEl = document.getElementById('percepts');
    const goldDisplayEl = document.getElementById('gold-display');
    const messageEl = document.getElementById('message');
    const shootToggleBtn = document.getElementById('shoot-toggle');
    const screamSound = document.getElementById('scream-sound');

    let gridSize = 4;
    let grid = [];
    let playerX, playerY;
    let isGameOver = false;
    let wumpusAlive = true;
    let shootMode = false;
    let goldPoints = 0;

    function initGame() {
        gridSize = parseInt(gridSizeInput.value);
        grid = Array.from({ length: gridSize }, () => 
            Array.from({ length: gridSize }, () => ({
                stench: false,
                breeze: false,
                glitter: false,
                pit: false,
                wumpus: false,
                gold: false,
                visited: false
            }))
        );

        playerX = gridSize - 1;
        playerY = 0;
        isGameOver = false;
        wumpusAlive = true;
        shootMode = false;
        goldPoints = 3 * gridSize;
        shootToggleBtn.textContent = "Toggle Shoot Mode (Off)";
        shootToggleBtn.classList.remove('active');
        messageEl.textContent = "New Game Started!";
        
        generateMaze();
        grid[playerX][playerY].visited = true;
        renderGrid();
        updatePercepts();
        updateGoldDisplay();
    }

    function generateMaze() {
        // Place Gold Bag
        let gx, gy;
        do {
            gx = Math.floor(Math.random() * gridSize);
            gy = Math.floor(Math.random() * gridSize);
        } while (isNearStart(gx, gy));
        grid[gx][gy].gold = true;
        grid[gx][gy].glitter = true;

        // Place Wumpus
        let wx, wy;
        do {
            wx = Math.floor(Math.random() * gridSize);
            wy = Math.floor(Math.random() * gridSize);
        } while (isNearStart(wx, wy) || grid[wx][wy].gold);
        grid[wx][wy].wumpus = true;
        markNeighbors(wx, wy, 'stench');

        // Place Pits
        let pitCount = gridSize - 1;
        let placed = 0;
        while (placed < pitCount) {
            let px = Math.floor(Math.random() * gridSize);
            let py = Math.floor(Math.random() * gridSize);
            if (!isNearStart(px, py) && !grid[px][py].wumpus && !grid[px][py].gold && !grid[px][py].pit) {
                grid[px][py].pit = true;
                markNeighbors(px, py, 'breeze');
                placed++;
            }
        }
    }

    function isNearStart(x, y) {
        return Math.abs(x - (gridSize - 1)) <= 1 && Math.abs(y - 0) <= 1;
    }

    function markNeighbors(x, y, effect) {
        const dx = [0, 0, 1, -1];
        const dy = [1, -1, 0, 0];
        for (let i = 0; i < 4; i++) {
            let nx = x + dx[i];
            let ny = y + dy[i];
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                grid[nx][ny][effect] = true;
            }
        }
    }

    function renderGrid() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (grid[i][j].visited) {
                    cell.classList.add('visited');
                    
                    if (grid[i][j].wumpus && wumpusAlive) {
                        const img = document.createElement('img');
                        img.src = 'assets/wumpus.png';
                        cell.appendChild(img);
                    } else if (grid[i][j].pit) {
                        const img = document.createElement('img');
                        img.src = 'assets/pit.png';
                        cell.appendChild(img);
                    } else if (grid[i][j].gold) {
                        const img = document.createElement('img');
                        img.src = 'assets/gold.png';
                        cell.appendChild(img);
                    }

                    if (grid[i][j].stench && wumpusAlive) {
                        const img = document.createElement('img');
                        img.src = 'assets/stentch.png';
                        img.className = 'overlay top-left';
                        cell.appendChild(img);
                    }
                    if (grid[i][j].breeze) {
                        const img = document.createElement('img');
                        img.src = 'assets/breeze.png';
                        img.className = 'overlay top-right';
                        cell.appendChild(img);
                    }
                    if (grid[i][j].glitter) {
                        const img = document.createElement('img');
                        img.src = 'assets/glitter.png';
                        img.className = 'overlay bottom-right';
                        cell.appendChild(img);
                    }
                }

                if (i === playerX && j === playerY) {
                    const playerImg = document.createElement('img');
                    playerImg.src = 'assets/player.png';
                    playerImg.style.zIndex = '10';
                    cell.appendChild(playerImg);
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    function move(dir) {
        if (isGameOver) return;
        
        let nextX = playerX;
        let nextY = playerY;

        if (dir === 'w') nextX--;
        else if (dir === 'a') nextY--;
        else if (dir === 's') nextX++;
        else if (dir === 'd') nextY++;

        if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
            messageEl.textContent = "Ouch! You hit a wall.";
            return;
        }

        playerX = nextX;
        playerY = nextY;
        grid[playerX][playerY].visited = true;
        
        goldPoints -= 1; // Step consumes 1 gold point
        
        checkStatus();
        renderGrid();
        updatePercepts();
        updateGoldDisplay();
    }

    function shoot(dir) {
        if (isGameOver || !wumpusAlive) return;

        goldPoints -= 2; // Arrow consumes 2 gold points
        
        let tx = playerX;
        let ty = playerY;

        if (dir === 'w') tx--;
        else if (dir === 'a') ty--;
        else if (dir === 's') tx++;
        else if (dir === 'd') ty++;

        if (tx < 0 || tx >= gridSize || ty < 0 || ty >= gridSize) {
            messageEl.textContent = "Arrow went out of bounds!";
        } else if (grid[tx][ty].wumpus) {
            wumpusAlive = false;
            screamSound.play();
            messageEl.textContent = "You killed the Wumpus! Now find the Gold and Win!";
        } else {
            messageEl.textContent = "You missed!";
        }
        
        shootMode = false;
        shootToggleBtn.textContent = "Toggle Shoot Mode (Off)";
        shootToggleBtn.classList.remove('active');
        
        checkStatus(); // Arrow cost could trigger Game Over
        renderGrid();
        updateGoldDisplay();
    }

    function checkStatus() {
        if (isGameOver) return;

        if (goldPoints <= 0) {
            messageEl.textContent = "GAME OVER! You ran out of Gold Points!";
            isGameOver = true;
            return;
        }

        const cell = grid[playerX][playerY];
        if (cell.wumpus && wumpusAlive) {
            messageEl.textContent = "GAME OVER! You were eaten by the Wumpus!";
            isGameOver = true;
        } else if (cell.pit) {
            messageEl.textContent = "GAME OVER! You fell into a pit!";
            isGameOver = true;
        } else if (cell.gold) {
            goldPoints += 4; // Gold bag gives 4 gold points
            cell.gold = false;
            cell.glitter = false;
            messageEl.textContent = "You found a Gold Bag! +4 Points.";
            updateGoldDisplay();
        }
    }

    function updatePercepts() {
        const cell = grid[playerX][playerY];
        let p = [];
        if (cell.stench && wumpusAlive) p.push("Stench");
        if (cell.breeze) p.push("Breeze");
        if (cell.glitter) p.push("Glitter");
        
        perceptsEl.textContent = "Percepts: " + (p.length > 0 ? p.join(", ") : "None");
    }

    function updateGoldDisplay() {
        goldDisplayEl.textContent = `Gold Points: ${goldPoints}`;
        if (goldPoints <= 0) {
            goldDisplayEl.style.color = "red";
        } else {
            goldDisplayEl.style.color = "gold";
        }
    }

    // Input handlers
    startBtn.addEventListener('click', initGame);
    shootToggleBtn.addEventListener('click', () => {
        shootMode = !shootMode;
        shootToggleBtn.textContent = shootMode ? "Toggle Shoot Mode (ON)" : "Toggle Shoot Mode (Off)";
        shootToggleBtn.classList.toggle('active', shootMode);
    });

    const handleAction = (dir) => {
        if (shootMode) shoot(dir);
        else move(dir);
    };

    document.getElementById('move-up').addEventListener('click', () => handleAction('w'));
    document.getElementById('move-left').addEventListener('click', () => handleAction('a'));
    document.getElementById('move-down').addEventListener('click', () => handleAction('s'));
    document.getElementById('move-right').addEventListener('click', () => handleAction('d'));

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            handleAction(key);
        }
    });

    // Start initial game
    initGame();
});
