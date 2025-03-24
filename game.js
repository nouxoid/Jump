// Game initialization and constants
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-button');

// Canvas setup
canvas.width = 800;
canvas.height = 300;

// Game constants
const GROUND_HEIGHT = 30;
const GROUND_Y = canvas.height - GROUND_HEIGHT;
const GRAVITY = 0.7;
const JUMP_FORCE = 15;
const OBSTACLE_SPEED_INITIAL = 5;
const OBSTACLE_INTERVAL_INITIAL = 1500; // milliseconds

// Game variables
let isGameRunning = false;
let score = 0;
let highScore = 0;
let speed = OBSTACLE_SPEED_INITIAL;
let lastObstacleTime = 0;
let obstacleInterval = OBSTACLE_INTERVAL_INITIAL;
let frameCount = 0;
let nightMode = false;

// Audio context for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Dinosaur object
const dino = {
    x: 50,
    y: GROUND_Y,
    width: 40,
    height: 60,
    jumping: false,
    ducking: false,
    velocityY: 0,
    jumpCount: 0,
    legPosition: 0,
    
    // Draw dinosaur
    draw() {
        // Body
        ctx.fillStyle = nightMode ? '#8df' : '#5a5';
        ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
        
        // Head
        ctx.fillRect(this.x + this.width - 12, this.y - this.height - 20, 32, 25);
        
        // Eye
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + this.width + 10, this.y - this.height - 10, 8, 8);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + this.width + 14, this.y - this.height - 8, 4, 4);
        
        // Legs
        this.legPosition = (frameCount % 20) < 10 ? 0 : 10;
        
        if (!this.ducking) {
            ctx.fillStyle = nightMode ? '#7cf' : '#494';
            // Back leg
            ctx.fillRect(this.x + 10, this.y - 30 + this.legPosition, 10, 30);
            // Front leg
            ctx.fillRect(this.x + this.width - 15, this.y - 30 + (this.legPosition ? 0 : 10), 10, 30);
        }
    },
    
    // Update dinosaur position
    update() {
        if (this.jumping) {
            this.velocityY += GRAVITY;
            this.y += this.velocityY;
            
            if (this.y >= GROUND_Y) {
                this.y = GROUND_Y;
                this.jumping = false;
                this.velocityY = 0;
                this.jumpCount = 0;
                playSound('land');
            }
        }
    },
    
    // Make dinosaur jump
    jump() {
        if (!this.jumping && this.jumpCount < 2) {
            this.jumping = true;
            this.velocityY = -JUMP_FORCE;
            this.jumpCount++;
            playSound('jump');
        }
    },
    
    // Get dinosaur hitbox (slightly smaller than visual representation)
    getHitbox() {
        return {
            x: this.x + 5,
            y: this.y - this.height + 5,
            width: this.width - 10,
            height: this.height - 5
        };
    }
};

// Obstacles array
const obstacles = [];

// Create a new obstacle
function createObstacle() {
    const types = ['cactus', 'cactusSmall', 'cactusMultiple', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width, height, y;
    
    switch (type) {
        case 'bird':
            width = 40;
            height = 30;
            y = GROUND_Y - 50 - Math.random() * 50;
            break;
        case 'cactusSmall':
            width = 20;
            height = 40;
            y = GROUND_Y;
            break;
        case 'cactusMultiple':
            width = 60;
            height = 50;
            y = GROUND_Y;
            break;
        default: // standard cactus
            width = 25;
            height = 50;
            y = GROUND_Y;
    }
    
    obstacles.push({
        x: canvas.width,
        y,
        width,
        height,
        type
    });
}

// Draw obstacle
function drawObstacle(obstacle) {
    if (obstacle.type === 'bird') {
        // Bird
        ctx.fillStyle = nightMode ? '#f88' : '#a55';
        
        // Wings (flapping animation)
        const wingPosition = (frameCount % 20) < 10 ? 0 : 10;
        ctx.fillRect(obstacle.x, obstacle.y - wingPosition, obstacle.width, obstacle.height / 2);
        
        // Body
        ctx.fillRect(obstacle.x + 10, obstacle.y, obstacle.width - 20, obstacle.height);
        
        // Beak
        ctx.fillStyle = '#ff8';
        ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 10, 15, 5);
    } else {
        // Cactus
        ctx.fillStyle = nightMode ? '#4a8' : '#080';

        if (obstacle.type === 'cactusMultiple') {
            // Multiple cacti
            ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, 15, obstacle.height);
            ctx.fillRect(obstacle.x + 20, obstacle.y - obstacle.height + 10, 15, obstacle.height - 10);
            ctx.fillRect(obstacle.x + 40, obstacle.y - obstacle.height + 5, 15, obstacle.height - 5);
            
            // Arms
            ctx.fillRect(obstacle.x - 5, obstacle.y - obstacle.height + 15, 10, 5);
            ctx.fillRect(obstacle.x + 25, obstacle.y - obstacle.height + 25, 10, 5);
        } else if (obstacle.type === 'cactusSmall') {
            // Small cactus
            ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
            // Arms
            ctx.fillRect(obstacle.x - 5, obstacle.y - obstacle.height + 10, 10, 5);
            ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y - obstacle.height + 20, 10, 5);
        } else {
            // Standard cactus
            ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
            // Arms
            ctx.fillRect(obstacle.x - 5, obstacle.y - obstacle.height + 10, 10, 5);
            ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y - obstacle.height + 25, 10, 5);
        }
    }
}

