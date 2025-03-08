// Game variables
const playBoard = document.querySelector(".play-board");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const controls = document.querySelectorAll(".control-btn");
const startMessage = document.querySelector(".start-message");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsBtn = document.getElementById("close-settings");
const snakeColorOptions = document.querySelectorAll(".snake-color");
const foodColorOptions = document.querySelectorAll(".food-color");
const bgColorOptions = document.querySelectorAll(".bg-color");

let gameOver = false;
let gameStarted = false;
let foodX, foodY;
let snakeX = 10, snakeY = 10; // Start more centrally
// Initialize snake with 3 body segments
let snakeBody = [
    [snakeX, snakeY], // Head
    [snakeX - 1, snakeY], // Body segment 1
    [snakeX - 2, snakeY]  // Body segment 2
];
let velocityX = 0, velocityY = 0;
let setIntervalId;
let score = 0;

// Color settings
let snakeColor = "#4CAF50";
let snakeHeadColor = "#2E7D32";
let foodColor = "#fdbb2d";
let boardColor = "#1a2a6c";

// Load saved colors from localStorage if available
function loadSavedColors() {
    const savedSnakeColor = localStorage.getItem("snake-color");
    const savedFoodColor = localStorage.getItem("food-color");
    const savedBoardColor = localStorage.getItem("board-color");
    
    if (savedSnakeColor) {
        snakeColor = savedSnakeColor;
        updateSelectedColor(snakeColorOptions, savedSnakeColor);
        document.documentElement.style.setProperty('--snake-color', savedSnakeColor);
        
        // Calculate a darker shade for the snake head
        const darkerShade = getDarkerShade(savedSnakeColor);
        snakeHeadColor = darkerShade;
        document.documentElement.style.setProperty('--snake-head-color', darkerShade);
    }
    
    if (savedFoodColor) {
        foodColor = savedFoodColor;
        updateSelectedColor(foodColorOptions, savedFoodColor);
        document.documentElement.style.setProperty('--food-color', savedFoodColor);
    }
    
    if (savedBoardColor) {
        boardColor = savedBoardColor;
        updateSelectedColor(bgColorOptions, savedBoardColor);
        document.documentElement.style.setProperty('--board-color', savedBoardColor);
    }
}

// Helper function to get a darker shade of a color
function getDarkerShade(hexColor) {
    // Convert hex to RGB
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);
    
    // Make it darker
    r = Math.max(0, Math.floor(r * 0.7));
    g = Math.max(0, Math.floor(g * 0.7));
    b = Math.max(0, Math.floor(b * 0.7));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Update the selected color in the UI
function updateSelectedColor(options, selectedColor) {
    options.forEach(option => {
        if (option.dataset.color === selectedColor) {
            option.classList.add("selected");
        } else {
            option.classList.remove("selected");
        }
    });
}

// Retrieve high score from local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = highScore;

// Function to update food position
const changeFoodPosition = () => {
    // Generate random positions between 1-28 for food (to keep it away from edges)
    foodX = Math.floor(Math.random() * 26) + 2;
    foodY = Math.floor(Math.random() * 26) + 2;
    
    // Make sure food doesn't spawn on snake body
    for (let segment of snakeBody) {
        if (segment[0] === foodX && segment[1] === foodY) {
            // If food spawns on snake, try again
            return changeFoodPosition();
        }
    }
}

// Function to handle game over
const handleGameOver = () => {
    clearInterval(setIntervalId);
    
    // Add game over overlay
    const gameOverHTML = `
        <div class="game-over">
            <h2>Game Over!</h2>
            <p>Your score: ${score}</p>
            <button id="restart-btn">Play Again</button>
        </div>
    `;
    
    playBoard.innerHTML += gameOverHTML;
    
    // Add event listener to restart button
    document.getElementById("restart-btn").addEventListener("click", () => {
        location.reload();
    });
}

