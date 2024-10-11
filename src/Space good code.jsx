import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Space.css'; // Optional: Add styles if needed

const Space = () => {
    const navigate = useNavigate();
    // Game variables
    const tileSize = 32;
    const rows = 16;
    const columns = 16;

    const boardWidth = tileSize * columns;
    const boardHeight = tileSize * rows;

    const canvasRef = useRef(null);
    
    // Ship properties
    let shipWidth = tileSize * 2;
    let shipHeight = tileSize;
    let shipX = (tileSize * columns) / 2 - tileSize;
    let shipY = tileSize * rows - tileSize * 2;

    let shipImg = new Image();
    shipImg.src = "./ship.png";
    const shootSound = new Audio('./laserShoot.mp3');
    const impactSound = new Audio('./explosionShip.mp3');

    let shipVelocityX = tileSize;

    // Aliens
    let alienArray = [];
    let alienWidth = tileSize * 2;
    let alienHeight = tileSize;
    let alienImg = new Image();
    alienImg.src = "./alien.png";
    const explosionSound = new Audio('./explosion.mp3');

    let alienRows = 2;
    let alienColumns = 3;
    let alienCount = 0;
    let alienVelocityX = 1;

    // Bullets
    let bulletArray = [];
    let bulletVelocityY = -10;

    let score = 0;
    
    // State for game over
    const [gameOver, setGameOver] = useState(false);

   useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        shipImg.onload = () => {
            createAliens();
            requestAnimationFrame(update);
        };

        document.addEventListener("keydown", moveShip);
        document.addEventListener("keyup", shoot);

        return () => {
            document.removeEventListener("keydown", moveShip);
            document.removeEventListener("keyup", shoot);
        };
        
   }, []);

   function getRandomVolume() {
       return Math.random() * (1 - 0.7) + 0.7; // Random volume between 0.7 and 1.0
   }

   function getRandomPitch() {
       const minPitch = 0.894; // Decrease pitch by one whole tone (2 semitones)
       const maxPitch = 1.122; // Increase pitch by one whole tone (2 semitones)
       return Math.random() * (maxPitch - minPitch) + minPitch; // Random pitch between min and max
   }

   function update() {
       if (gameOver) {
           return;
       }

       const context = canvasRef.current.getContext("2d");
       context.clearRect(0, 0, boardWidth, boardHeight);

       context.drawImage(shipImg, shipX, shipY, shipWidth, shipHeight);

       for (let i = 0; i < alienArray.length; i++) {
           const alien = alienArray[i];
           if (alien.alive) {
               alien.x += alienVelocityX;

               if (alien.x + alien.width >= boardWidth || alien.x <= 0) {
                   alienVelocityX *= -1;
                   alien.x += alienVelocityX * 2;

                   for (let j = 0; j < alienArray.length; j++) {
                       alienArray[j].y += alienHeight;
                   }
               }
               context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

               if (alien.y >= shipY) {
                   impactSound.volume = getRandomVolume(); // Set random volume
                   impactSound.playbackRate = getRandomPitch(); // Set random pitch
                   impactSound.currentTime = 0; // Reiniciar el sonido si ya ha terminado
                   impactSound.play(); // Reproducir el sonido de impacto
                   setGameOver(true); // Cambia a setGameOver
               }
           }
       }

       for (let i = 0; i < bulletArray.length; i++) {
           const bullet = bulletArray[i];
           bullet.y += bulletVelocityY;
           context.fillStyle="white";
           context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

           for (let j = 0; j < alienArray.length; j++) {
               const alien = alienArray[j];
               if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                   bullet.used = true;
                   alien.alive = false;

                   explosionSound.volume = getRandomVolume(); // Set random volume
                   explosionSound.playbackRate = getRandomPitch(); // Set random pitch
                   explosionSound.currentTime = 0; // Reiniciar el sonido si ya ha terminado
                   explosionSound.play(); // Reproducir el sonido de explosión
                   
                   alienCount--;
                   score += 100;
               }
           }
       }

       while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
           bulletArray.shift();
       }

       if (alienCount === 0) {
           score += alienColumns * alienRows * 100;
           increaseAlienDifficulty();
           createAliens();
       }

       context.fillStyle = "yellow";
       context.font = "16px 'Press Start 2P'"; // Configura la fuente
       context.fillText(score.toString(), 5, 20);

       requestAnimationFrame(update);
   }

   function increaseAlienDifficulty() {
       alienColumns++;
       if (alienColumns > columns / 2 - 2) { 
           alienColumns = columns / 2 - 2; 
       }
       alienRows++;
       if (alienRows > rows - 4) { 
           alienRows = rows - 4; 
       }
   }

   function moveShip(e) {
       if (gameOver) return;

       if (e.code === "ArrowLeft" && shipX - shipVelocityX >= 0) {
           shipX -= shipVelocityX;
       } else if (e.code === "ArrowRight" && shipX + shipVelocityX + shipWidth <= boardWidth) {
           shipX += shipVelocityX;
       }
   }

   function createAliens() {
       alienArray.length = 0;
       for (let c = 0; c < alienColumns; c++) {
           for (let r = 0; r < alienRows; r++) {
               const alien = {
                   img: alienImg,
                   x: c * (tileSize * 2),
                   y: r * tileSize,
                   width: alienWidth,
                   height: alienHeight,
                   alive: true,
               };
               alienArray.push(alien);
           }
       }
       alienCount = alienArray.length;
   }

   function shoot(e) {
        if (gameOver) return;

        if (e.code === "Space") {
            shootSound.volume = getRandomVolume(); // Set random volume
            shootSound.playbackRate = getRandomPitch(); // Set random pitch
            shootSound.currentTime = 0; // Reiniciar el sonido si ya ha terminado
            shootSound.play();

            const bullet = {
                x: shipX + shipWidth / 2 - tileSize / 16,
                y: shipY,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false,
            };
            bulletArray.push(bullet);
        }
   }

   function detectCollision(a, b) {
       return (
           a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y
       );
   }

   return (
    <div className="game-container">
      <canvas ref={canvasRef} width={boardWidth} height={boardHeight} />
      {gameOver && (
        <div className="game-over">
          <h1>Game Over</h1>
          <div>
          <button onClick={() => window.location.reload()}>Reiniciar</button>
          <button onClick={() => navigate('/')}>Pantalla Principal</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Space;