// Update obstacles
function updateObstacles() {
    const now = Date.now();
    
    // Create new obstacle based on interval
    if (now - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = now;
        // Decrease interval as score increases (max difficulty at 1000 points)
        obstacleInterval = Math.max(
            OBSTACLE_INTERVAL_INITIAL - (score * 5),
            OBSTACLE_INTERVAL_INITIAL / 3
        );
    }
    
    // Update obstacle positions
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;
        
        // Remove obstacles that are off-screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            // Increase score when passing obstacle
            updateScore(10);
        } else if (checkCollision(obstacles[i])) {
            // Check for collision
            gameOver();
        }
    }
}

// Draw ground
function drawGround() {
    ctx.fillStyle = nightMode ? '#446' : '#a82';
    ctx.fillRect(0, GROUND_Y, canvas.width, GROUND_HEIGHT);
    
    // Ground details
    ctx.fillStyle = nightMode ? '#557' : '#b93';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, GROUND_Y, 20, 2);
    }
}

// Draw background
function drawBackground() {
    // Stars in night mode
    if (nightMode) {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37 + frameCount / 10) % canvas.width;
            const y = 30 + Math.sin(i * 0.1) * 20;
            const size = Math.random() * 2 + 1;
            ctx.fillRect(x, y, size, size);
        }
    } else {
        // Clouds in day mode
        ctx.fillStyle = '#fff';
        const cloudPositions = [100, 300, 600];
        for (let i = 0; i < cloudPositions.length; i++) {
            const x = (cloudPositions[i] - frameCount * 0.2) % (canvas.width + 100) - 50;
            ctx.fillRect(x, 50, 60, 20);
            ctx.fillRect(x + 15, 40, 30, 10);
        }
    }
}

// Check for collision between dino and obstacle
function checkCollision(obstacle) {
    const dinoBox = dino.getHitbox();
    
    // Simple box collision detection
    return (
        dinoBox.x < obstacle.x + obstacle.width &&
        dinoBox.x + dinoBox.width > obstacle.x &&
        dinoBox.y < obstacle.y &&
        dinoBox.y + dinoBox.height > obstacle.y - obstacle.height
    );
}

// Update score
function updateScore(points) {
    score += points;
    scoreElement.innerText = Math.floor(score);
    
    // Increase speed based on score
    speed = OBSTACLE_SPEED_INITIAL + Math.min(score / 500, 5);
    
    // Toggle day/night mode every 500 points
    if (Math.floor(score / 500) % 2 === 1) {
        nightMode = true;
    } else {
        nightMode = false;
    }
}

// Game over
function gameOver() {
    isGameRunning = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.innerText = `HI: ${Math.floor(highScore)}`;
    }
    
    // Show game over state
    startButton.innerText = 'RESTART';
    startButton.style.display = 'block';
    
    // Play game over sound
    playSound('gameOver');
}

// Start or restart game
function startGame() {
    isGameRunning = true;
    score = 0;
    obstacles.length = 0;
    speed = OBSTACLE_SPEED_INITIAL;
    obstacleInterval = OBSTACLE_INTERVAL_INITIAL;
    lastObstacleTime = Date.now();
    dino.y = GROUND_Y;
    dino.jumping = false;
    dino.velocityY = 0;
    nightMode = false;
    
    scoreElement.innerText = '0';
    startButton.style.display = 'none';
    
    // Start game loop if it's not already running
    if (!animationId) {
        gameLoop();
    }
}

// Play sound effects
function playSound(type) {
    // Create oscillator
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Set sound parameters based on type
    switch (type) {
        case 'jump':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'land':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.07, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'gameOver':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
            break;
    }
}

// Main game loop
let animationId;
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background color based on day/night mode
    canvas.style.background = nightMode ? '#005' : '#9cf';
    
    // Draw game elements
    drawBackground();
    drawGround();
    
    if (isGameRunning) {
        // Update game state
        dino.update();
        updateObstacles();
        
        // Draw obstacles
        obstacles.forEach(drawObstacle);
        
        // Auto-increase score over time
        if (frameCount % 5 === 0) {
            updateScore(1);
        }
    }
    
    // Always draw the dino
    dino.draw();
    
    // Increment frame counter
    frameCount++;
    
    // Continue animation loop
    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        
        if (!isGameRunning) {
            startGame();
        } else {
            dino.jump();
        }
    }
});

// Mobile touch controls
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    
    if (!isGameRunning) {
        startGame();
    } else {
        dino.jump();
    }
});

// Initialize high score from localStorage if available
if (localStorage.getItem('dinoHighScore')) {
    highScore = parseInt(localStorage.getItem('dinoHighScore'));
    highScoreElement.innerText = `HI: ${highScore}`;
}

// Save high score when leaving page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('dinoHighScore', highScore);
});

// Start initial animation loop
gameLoop();
