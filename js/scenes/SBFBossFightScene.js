import { Player } from '../entities/Player.js';

export class SBFBossFightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SBFBossFightScene' });
        this.initializeGameState();
    }

    initializeGameState() {
        // Core game objects
        this.player = null;
        this.boss = null;
        this.ground = null;
        this.playerHealthBar = null;
        this.bossHealthBar = null;
        this.staminaBar = null;
        this.flaskText = null;
        this.bossNameText = null;

        // Health and combat stats
        this.playerHealth = 100;
        this.bossHealth = 100;
        this.maxHealth = 100;
        this.hitsToWin = 20;
        this.damagePerHit = Math.ceil(100 / this.hitsToWin);
        this.bossDamageMultiplier = 1.12;

        // Boss damage calculation for 4-hit kill
        this.bossBaseDamage = Math.ceil(this.maxHealth / 4);

        // Flask system
        this.flasks = 3;
        this.healAmount = 30;
        this.isHealing = false;

        // Combat timers and states
        this.lastAttackTime = 0;
        this.attackDelay = 150;
        this.bossAttackDelay = 250;
        this.lastCollisionTime = 0;
        this.collisionCooldown = 1000;
        this.isRolling = false;
        this.canAttack = true;
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.attackCooldown = 500;
        this.rollCooldown = 800;
        this.chargeTime = 1000;
        
        // Boss combat states
        this.bossAttackCooldown = false;
        this.bossAttackRange = 200;
        this.isAttackWarning = false;
        this.attackWarningTime = 800;
        this.attackPattern = ['quick', 'quick', 'heavy'];
        this.currentPatternIndex = 0;
        this.lastBossAttackTime = 0;

        // Stamina system
        this.maxStamina = 4;
        this.currentStamina = 4;
        this.staminaRechargeTime = 3800;
        this.lastStaminaRecharge = 0;

        // Game state flags
        this.isGameOver = false;
        this.isBossDead = false;
    }

    preload() {
        this.load.image('arena', './assets/backgrounds/ftxa.jpg');
        // Add ALL required knight sprites
        this.load.spritesheet('knight_idle', './assets/sprites/knight2/IDLE.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_run', './assets/sprites/knight2/RUN.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_walk', './assets/sprites/knight2/WALK.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack1', './assets/sprites/knight2/ATTACK 1.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack2', './assets/sprites/knight2/ATTACK 2.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack3', './assets/sprites/knight2/ATTACK 3.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_hurt', './assets/sprites/knight2/HURT.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_dead', './assets/sprites/knight2/DEATH.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_jump', './assets/sprites/knight2/JUMP.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_defend', './assets/sprites/knight2/DEFEND.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.image('boss', './assets/characters/sbf.png');
        this.load.image('deathText', './assets/ui/text/youvedied.png');
        this.load.image('victoryText', './assets/ui/text/sam bankmanfried hasfallen.png');
    }

    create() {
        // Initialize game state first
        this.initializeGameState();
        
        // Then set up the scene
        this.setupArena();
        this.createGameElements();
        this.setupInitialState();
        this.createBossNameText();
        
        // Reset combat states
        this.canAttack = true;
        this.bossAttackCooldown = false;
        this.isAttackWarning = false;
        this.isRolling = false;
        this.isHealing = false;
        this.isCharging = false;
        this.isGameOver = false;
        this.isBossDead = false;
        
        // Reset health and resources
        this.playerHealth = this.maxHealth;
        this.bossHealth = this.maxHealth;
        this.flasks = 3;
        this.currentStamina = this.maxStamina;
        
        // Reset timers
        this.lastAttackTime = 0;
        this.lastBossAttackTime = 0;
        this.lastCollisionTime = 0;
        this.lastStaminaRecharge = 0;
        
        // Reset pattern
        this.currentPatternIndex = 0;
        
        // Update UI
        this.updateHealthBars();
        this.updateStaminaBar();
        this.updateFlaskUI();

        // Enable physics
        if (this.player && this.boss) {
            this.player.body.enable = true;
            this.boss.body.enable = true;
        }
    }

    setupArena() {
        const { width, height } = this.cameras.main;
        const arena = this.add.image(width/2, height/2, 'arena');
        arena.setDisplaySize(width, height);
        arena.setDepth(0);
    }

    createGameElements() {
        this.createGround();
        this.createPlayer();
        this.createBoss();
        this.setupControls();
        this.createUI();
    }

    setupInitialState() {
        // Set positions
        this.player.setPosition(200, 580);
        this.boss.setPosition(1000, 580);
        
        // Reset states
        [this.player, this.boss].forEach(sprite => {
            sprite.setVelocity(0, 0);
            sprite.clearTint();
            sprite.setAlpha(1);
        });
    }

    createBossNameText() {
        const width = this.cameras.main.width;
        this.bossNameText = this.add.text(930, 20, 'Sam Bankman-Fried', {
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#ffffff'
        });
        this.bossNameText.setDepth(5);
    }

    createGround() {
        // Create a solid ground that spans the width of the game
        this.ground = this.physics.add.staticGroup();
        
        // Move ground up slightly to match the visual baseline
        const groundY = 650; // Adjusted from 680 to 650
        this.ground.create(640, groundY, 'ground')
            .setScale(20, 1)
            .setDisplaySize(1280, 40)
            .setAlpha(0) // Make the ground invisible
            .refreshBody();
    }

    createPlayer() {
        // Create player using the Player class
        this.player = new Player(this, 200, 580);
        this.player.setScale(2.8);  // Make the player 2.8 times bigger
        this.physics.add.collider(this.player, this.ground);
    }

    createBoss() {
        this.boss = this.physics.add.sprite(1000, 580, 'boss');
        this.boss.setCollideWorldBounds(true);
        this.boss.setBounce(0);
        this.boss.setDragX(1500);
        this.boss.setGravityY(1000);
        this.boss.setAlpha(1); // Set initial opacity to 1
        
        // Adjust hitbox to better match the boss
        this.boss.setSize(48, 64);
        
        // Add collision with ground
        this.physics.add.collider(this.boss, this.ground);
        
        // Add overlap for knockback only (no damage)
        this.physics.add.overlap(this.player, this.boss, this.handlePlayerBossCollision, null, this);
    }

    setupControls() {
        // AD keys for movement
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Add flask healing (F key)
        this.healKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        // Mouse controls
        this.input.mouse.disableContextMenu();
        
        // Left click (quick/charged attack)
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.canAttack) {
                this.isCharging = true;
                this.chargeStartTime = this.time.now;
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.isCharging) {
                const chargeLength = this.time.now - this.chargeStartTime;
                if (chargeLength >= this.chargeTime) {
                    this.playerHeavyAttack();
                } else {
                    this.playerQuickAttack();
                }
                this.isCharging = false;
            }
        });
        
        // Right click (roll)
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown() && !this.isRolling) {
                this.startRoll();
            }
        });
    }

    update() {
        if (!this.player.body || !this.boss.body) return;

        // Update player animations
        this.player.update();

        // Handle stamina recharge
        if (this.currentStamina < this.maxStamina && 
            this.time.now - this.lastStaminaRecharge >= this.staminaRechargeTime) {
            this.currentStamina = this.maxStamina;
            this.updateStaminaBar();
            this.lastStaminaRecharge = this.time.now;
        }

        // Player movement
        this.handlePlayerMovement();
        
        // Boss AI
        this.updateBoss();
    }

    handlePlayerMovement() {
        if (this.isRolling || this.isHealing) return;

        const onGround = this.player.body.touching.down;
        
        // AD movement
        if (this.keyA.isDown) {
            this.player.setVelocityX(-300);
            this.player.setFlipX(true);
        } else if (this.keyD.isDown) {
            this.player.setVelocityX(300);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        // Jump with space
        if (this.spaceKey.isDown && onGround) {
            this.player.jump();
        }

        // Handle flask healing with F key
        if (this.healKey.isDown && !this.isHealing && this.flasks > 0 && this.playerHealth < this.maxHealth) {
            this.startHealing();
        }
    }

    playerQuickAttack() {
        const currentTime = this.time.now;
        if (currentTime - this.lastAttackTime < this.attackDelay) return;
        
        this.lastAttackTime = currentTime;
        this.canAttack = false;
        
        // Play attack animation
        this.player.attack();
        
        this.executeAttack(this.damagePerHit, 40, 0xff0000);
        
        this.time.delayedCall(this.attackCooldown, () => {
            this.canAttack = true;
        });
    }

    playerHeavyAttack() {
        this.canAttack = false;
        
        // Play attack animation
        this.player.attack();
        
        this.executeAttack(this.damagePerHit * 2, 60, 0xff6600);
        
        this.time.delayedCall(this.attackCooldown * 2, () => {
            this.canAttack = true;
        });
    }

    executeAttack(damage, range, color) {
        const attackDirection = this.player.flipX ? -1 : 1;
        const attackBox = new Phaser.Geom.Rectangle(
            this.player.x + (range * attackDirection) - (range/2),
            this.player.y - (range/2),
            range,
            range
        );
        
        // Check for boss hit using invisible rectangle
        if (Phaser.Geom.Rectangle.Overlaps(
            attackBox,
            this.boss.getBounds()
        )) {
            this.damageBoss(damage);
        }
    }

    startRoll() {
        if (this.isRolling || this.currentStamina <= 0) return;
        
        // Play roll animation
        this.player.roll();
        
        // Decrease stamina
        this.currentStamina--;
        this.isRolling = true;
        
        // Update stamina bar immediately
        this.updateStaminaBar();
        
        const rollDirection = this.player.flipX ? -1 : 1;
        this.player.setVelocityX(400 * rollDirection);
        
        // Roll duration
        this.time.delayedCall(400, () => {
            this.isRolling = false;
        });

        // Start recharge timer if we're at 0 stamina
        if (this.currentStamina === 0) {
            this.lastStaminaRecharge = this.time.now;
        }
    }

    handlePlayerBossCollision() {
        const currentTime = this.time.now;
        // Only handle knockback if player is not rolling
        if (!this.isRolling && currentTime - this.lastCollisionTime >= this.collisionCooldown) {
            this.lastCollisionTime = currentTime;
            
            // Only knockback, no damage
            const knockbackDirection = this.player.x < this.boss.x ? -1 : 1;
            this.player.setVelocityX(150 * knockbackDirection);
        }
    }

    updateBoss() {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.boss.x, this.boss.y,
            this.player.x, this.player.y
        );

        if (distanceToPlayer > this.bossAttackRange) {
            // Move towards player faster
            const direction = this.player.x < this.boss.x ? -1 : 1;
            this.boss.setVelocityX(200 * direction); // Increased speed
            this.boss.setFlipX(direction === -1);
        } else {
            // Stop and attack when in range
            this.boss.setVelocityX(0);
            this.bossAttack();
        }
    }

    bossAttack() {
        const currentTime = this.time.now;
        if (this.bossAttackCooldown || this.isAttackWarning || 
            currentTime - this.lastBossAttackTime < this.bossAttackDelay) return;
        
        this.lastBossAttackTime = currentTime;
        this.isAttackWarning = true;
        
        // Only show boss glow as warning
        this.tweens.add({
            targets: this.boss,
            tint: { from: 0xff0000, to: 0xffffff },
            duration: 200,
            yoyo: true,
            repeat: 2,
            onUpdate: () => {
                this.boss.setAlpha(1);
            }
        });

        // Execute attack after warning
        this.time.delayedCall(this.attackWarningTime, () => {
            this.boss.clearTint();
            this.boss.setAlpha(1);
            this.executeBossAttack(this.attackPattern[this.currentPatternIndex]);
        });
    }

    executeBossAttack(attackType, warningBox) {
        this.isAttackWarning = false;
        this.bossAttackCooldown = true;

        // Remove warning box if it exists
        if (warningBox) {
            warningBox.destroy();
        }

        // Create invisible attack hitbox
        const attackBox = new Phaser.Geom.Rectangle(
            this.boss.x + (this.boss.flipX ? -150 : 50),
            this.boss.y - 100,
            250,
            200
        );

        // Check for player hit if not rolling
        if (!this.isRolling && Phaser.Geom.Rectangle.Overlaps(
            attackBox,
            this.player.getBounds()
        )) {
            const damage = attackType === 'heavy' ? 20 : 12;
            this.damagePlayer(damage);
        }

        // Update pattern index
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.attackPattern.length;

        // Reset cooldown after delay
        const cooldownTime = attackType === 'heavy' ? 2000 : 1500;
        this.time.delayedCall(cooldownTime, () => {
            this.bossAttackCooldown = false;
        });
    }

    createAtmosphere() {
        // Add particle effects for the ruined hall
        const particles = this.add.particles('slash');
        
        particles.createEmitter({
            x: { min: 0, max: 1280 },
            y: -10,
            lifespan: 4000,
            speedY: { min: 50, max: 100 },
            scale: { start: 0.1, end: 0 },
            quantity: 1,
            blendMode: 'ADD'
        });
    }

    createUI() {
        // Player health bar with improved styling - smaller size
        const playerBarBg = this.add.graphics();
        playerBarBg.fillStyle(0x000000, 0.8);
        playerBarBg.lineStyle(2, 0xff0000, 0.3);
        playerBarBg.strokeRoundedRect(48, 18, 154, 20, 6);
        playerBarBg.fillRoundedRect(50, 20, 150, 16, 6);
        playerBarBg.setDepth(1);

        // Create player health bar with graphics
        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setDepth(1);

        // Create stamina bar - smaller and closer to health bar with green color
        const staminaBarBg = this.add.graphics();
        staminaBarBg.fillStyle(0x000000, 0.8);
        staminaBarBg.lineStyle(2, 0x006400, 0.3);
        staminaBarBg.strokeRoundedRect(48, 42, 154, 20, 6);
        staminaBarBg.fillRoundedRect(50, 44, 150, 16, 6);
        staminaBarBg.setDepth(1);

        // Create stamina bar
        this.staminaBar = this.add.graphics();
        this.staminaBar.setDepth(1);
        
        // Create flask counter text - larger and more visible
        this.flaskText = this.add.text(50, 68, 'FLASKS: ' + this.flasks, {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { blur: 2, stroke: true, fill: true }
        }).setDepth(1);

        // Boss health bar setup
        const bossNameBg = this.add.rectangle(930, 15, 300, 30, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(1);
        
        const bossName = this.add.text(1080, 20, 'Sam Bankman-Fried', {
            fontFamily: 'Micro 5',
            fontSize: '20px',
            color: '#ffffff'
        })
        .setOrigin(0.5, 0)
        .setDepth(2);

        const barBg = this.add.graphics();
        barBg.fillStyle(0x000000, 0.8);
        barBg.lineStyle(2, 0xff0000, 1);
        barBg.strokeRoundedRect(928, 48, 304, 34, 10);
        barBg.fillRoundedRect(930, 50, 300, 30, 10);
        barBg.setDepth(1);

        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.setDepth(1);
        
        // Update both bars
        this.updateHealthBars();
        this.updateStaminaBar();

        // Create a visible container box in the purple area
        const containerWidth = 1200;
        const containerHeight = 60;
        const containerY = this.cameras.main.height + 100;

        // Add visible container box with white border
        const containerBox = this.add.rectangle(
            this.cameras.main.width / 2,
            containerY,
            containerWidth,
            containerHeight,
            0x000000,
            0.5
        );
        containerBox.setStrokeStyle(2, 0xffffff);
        containerBox.setDepth(10);

        // Controls text
        const controlsText = [
            'A/D: Move',
            'LEFT CLICK: Attack',
            'HOLD LEFT: Heavy',
            'RIGHT CLICK: Roll',
            'F: Heal'
        ];

        // Position controls inside the container box
        const spacing = containerWidth / (controlsText.length + 1);
        controlsText.forEach((control, index) => {
            const text = this.add.text(
                (spacing * (index + 1)),
                containerY,
                control,
                {
                    fontFamily: "'Press Start 2P'",
                    fontSize: '24px',
                    color: '#ffffff'
                }
            )
            .setOrigin(0.5)
            .setDepth(11);  // Above the container
        });
    }

    updateHealthBars() {
        // Update player health bar with glow effect - adjusted for new size
        this.playerHealthBar.clear();
        
        // Glow effect (darker red)
        this.playerHealthBar.fillStyle(0x660000);
        this.playerHealthBar.fillRoundedRect(50, 20, 150, 16, 6);
        
        // Actual health bar (bright red with glow)
        this.playerHealthBar.fillStyle(0xff0000);
        const playerHealthWidth = (this.playerHealth / this.maxHealth) * 150;
        if (playerHealthWidth > 0) {
            this.playerHealthBar.fillRoundedRect(50, 20, playerHealthWidth, 16, 6);
        }

        // Boss health bar update (unchanged)
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x660000);
        this.bossHealthBar.fillRoundedRect(930, 50, 300, 30, 10);
        this.bossHealthBar.fillStyle(0xff0000);
        const bossHealthWidth = (this.bossHealth / this.maxHealth) * 300;
        if (bossHealthWidth > 0) {
            this.bossHealthBar.fillRoundedRect(930, 50, bossHealthWidth, 30, 10);
        }
    }

    updateStaminaBar() {
        if (!this.staminaBar) return;
        
        this.staminaBar.clear();
        
        // Glow effect (darker green)
        this.staminaBar.fillStyle(0x003300);
        this.staminaBar.fillRoundedRect(50, 44, 150, 16, 6);
        
        // Actual stamina bar (dark green)
        this.staminaBar.fillStyle(0x006400);
        const staminaWidth = (this.currentStamina / this.maxStamina) * 150;
        if (staminaWidth > 0) {
            this.staminaBar.fillRoundedRect(50, 44, staminaWidth, 16, 6);
        }
    }

    updateFlaskUI() {
        if (this.flaskText) {
            this.flaskText.setText('FLASKS: ' + this.flasks);
            // Change color based on flask count
            if (this.flasks === 0) {
                this.flaskText.setColor('#ff0000');
            } else if (this.flasks === 1) {
                this.flaskText.setColor('#ffff00');
            } else {
                this.flaskText.setColor('#00ff00');
            }
        }
    }

    startHealing() {
        if (this.isHealing || this.flasks <= 0 || this.playerHealth >= this.maxHealth) return;
        
        // Play heal animation
        this.player.heal();
        
        this.isHealing = true;
        this.flasks--;
        
        const healAmount = Math.floor(this.maxHealth * 0.3);
        this.playerHealth = Math.min(this.maxHealth, this.playerHealth + healAmount);
        
        this.player.setTint(0x00ff00);
        
        const healText = this.add.text(this.player.x, this.player.y - 50, '+30%', {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: healText,
            y: healText.y - 50,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            onComplete: () => healText.destroy()
        });
        
        this.updateHealthBars();
        this.updateFlaskUI();
        
        this.time.delayedCall(200, () => {
            this.player.clearTint();
            this.isHealing = false;
        });
    }

    startBossFight() {
        // Initial boss dialogue
        const dialogue = [
            "SBF: Another challenger seeks to reclaim what was lost...",
            "SBF: Your assets are gone, just like your trust.",
            "SBF: Let's see if you're worth more than your portfolio..."
        ];

        // TODO: Add dialogue system integration
    }

    damagePlayer(amount) {
        if (this.isGameOver) return;  // Don't process damage if game is already over
        
        this.playerHealth = Math.max(0, this.playerHealth - amount);
        this.updateHealthBars();
        
        // Play hurt animation if not dead
        if (this.playerHealth > 0) {
            this.player.hurt();
        } else {
            this.player.die();
            this.time.delayedCall(600, () => {  // Wait for death animation
                this.gameOver();
            });
        }
    }

    damageBoss(amount) {
        this.bossHealth = Math.max(0, this.bossHealth - amount);
        this.updateHealthBars();
        
        // Flash red
        this.boss.setTint(0xff0000);
        this.boss.setAlpha(1);
        this.time.delayedCall(200, () => {
            this.boss.clearTint();
            this.boss.setAlpha(1);
        });
        
        if (this.bossHealth <= 0) {
            this.bossDeath();
        }
    }

    bossDeath() {
        // Disable all gameplay
        if (this.player.body) {
            this.player.setVelocityX(0);
        }
        
        // Stop boss movement and attacks
        if (this.boss && this.boss.body) {
            this.boss.setVelocityX(0);
        }
        
        this.canAttack = false;
        this.bossAttackCooldown = true;
        
        // Fade out boss
        this.tweens.add({
            targets: this.boss,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.boss.destroy();
                this.showVictoryScreen();
            }
        });
    }

    showVictoryScreen() {
        // Show victory image
        const victoryImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'victoryText'
        ).setOrigin(0.5);
        
        // Set scale
        victoryImage.setScale(0.67);
        
        // Fade in victory image
        victoryImage.setAlpha(0);
        this.tweens.add({
            targets: victoryImage,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Wait 3 seconds then transition to next scene
                this.time.delayedCall(3000, () => {
                    this.cameras.main.fade(1000, 0, 0, 0);
                    this.time.delayedCall(1000, () => {
                        this.scene.start('TransitionScene');
                    });
                });
            }
        });
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Stop all movement and physics
        if (this.player?.body) {
            this.player.body.enable = false;
            this.player.setVelocity(0, 0);
        }
        
        if (this.boss?.body) {
            this.boss.body.enable = false;
            this.boss.setVelocity(0, 0);
        }
        
        // Disable all controls
        this.canAttack = false;
        this.bossAttackCooldown = true;
        this.isAttackWarning = false;
        this.isRolling = false;
        this.isHealing = false;

        // Show death image
        const deathImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'deathText'
        ).setOrigin(0.5);
        
        // Set scale
        deathImage.setScale(0.67);
        
        // Fade in death image
        deathImage.setAlpha(0);
        this.tweens.add({
            targets: deathImage,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Wait 2 seconds then restart
                this.time.delayedCall(2000, () => {
                    this.cameras.main.fade(1000, 0, 0, 0);
                    this.time.delayedCall(1000, () => {
                        this.scene.stop();
                        this.scene.start('SBFBossFightScene', { reset: true });
                    });
                });
            }
        });
    }

    init(data) {
        // Reset all states when scene starts
        this.playerHealth = 100;
        this.bossHealth = 100;
        this.flasks = 3;
        this.isHealing = false;
        this.isRolling = false;
        this.canAttack = true;
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.lastAttackTime = 0;
        this.bossAttackCooldown = false;
        this.isAttackWarning = false;
        this.currentPatternIndex = 0;
        this.lastBossAttackTime = 0;
        this.lastCollisionTime = 0;
        this.currentStamina = this.maxStamina;
        this.lastStaminaRecharge = 0;
    }

    loadGameAssets() {
        const assets = [
            { key: 'player', path: './assets/characters/player.png' },
            { key: 'boss', path: './assets/characters/sbf.png' },
            { key: 'ground', path: './assets/backgrounds/platform.png' },
            { key: 'slash', path: './assets/ui/slash.png' },
            { key: 'arena', path: './assets/backgrounds/ftxa.jpg' },
            { key: 'victoryText', path: './assets/ui/text/sbfhasfallen.png' },
            { key: 'deathText', path: './assets/ui/text/youvedied.png' },
            { key: 'flask', path: './assets/ui/flasks.png' }
        ];

        assets.forEach(asset => this.load.image(asset.key, asset.path));
    }
} 