// Function to change direction based on key press
const changeDirection = (e) => {
    if (!gameStarted) return; // Only change direction if game has started
    
    // Changing direction based on key press
    if(e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if(e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if(e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if(e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// Function to start the game
function startGame() {
    if (gameStarted) return; // Don't start if already started
    
    gameStarted = true;
    // Hide start message
    startMessage.style.display = "none";
    
    // Set initial direction (going right)
    velocityX = 1;
    velocityY = 0;
    
    // Add a subtle animation to the game board
    playBoard.style.animation = "pulse 2s";
}

// Function to update score
function updateScore() {
    score++;
    // Add score animation
    scoreElement.classList.add("score-updated");
    setTimeout(() => {
        scoreElement.classList.remove("score-updated");
    }, 300);
    
    // Update high score if needed
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = score;
    highScoreElement.innerText = highScore;
}

// Initialize game
const initGame = () => {
    if(gameOver) return handleGameOver();

    let htmlMarkup = "";
    
    // Update snake position if game has started
    if(gameStarted) {
        // Check if snake ate food - do this BEFORE updating position
        if(snakeX === foodX && snakeY === foodY) {
            updateScore();
            // Add new segment at the end (will be properly positioned in next frame)
            snakeBody.push([...snakeBody[snakeBody.length - 1]]);
            changeFoodPosition();
        }
        
        // Update snake position
        snakeX += velocityX;
        snakeY += velocityY;
        
        // Shift snake body elements forward
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = [...snakeBody[i - 1]];
        }
        
        snakeBody[0] = [snakeX, snakeY]; // Update head position
        
        // Check if snake hit the wall
        if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
            gameOver = true;
            return handleGameOver();
        }
        
        // Check if snake hit itself
        for (let i = 1; i < snakeBody.length; i++) {
            if (snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
                gameOver = true;
                return handleGameOver();
            }
        }
    }
    
    // Create food element
    htmlMarkup += `<div class="food" style="left: calc(${foodX * 3.333}% - 1%); top: calc(${foodY * 3.333}% - 1%);"></div>`;
    
    // Add snake body elements
    for (let i = 0; i < snakeBody.length; i++) {
        // Add class for snake head to the first element
        const className = i === 0 ? "snake-head" : "snake";
        htmlMarkup += `<div class="${className}" style="left: calc(${snakeBody[i][0] * 3.333}% - 1%); top: calc(${snakeBody[i][1] * 3.333}% - 1%);"></div>`;
    }
    
    playBoard.innerHTML = htmlMarkup;
}

// Key event handler - for starting game and changing direction
function handleKeyDown(e) {
    // Prevent default behavior for arrow keys to avoid page scrolling
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
    }
    
    if (!gameStarted && 
        (e.key === "ArrowUp" || e.key === "ArrowDown" || 
         e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ")) {
        startGame();
    }
    
    changeDirection(e);
}

// Button click handler - for starting game and changing direction
function handleButtonClick(key) {
    if (!gameStarted) {
        startGame();
    }
    
    changeDirection({ key: key.dataset.key });
}

// Settings panel handlers
settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.add("active");
});

closeSettingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("active");
    
    // Save color settings to localStorage
    localStorage.setItem("snake-color", snakeColor);
    localStorage.setItem("food-color", foodColor);
    localStorage.setItem("board-color", boardColor);
});

// Color option click handlers
snakeColorOptions.forEach(option => {
    option.addEventListener("click", () => {
        const color = option.dataset.color;
        snakeColor = color;
        
        // Calculate a darker shade for the snake head
        snakeHeadColor = getDarkerShade(color);
        
        // Update CSS variables
        document.documentElement.style.setProperty('--snake-color', color);
        document.documentElement.style.setProperty('--snake-head-color', snakeHeadColor);
        
        // Update selected state
        updateSelectedColor(snakeColorOptions, color);
    });
});

foodColorOptions.forEach(option => {
    option.addEventListener("click", () => {
        const color = option.dataset.color;
        foodColor = color;
        
        // Update CSS variable
        document.documentElement.style.setProperty('--food-color', color);
        
        // Update selected state
        updateSelectedColor(foodColorOptions, color);
    });
});

bgColorOptions.forEach(option => {
    option.addEventListener("click", () => {
        const color = option.dataset.color;
        boardColor = color;
        
        // Update CSS variable
        document.documentElement.style.setProperty('--board-color', color);
        
        // Update selected state
        updateSelectedColor(bgColorOptions, color);
    });
});

// Initialize food position
changeFoodPosition();

// Load saved colors
loadSavedColors();

// Render initial snake without movement
initGame();

// Set game speed (adjust as needed - lower is faster)
setIntervalId = setInterval(initGame, 100); // Slightly faster for more responsive feel

// Set up event listeners
document.addEventListener("keydown", handleKeyDown);

// Update control buttons to also start the game
controls.forEach(key => {
    key.removeEventListener("click", key.clickHandler); // Remove any existing handlers first
    key.clickHandler = () => handleButtonClick(key); // Store handler reference
    key.addEventListener("click", key.clickHandler);
});

// Add touch support for mobile devices
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    // Start game on first swipe if not already started
    if (!gameStarted) {
        startGame();
    }

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && velocityX !== 1) {
            // Swipe left
            velocityX = -1;
            velocityY = 0;
        } else if (xDiff < 0 && velocityX !== -1) {
            // Swipe right
            velocityX = 1;
            velocityY = 0;
        }
    } else {
        if (yDiff > 0 && velocityY !== 1) {
            // Swipe up
            velocityX = 0;
            velocityY = -1;
        } else if (yDiff < 0 && velocityY !== -1) {
            // Swipe down
            velocityX = 0;
            velocityY = 1;
        }
    }
    
    xDown = null;
    yDown = null;
    
    // Prevent scrolling when playing the game
    evt.preventDefault();
} 