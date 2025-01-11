import { Player } from '../entities/Player.js';

export class BinanceBossFightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BinanceBossFightScene' });
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
        this.hitsToWin = 23;  // Takes 23 hits to kill CZ
        this.damagePerHit = Math.ceil(100 / this.hitsToWin);

        // Flask system
        this.flasks = 3;
        this.healAmount = 30;
        this.isHealing = false;

        // Combat timers and states
        this.lastAttackTime = 0;
        this.attackDelay = 150;
        this.bossAttackDelay = 150;  // Faster than other bosses
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
        this.bossAttackRange = 250;  // Larger attack range
        this.isAttackWarning = false;
        this.attackWarningTime = 600;  // Shorter warning time
        this.attackPattern = ['quick', 'quick', 'quick', 'heavy'];  // More aggressive pattern
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
        // Load knight sprite sheets
        this.load.spritesheet('knight_idle', 'assets/sprites/knight2/IDLE.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_run', 'assets/sprites/knight2/RUN.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_walk', 'assets/sprites/knight2/WALK.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack1', 'assets/sprites/knight2/ATTACK 1.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack2', 'assets/sprites/knight2/ATTACK 2.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('knight_attack3', 'assets/sprites/knight2/ATTACK 3.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('knight_hurt', 'assets/sprites/knight2/HURT.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('knight_dead', 'assets/sprites/knight2/DEATH.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('knight_jump', 'assets/sprites/knight2/JUMP.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('knight_defend', 'assets/sprites/knight2/DEFEND.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        
        // Load other assets
        this.loadGameAssets();
    }

    loadGameAssets() {
        const assets = [
            { key: 'player', path: './assets/characters/player.png' },
            { key: 'binance_boss', path: './assets/characters/image(5).png' },
            { key: 'binance_ground', path: './assets/backgrounds/platform.png' },
            { key: 'binance_slash', path: './assets/ui/slash.png' },
            { key: 'binance_arena', path: './assets/backgrounds/binancea.png' },
            { key: 'binance_victoryText', path: './assets/ui/text/CJANGPENGHASFALLEN.png' },
            { key: 'youvedied', path: './assets/ui/text/youvedied.png' },
            { key: 'flask', path: './assets/ui/flasks.png' }
        ];

        assets.forEach(asset => this.load.image(asset.key, asset.path));
    }

    create() {
        // Initialize game state first
        this.initializeGameState();
        
        // Set up animations
        this.anims.create({
            key: 'knight_idle',
            frames: this.anims.generateFrameNumbers('knight_idle', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'knight_run',
            frames: this.anims.generateFrameNumbers('knight_run', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'knight_attack',
            frames: this.anims.generateFrameNumbers('knight_attack1', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'knight_heavy_attack',
            frames: this.anims.generateFrameNumbers('knight_attack2', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'knight_hurt',
            frames: this.anims.generateFrameNumbers('knight_hurt', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'knight_death',
            frames: this.anims.generateFrameNumbers('knight_dead', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'knight_defend',
            frames: this.anims.generateFrameNumbers('knight_defend', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        
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
        
        // Arena background
        const arena = this.add.image(width/2, height/2, 'binance_arena');
        arena.setDisplaySize(width, height);
        arena.setDepth(0);
        
        // Darkening overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.2);
        overlay.setOrigin(0);
        overlay.setDepth(1);
    }

    createBossNameText() {
        const width = this.cameras.main.width;
        this.bossNameText = this.add.text(width - 400, 20, 'Changpeng Zhao', {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#ffffff'
        });
        this.bossNameText.setDepth(5);
    }

    showVictoryScreen() {
        // Add background darkening
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0);
        overlay.setDepth(4);
        overlay.setAlpha(0);

        const victoryImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'binance_victoryText'
        ).setOrigin(0.5);
        
        victoryImage.setScale(0.8);
        victoryImage.setAlpha(0);
        victoryImage.setDepth(5);
        
        // Fade in both overlay and victory text
        this.tweens.add({
            targets: [overlay, victoryImage],
            alpha: 1,
            duration: 2000,
            onComplete: () => {
                this.time.delayedCall(3000, () => {
                    // Fade out everything including the scene
                    this.cameras.main.fadeOut(2000);
                    this.time.delayedCall(2000, () => {
                        this.scene.start('BinanceTransitionScene');
                    });
                });
            }
        });
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Stop all movement and physics
        this.player.body.enable = false;
        this.boss.body.enable = false;
        this.player.setVelocity(0, 0);
        this.boss.setVelocity(0, 0);
        
        // Disable all controls
        this.canAttack = false;
        this.bossAttackCooldown = true;
        this.isAttackWarning = false;
        this.isRolling = false;
        this.isHealing = false;
        
        // Add darkening overlay
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0);
        overlay.setDepth(4);
        overlay.setAlpha(0);
        
        const deathImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'youvedied'
        ).setOrigin(0.5);
        
        deathImage.setScale(0.67);
        deathImage.setAlpha(0);
        deathImage.setDepth(5);
        
        // Fade in both overlay and death text
        this.tweens.add({
            targets: [overlay, deathImage],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    // Fade out everything
                    this.tweens.add({
                        targets: [overlay, deathImage],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            this.scene.restart();
                        }
                    });
                });
            }
        });
    }

    damagePlayer(amount) {
        this.playerHealth = Math.max(0, this.playerHealth - amount);
        this.updateHealthBars();
        
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());
        
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    executeBossAttack(attackType) {
        if (!this.boss.active || this.playerHealth <= 0) return;

        this.isAttackWarning = false;
        this.bossAttackCooldown = true;

        const attackBox = new Phaser.Geom.Rectangle(
            this.boss.x + (this.boss.flipX ? -200 : 50),
            this.boss.y - 150,
            300,
            300
        );

        // Visual hitbox
        const hitboxGraphics = this.add.graphics();
        hitboxGraphics.lineStyle(2, 0xff0000, 0.8);
        hitboxGraphics.strokeRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
        hitboxGraphics.fillStyle(0xff0000, 0.2);
        hitboxGraphics.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
        hitboxGraphics.setDepth(3);

        this.tweens.add({
            targets: hitboxGraphics,
            alpha: 0,
            duration: 300,
            onComplete: () => hitboxGraphics.destroy()
        });

        // Check for hit and apply damage
        if (!this.isRolling && Phaser.Geom.Rectangle.Overlaps(
            attackBox,
            this.player.getBounds()
        )) {
            const baseDamage = attackType === 'heavy' ? 20 : 17;  // More damage than other bosses
            this.damagePlayer(baseDamage);
        }

        // Visual feedback
        const attackDirection = this.boss.flipX ? -1 : 1;
        const slash = this.add.image(
            this.boss.x + (30 * attackDirection),
            this.boss.y,
            'binance_slash'
        );
        slash.setTint(0xff0000);
        slash.setAlpha(0.6);
        slash.setScale(0.8);
        slash.setFlipX(attackDirection === -1);

        this.tweens.add({
            targets: slash,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            onComplete: () => slash.destroy()
        });

        // Handle cooldown - shorter than other bosses
        const cooldownTime = attackType === 'heavy' ? 1500 : 1000;
        this.time.delayedCall(cooldownTime, () => {
            this.bossAttackCooldown = false;
            this.currentPatternIndex = (this.currentPatternIndex + 1) % this.attackPattern.length;
        });
    }

    update() {
        if (this.isGameOver || !this.player?.body || !this.boss?.body) return;

        // Handle player movement if not in special states
        if (!this.isRolling && !this.isHealing && this.playerHealth > 0) {
            this.handlePlayerMovement();
        }

        // Check for attack input
        if (this.attackKey.isDown && this.canAttack) {
            this.playerQuickAttack();
        }

        // Update boss behavior if active
        if (this.boss.active && !this.bossAttackCooldown && this.bossHealth > 0) {
            this.updateBoss();
        }

        // Handle stamina recharge
        const currentTime = this.time.now;
        if (this.currentStamina < this.maxStamina && 
            currentTime - this.lastStaminaRecharge >= this.staminaRechargeTime) {
            this.currentStamina = this.maxStamina;
            this.updateStaminaBar();
            this.lastStaminaRecharge = currentTime;
        }
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

    createGround() {
        this.ground = this.physics.add.staticGroup();
        const groundY = 650;
        
        this.ground.create(640, groundY, 'binance_ground')
            .setScale(20, 1)
            .setDisplaySize(1280, 40)
            .setAlpha(0)
            .refreshBody();
    }

    createPlayer() {
        // Create player using the Player class
        this.player = new Player(this, 200, 580);
        this.player.setScale(2.8);  // Make the player 2.8 times bigger to match other fights
        this.physics.add.collider(this.player, this.ground);
    }

    setupPlayerPhysics() {
        this.player.setCollideWorldBounds(true)
            .setBounce(0.1)
            .setDragX(1500)
            .setMaxVelocity(300, 600)
            .setGravityY(1200)
            .setSize(48, 64);
    }

    createBoss() {
        this.boss = this.physics.add.sprite(1000, 580, 'binance_boss');
        this.setupBossPhysics();
        this.setupBossCollisions();
    }

    setupBossPhysics() {
        this.boss.setCollideWorldBounds(true)
            .setBounce(0)
            .setDragX(1500)
            .setGravityY(1000)
            .setSize(48, 64);
    }

    setupBossCollisions() {
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.overlap(
            this.player, 
            this.boss, 
            this.handlePlayerBossCollision, 
            null, 
            this
        );
    }

    setupControls() {
        this.setupKeyboardControls();
        this.setupMouseControls();
    }

    setupKeyboardControls() {
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.healKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        // Add attack key
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    }
        
    setupMouseControls() {
        this.input.mouse.disableContextMenu();
        
        // Setup left click for quick attack
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.canAttack) {
                this.playerQuickAttack();
            }
        });
        
        // Setup right click for roll
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown() && !this.isRolling) {
                this.startRoll();
            }
        });
    }

    executeAttack(damage, range, color) {
        const attackDirection = this.player.flipX ? -1 : 1;
        // Extended player attack hitbox
        const attackBox = new Phaser.Geom.Rectangle(
            this.player.x + (range * attackDirection) - (range/2),
            this.player.y - (range),  // Higher reach
            range * 1.5,  // 50% wider
            range * 2     // Twice as tall
        );
        
        if (Phaser.Geom.Rectangle.Overlaps(
            attackBox,
            this.boss.getBounds()
        )) {
            this.damageBoss(damage);
        }

        // Visual feedback for attack
        const slash = this.add.image(
            this.player.x + (30 * attackDirection),
            this.player.y,
            'binance_slash'
        );
        slash.setTint(color);
        slash.setAlpha(0.6);
        slash.setScale(0.6);
        slash.setFlipX(attackDirection === -1);

        this.tweens.add({
            targets: slash,
            alpha: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            onComplete: () => slash.destroy()
        });
    }

    playerQuickAttack() {
        const currentTime = this.time.now;
        if (currentTime - this.lastAttackTime < this.attackDelay) return;
        
        this.lastAttackTime = currentTime;
        this.canAttack = false;
        
        // Play the attack animation
        this.player.play('knight_attack', true);
        
        // Execute the attack after a slight delay to match animation
        this.time.delayedCall(150, () => {
            this.executeAttack(this.damagePerHit, 40, 0xff0000);
        });
        
        // Reset attack state after cooldown
        this.time.delayedCall(this.attackCooldown, () => {
            this.canAttack = true;
        });
    }

    playerHeavyAttack() {
        if (!this.canAttack) return;
        
        this.canAttack = false;
        
        // Play the heavy attack animation
        this.player.play('knight_heavy_attack', true);
        
        // Execute the attack after a longer delay for heavy attack
        this.time.delayedCall(300, () => {
            this.executeAttack(this.damagePerHit * 2, 60, 0xff6600);
        });
        
        // Longer cooldown for heavy attack
        this.time.delayedCall(this.attackCooldown * 2, () => {
            this.canAttack = true;
        });
    }

    startRoll() {
        if (this.isRolling || this.currentStamina <= 0) return;
        
        this.currentStamina--;
        this.isRolling = true;
        this.updateStaminaBar();
        
        const rollDirection = this.player.flipX ? -1 : 1;
        this.player.setVelocityX(400 * rollDirection);
        
        // Visual feedback for roll
        this.player.setAlpha(0.5);
        
        this.time.delayedCall(400, () => {
            this.isRolling = false;
            this.player.setAlpha(1);
        });

        if (this.currentStamina === 0) {
            this.lastStaminaRecharge = this.time.now;
        }
    }

    handlePlayerMovement() {
        const onGround = this.player.body.touching.down;

        // Handle horizontal movement
        if (this.keyA.isDown) {
            this.player.setVelocityX(-300);
            this.player.setFlipX(true);
        } else if (this.keyD.isDown) {
            this.player.setVelocityX(300);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        // Handle jump
        if (this.spaceKey.isDown && onGround) {
            this.player.setVelocityY(-500);
        }

        // Handle healing
        if (this.healKey.isDown && !this.isHealing && this.flasks > 0 && this.playerHealth < this.maxHealth) {
            this.startHealing();
        }
    }

    startHealing() {
        if (this.isHealing || this.flasks <= 0 || this.playerHealth >= this.maxHealth) return;
        
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

    createUI() {
        // Player health bar
        const playerBarBg = this.add.graphics();
        playerBarBg.fillStyle(0x000000, 0.8);
        playerBarBg.lineStyle(2, 0xff0000, 0.3);
        playerBarBg.strokeRoundedRect(48, 18, 154, 20, 6);
        playerBarBg.fillRoundedRect(50, 20, 150, 16, 6);
        playerBarBg.setDepth(1);

        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setDepth(1);

        // Stamina bar
        const staminaBarBg = this.add.graphics();
        staminaBarBg.fillStyle(0x000000, 0.8);
        staminaBarBg.lineStyle(2, 0x006400, 0.3);
        staminaBarBg.strokeRoundedRect(48, 42, 154, 20, 6);
        staminaBarBg.fillRoundedRect(50, 44, 150, 16, 6);
        staminaBarBg.setDepth(1);

        this.staminaBar = this.add.graphics();
        this.staminaBar.setDepth(1);
        
        // Flask counter
        this.flaskText = this.add.text(50, 68, 'FLASKS: ' + this.flasks, {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { blur: 2, stroke: true, fill: true }
        }).setDepth(1);

        // Boss health bar
        const bossBarBg = this.add.graphics();
        bossBarBg.fillStyle(0x000000, 0.8);
        bossBarBg.lineStyle(2, 0xff0000, 1);
        bossBarBg.strokeRoundedRect(928, 48, 304, 34, 10);
        bossBarBg.fillRoundedRect(930, 50, 300, 30, 10);
        bossBarBg.setDepth(1);

        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.setDepth(1);
        
        this.updateHealthBars();
        this.updateStaminaBar();
    }

    updateHealthBars() {
        // Player health bar
        this.playerHealthBar.clear();
        this.playerHealthBar.fillStyle(0x660000);
        this.playerHealthBar.fillRoundedRect(50, 20, 150, 16, 6);
        this.playerHealthBar.fillStyle(0xff0000);
        const playerHealthWidth = (this.playerHealth / this.maxHealth) * 150;
        if (playerHealthWidth > 0) {
            this.playerHealthBar.fillRoundedRect(50, 20, playerHealthWidth, 16, 6);
        }

        // Boss health bar
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
        this.staminaBar.fillStyle(0x003300);
        this.staminaBar.fillRoundedRect(50, 44, 150, 16, 6);
        this.staminaBar.fillStyle(0x006400);
        const staminaWidth = (this.currentStamina / this.maxStamina) * 150;
        if (staminaWidth > 0) {
            this.staminaBar.fillRoundedRect(50, 44, staminaWidth, 16, 6);
        }
    }

    updateFlaskUI() {
        if (this.flaskText) {
            this.flaskText.setText('FLASKS: ' + this.flasks);
            this.flaskText.setColor(this.flasks === 0 ? '#ff0000' : this.flasks === 1 ? '#ffff00' : '#00ff00');
        }
    }

    updateBoss() {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.boss.x, this.boss.y,
            this.player.x, this.player.y
        );

        if (distanceToPlayer > this.bossAttackRange) {
            this.moveBossTowardsPlayer();
        } else {
            this.boss.setVelocityX(0);
            this.bossAttack();
        }

        // Update boss flip based on player position
        this.boss.setFlipX(this.player.x < this.boss.x);
    }

    moveBossTowardsPlayer() {
        const direction = this.player.x < this.boss.x ? -1 : 1;
        this.boss.setVelocityX(200 * direction);
    }

    bossAttack() {
        const currentTime = this.time.now;
        if (this.bossAttackCooldown || this.isAttackWarning || 
            currentTime - this.lastBossAttackTime < this.bossAttackDelay) return;
        
        this.lastBossAttackTime = currentTime;
        this.isAttackWarning = true;
        this.showBossAttackWarning();
    }

    showBossAttackWarning() {
        this.tweens.add({
            targets: this.boss,
            tint: { from: 0xff0000, to: 0xffffff },
            duration: 200,
            yoyo: true,
            repeat: 2,
            onUpdate: () => this.boss.setAlpha(1),
            onComplete: () => {
                this.time.delayedCall(this.attackWarningTime, () => {
                    this.boss.clearTint();
                    this.boss.setAlpha(1);
                    this.executeBossAttack(this.attackPattern[this.currentPatternIndex]);
                });
            }
        });
    }

    damageBoss(amount) {
        this.bossHealth = Math.max(0, this.bossHealth - amount);
        this.updateHealthBars();
        
        this.boss.setTint(0xff0000);
        this.time.delayedCall(200, () => this.boss.clearTint());
        
        if (this.bossHealth <= 0) {
            this.bossDeath();
        }
    }

    bossDeath() {
        if (this.isBossDead) return;
        this.isBossDead = true;

        // Stop all movement and physics
        this.player.body.enable = false;
        this.boss.body.enable = false;
        this.player.setVelocity(0, 0);
        this.boss.setVelocity(0, 0);
        
        // Disable all controls
        this.canAttack = false;
        this.bossAttackCooldown = true;
        this.isAttackWarning = false;
        this.isRolling = false;
        this.isHealing = false;
        
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
} 