export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        console.log('MainMenu create called');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Black background
        const background = this.add.rectangle(0, 0, width, height, 0x000000);
        background.setOrigin(0);

        // Create a container for the logo group
        const logoContainer = this.add.container(width/2, height/2 - 100);

        // Add DARK text
        const darkText = this.add.text(-120, 0, 'DARK', {
            fontFamily: "'Press Start 2P'",
            fontSize: '64px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0.5);

        // Add SOLS text
        const solsText = this.add.text(120, 0, 'SOLS', {
            fontFamily: "'Press Start 2P'",
            fontSize: '64px',
            color: '#ffffff',
            align: 'left'
        }).setOrigin(0, 0.5);

        // Create a decorative sword using graphics
        const sword = this.add.graphics();
        sword.lineStyle(4, 0xFFFFFF, 1);
        
        // Draw blade
        sword.beginPath();
        sword.moveTo(0, -40);
        sword.lineTo(0, 40);
        
        // Draw crossguard
        sword.moveTo(-20, 0);
        sword.lineTo(20, 0);
        
        // Draw handle
        sword.moveTo(0, 0);
        sword.lineTo(0, 15);
        
        // Add pommel (circle at bottom)
        sword.strokeCircle(0, 20, 5);
        
        // Add to container
        logoContainer.add([darkText, solsText, sword]);

        // Enter the chain text with purple border
        const enterText = this.add.text(width/2, height/2 + 100, 'ENTER THE CHAIN', {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
            stroke: '#9945FF',
            strokeThickness: 6
        });
        enterText.setOrigin(0.5);
        enterText.setInteractive({ useHandCursor: true });
        enterText.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('IntroScene');
            });
        });

        // $DARKSOLS text at bottom
        const darksols = this.add.text(width/2, height - 50, '$DARKSOLS', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff'
        });
        darksols.setOrigin(0.5);

        // Make the enter text pulse
        this.tweens.add({
            targets: enterText,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Fix the keyboard handler
        this.input.keyboard.addKey('SPACE').on('down', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('IntroScene');
            });
        });
    }
} 