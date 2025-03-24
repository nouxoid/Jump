import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
  const canvasRef = useRef(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [obstacles, setObstacles] = useState([]);
  const [nightMode, setNightMode] = useState(false);
  const [dino, setDino] = useState({
    x: 50,
    y: 270,
    width: 40,
    height: 60,
    jumping: false,
    ducking: false,
    velocityY: 0,
    jumpCount: 0,
    legPosition: 0,
  });

  const GROUND_HEIGHT = 30;
  const GROUND_Y = 270;
  const GRAVITY = 0.7;
  const JUMP_FORCE = 15;
  const OBSTACLE_INTERVAL_INITIAL = 1500;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 300;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.background = nightMode ? '#005' : '#9cf';
      drawBackground(ctx);
      drawGround(ctx);
      if (isGameRunning) {
        updateDino();
        updateObstacles();
        obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));
        if (frameCount % 5 === 0) {
          setScore(prevScore => prevScore + 1);
        }
      }
      drawDino(ctx);
      frameCount++;
      requestAnimationFrame(gameLoop);
    };

    let frameCount = 0;
    gameLoop();
  }, [isGameRunning, obstacles, nightMode, dino]);

  const drawDino = (ctx) => {
    ctx.fillStyle = nightMode ? '#8df' : '#5a5';
    ctx.fillRect(dino.x, dino.y - dino.height, dino.width, dino.height);
    ctx.fillRect(dino.x + dino.width - 12, dino.y - dino.height - 20, 32, 25);
    ctx.fillStyle = '#fff';
    ctx.fillRect(dino.x + dino.width + 10, dino.y - dino.height - 10, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x + dino.width + 14, dino.y - dino.height - 8, 4, 4);
    dino.legPosition = (frameCount % 20) < 10 ? 0 : 10;
    if (!dino.ducking) {
      ctx.fillStyle = nightMode ? '#7cf' : '#494';
      ctx.fillRect(dino.x + 10, dino.y - 30 + dino.legPosition, 10, 30);
      ctx.fillRect(dino.x + dino.width - 15, dino.y - 30 + (dino.legPosition ? 0 : 10), 10, 30);
    }
  };

  const updateDino = () => {
    if (dino.jumping) {
      dino.velocityY += GRAVITY;
      dino.y += dino.velocityY;
      if (dino.y >= GROUND_Y) {
        dino.y = GROUND_Y;
        dino.jumping = false;
        dino.velocityY = 0;
        dino.jumpCount = 0;
        playSound('land');
      }
    }
  };

  const drawGround = (ctx) => {
    ctx.fillStyle = nightMode ? '#446' : '#a82';
    ctx.fillRect(0, GROUND_Y, 800, GROUND_HEIGHT);
    ctx.fillStyle = nightMode ? '#557' : '#b93';
    for (let i = 0; i < 800; i += 40) {
      ctx.fillRect(i, GROUND_Y, 20, 2);
    }
  };

  const drawBackground = (ctx) => {
    if (nightMode) {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37 + frameCount / 10) % 800;
        const y = 30 + Math.sin(i * 0.1) * 20;
        const size = Math.random() * 2 + 1;
        ctx.fillRect(x, y, size, size);
      }
    } else {
      ctx.fillStyle = '#fff';
      const cloudPositions = [100, 300, 600];
      for (let i = 0; i < cloudPositions.length; i++) {
        const x = (cloudPositions[i] - frameCount * 0.2) % (800 + 100) - 50;
        ctx.fillRect(x, 50, 60, 20);
        ctx.fillRect(x + 15, 40, 30, 10);
      }
    }
  };

  const drawObstacle = (ctx, obstacle) => {
    if (obstacle.type === 'bird') {
      ctx.fillStyle = nightMode ? '#f88' : '#a55';
      const wingPosition = (frameCount % 20) < 10 ? 0 : 10;
      ctx.fillRect(obstacle.x, obstacle.y - wingPosition, obstacle.width, obstacle.height / 2);
      ctx.fillRect(obstacle.x + 10, obstacle.y, obstacle.width - 20, obstacle.height);
      ctx.fillStyle = '#ff8';
      ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 10, 15, 5);
    } else {
      ctx.fillStyle = nightMode ? '#4a8' : '#080';
      if (obstacle.type === 'cactusMultiple') {
        ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, 15, obstacle.height);
        ctx.fillRect(obstacle.x + 20, obstacle.y - obstacle.height + 10, 15, obstacle.height - 10);
        ctx.fillRect(obstacle.x + 40, obstacle.y - obstacle.height + 5, 15, obstacle.height - 5);
        ctx.fillRect(obstacle.x - 5, obstacle.y - obstacle.height + 15, 10, 5);
        ctx.fillRect(obstacle.x + 25, obstacle.y - obstacle.height + 25, 10, 5);
      } else if (obstacle.type === 'cactusSmall') {
        ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
        ctx.fillRect(obstacle.x - 5, obstacle.y - obstacle.height + 10, 10, 5);
        ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y - obstacle.height + 20, 10, 5);
      } else {
        ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
        ctx.fillRect(obstacle.x - 5, obstacle.y - obstacle.height + 10, 10, 5);
        ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y - obstacle.height + 25, 10, 5);
      }
    }
  };

  const updateObstacles = () => {
    const now = Date.now();
    if (now - lastObstacleTime > OBSTACLE_INTERVAL_INITIAL) {
      createObstacle();
      lastObstacleTime = now;
      setObstacleInterval(Math.max(OBSTACLE_INTERVAL_INITIAL - (score * 5), OBSTACLE_INTERVAL_INITIAL / 3));
    }
    setObstacles(prevObstacles => {
      const newObstacles = prevObstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - speed,
      })).filter(obstacle => obstacle.x + obstacle.width >= 0);
      if (newObstacles.length < prevObstacles.length) {
        setScore(prevScore => prevScore + 10);
      }
      return newObstacles;
    });
  };

  const createObstacle = () => {
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
      default:
        width = 25;
        height = 50;
        y = GROUND_Y;
    }
    setObstacles(prevObstacles => [...prevObstacles, { x: 800, y, width, height, type }]);
  };

  const playSound = (type) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
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
  };

  const startGame = () => {
    setIsGameRunning(true);
    setScore(0);
    setObstacles([]);
    setSpeed(5);
    setDino({
      x: 50,
      y: GROUND_Y,
      width: 40,
      height: 60,
      jumping: false,
      ducking: false,
      velocityY: 0,
      jumpCount: 0,
      legPosition: 0,
    });
    setNightMode(false);
  };

  const handleKeyDown = (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (!isGameRunning) {
        startGame();
      } else {
        dino.jump();
      }
    }
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    if (!isGameRunning) {
      startGame();
    } else {
      dino.jump();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    canvasRef.current.addEventListener('touchstart', handleTouchStart);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvasRef.current.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isGameRunning, dino]);

  return (
    <canvas ref={canvasRef}></canvas>
  );
};

export default Game;
