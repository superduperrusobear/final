import config from './config.js';

let game = null;
let gameStarted = false;

function startGame() {
    if (gameStarted) return; // Prevent multiple starts
    gameStarted = true;

    // Get elements
    const titleScreen = document.getElementById('title-screen');
    const gameContainer = document.getElementById('game-container');
    
    // Hide title screen with fade
    titleScreen.style.opacity = '0';
    setTimeout(() => {
        titleScreen.style.display = 'none';
        
        // Show and fade in game container
        gameContainer.style.display = 'block';
        requestAnimationFrame(() => {
            gameContainer.classList.add('visible');
            
            // Create game instance if it doesn't exist
            if (!game) {
                game = new Phaser.Game(config);
                // Start with MainMenuScene
                game.scene.start('MainMenu');
            }
        });
    }, 500);
}

// Wait for DOM to be fully loaded
window.addEventListener('load', () => {
    const startButton = document.getElementById('start-button');
    
    // Add click handler
    startButton.addEventListener('click', (e) => {
        e.preventDefault();
        startGame();
    });
    
    // Add space key handler
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !gameStarted) {
            startGame();
        }
    });
}); 