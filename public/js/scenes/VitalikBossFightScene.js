import { Player } from '../entities/Player.js';

export class VitalikBossFightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VitalikBossFightScene' });
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
        this.bossDamageMultiplier = 1.12; // 12% more damage

        // Boss damage calculation for 4-hit kill
        this.bossBaseDamage = Math.ceil(this.maxHealth / 4); // 25 damage per hit to kill in 4 hits

        // Phase 2 variables
        this.isPhase2 = false;
        this.playerAttackCount = 0;
        this.lastPlayerAttackTime = 0;
        this.attackCountResetTime = 2000; // Reset attack count if no attacks for 2 seconds
        this.rapidAttackCount = 0;
        this.isRapidAttacking = false;

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
        // Load knight sprite sheets with precise frame dimensions
        this.load.spritesheet('knight_idle', '/assets/sprites/knight2/IDLE.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_run', '/assets/sprites/knight2/RUN.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_walk', '/assets/sprites/knight2/WALK.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack1', '/assets/sprites/knight2/ATTACK 1.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack2', '/assets/sprites/knight2/ATTACK 2.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_attack3', '/assets/sprites/knight2/ATTACK 3.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_hurt', '/assets/sprites/knight2/HURT.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_dead', '/assets/sprites/knight2/DEATH.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_jump', '/assets/sprites/knight2/JUMP.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        this.load.spritesheet('knight_defend', '/assets/sprites/knight2/DEFEND.png', {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
        
        // Load other assets
        this.loadGameAssets();

        // Load additional assets
        this.load.image('background', './assets/backgrounds/ethfight.png');
        this.load.image('victoryText', './assets/ui/text/VITALIKHASFALLEN.png');
        this.load.image('deathText', './assets/ui/text/youvedied.png');

        // Load Vitalik image
        this.load.image('vitalik_boss', './assets/characters/vita-removebg-preview.png');
    }

    loadGameAssets() {
        const assets = [
            { key: 'player', path: './assets/characters/player.png' },
            { key: 'vitalik_boss', path: './assets/characters/vita-removebg-preview.png' },
            { key: 'vitalik_ground', path: './assets/backgrounds/platform.png' },
            { key: 'vitalik_slash', path: './assets/ui/slash.png' },
            { key: 'vitalik_arena', path: './assets/backgrounds/ethfight.png' },
            { key: 'vitalik_victoryText', path: './assets/ui/text/VITALIKHASFALLEN.png' },
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
    }

    setupArena() {
        const { width, height } = this.cameras.main;
        
        // Arena background
        const arena = this.add.image(width/2, height/2, 'vitalik_arena');
        arena.setDisplaySize(width, height);
        arena.setDepth(0);
        
        // Darkening overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.2);
        overlay.setOrigin(0);
        overlay.setDepth(1);

        // Set the background image
        this.add.image(0, 0, 'background').setOrigin(0, 0);
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
        this.bossNameText = this.add.text(930, 20, 'Vitalik Buterin', {
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#ffffff'
        });
        this.bossNameText.setDepth(5);
    }

    createGround() {
        this.ground = this.physics.add.staticGroup();
        const groundY = 650;
        
        this.ground.create(640, groundY, 'vitalik_ground')
            .setScale(20, 1)
            .setDisplaySize(1280, 40)
            .setAlpha(0)
            .refreshBody();
    }

    createPlayer() {
        // Create player using the Player class
        this.player = new Player(this, 200, 580);
        this.player.setScale(2.8);  // Make the player 2.8 times bigger to match SBF fight
        this.physics.add.collider(this.player, this.ground);
    }

    createBoss() {
        // Add Vitalik to the scene
        this.boss = this.physics.add.sprite(1000, 580, 'vitalik_boss');
        this.boss.setScale(1.3);
        this.boss.setCollideWorldBounds(true);
        this.boss.setBounce(0);
        this.boss.setDragX(1500);
        this.boss.setGravityY(1000);
        this.boss.setSize(48, 64);
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
    }
        
    setupMouseControls() {
        this.input.mouse.disableContextMenu();
        this.setupAttackControls();
        this.setupRollControls();
    }
        
    setupAttackControls() {
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.canAttack) {
                this.isCharging = true;
                this.chargeStartTime = this.time.now;
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.isCharging) {
                const chargeLength = this.time.now - this.chargeStartTime;
                this.executePlayerAttack(chargeLength);
                this.isCharging = false;
            }
        });
    }

    executePlayerAttack(chargeLength) {
                if (chargeLength >= this.chargeTime) {
                    this.playerHeavyAttack();
                } else {
                    this.playerQuickAttack();
                }
            }
        
    setupRollControls() {
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown() && !this.isRolling) {
                this.startRoll();
            }
        });
    }

    update() {
        // Early return if game is over or essential objects are missing
        if (this.isGameOver || this.isBossDead || !this.player?.body || !this.boss?.body) return;

        // Update player animations
        this.player.update();

        // Handle stamina recharge
        const currentTime = this.time.now;
        if (this.currentStamina < this.maxStamina && 
            currentTime - this.lastStaminaRecharge >= this.staminaRechargeTime) {
            this.currentStamina = this.maxStamina;
            this.updateStaminaBar();
            this.lastStaminaRecharge = currentTime;
        }

        // Handle player movement if not in special states
        if (!this.isRolling && !this.isHealing && this.playerHealth > 0) {
            this.handlePlayerMovement();
        }

        // Update boss behavior if active
        if (this.boss.active && !this.bossAttackCooldown && this.bossHealth > 0) {
            this.updateBoss();
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
            this.player.jump();
        }

        // Handle healing
        if (this.healKey.isDown && !this.isHealing && this.flasks > 0 && this.playerHealth < this.maxHealth) {
            this.startHealing();
        }
    }

    updateBoss() {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.boss.x, this.boss.y,
            this.player.x, this.player.y
        );

        if (this.isPhase2) {
            // In phase 2, teleport to alternate sides instead of running
            if (!this.bossAttackCooldown && !this.isAttackWarning) {
                const teleportSide = Math.random() < 0.5 ? -1 : 1;
                const teleportX = this.player.x + (teleportSide * 200);
                this.boss.x = Phaser.Math.Clamp(teleportX, 100, this.cameras.main.width - 100);
                this.boss.setFlipX(teleportSide === -1);
                this.bossAttack();
            }
        } else {
            // Phase 1 behavior - move towards player
            if (distanceToPlayer > this.bossAttackRange) {
                const direction = this.player.x < this.boss.x ? -1 : 1;
                this.boss.setVelocityX(200 * direction);
                this.boss.setFlipX(direction === -1);
            } else {
                this.boss.setVelocityX(0);
                this.bossAttack();
            }
        }
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

    executeBossAttack(attackType) {
        if (!this.boss.active || this.playerHealth <= 0) return;

        this.isAttackWarning = false;
        this.bossAttackCooldown = true;

        // Larger hitbox
        const attackBox = new Phaser.Geom.Rectangle(
            this.boss.x + (this.boss.flipX ? -250 : 50),
            this.boss.y - 200,
            400,
            400
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

        // Check for hit and apply damage - player is safe if rolling even within hitbox
        if (!this.isRolling && Phaser.Geom.Rectangle.Overlaps(
            attackBox,
            this.player.getBounds()
        )) {
            // Use the new damage calculation
            const damage = this.bossBaseDamage * (attackType === 'heavy' ? 1.2 : 1); // Heavy attacks do 20% more damage
            this.damagePlayer(damage);
        }

        // Visual feedback
        const attackDirection = this.boss.flipX ? -1 : 1;
        const slash = this.add.image(
            this.boss.x + (30 * attackDirection),
            this.boss.y,
            'solana_slash'
        );
        slash.setTint(0xff0000);
        slash.setAlpha(0.8);
        slash.setScale(1.2);
        slash.setFlipX(attackDirection === -1);

        this.tweens.add({
            targets: slash,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 200,
            onComplete: () => slash.destroy()
        });

        // Handle cooldown
        const cooldownTime = attackType === 'heavy' ? 2000 : 1500;
        this.time.delayedCall(cooldownTime, () => {
            this.bossAttackCooldown = false;
            this.currentPatternIndex = (this.currentPatternIndex + 1) % this.attackPattern.length;
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
        
        // Flask counter with smaller text
        this.flaskText = this.add.text(50, 68, 'FLASKS: ' + this.flasks, {
            fontFamily: "Metroidvania",
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

        // Create controls display WAY BELOW the game container
        const controlsText = [
            'A/D: Move',
            'LEFT CLICK: Attack',
            'HOLD LEFT: Heavy',
            'RIGHT CLICK: Roll',
            'F: Heal'
        ];

        // Position controls way below the game container (in the purple area)
        controlsText.forEach((control, index) => {
            const text = this.add.text(
                200 + (index * 250), // Horizontal spacing
                this.cameras.main.height + 150, // Way below the game container
                control,
                {
                    fontFamily: "'Press Start 2P'",
                    fontSize: '24px',
                    color: '#ffffff'
                }
            ).setDepth(5);
        });
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

    updateFlaskUI() {
        if (this.flaskText) {
            this.flaskText.setText('FLASKS: ' + this.flasks);
            this.flaskText.setColor(this.flasks === 0 ? '#ff0000' : this.flasks === 1 ? '#ffff00' : '#00ff00');
        }
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
        
        this.boss.setTint(0xff0000);
        this.time.delayedCall(200, () => this.boss.clearTint());
        
        // Check for phase 2
        if (!this.isPhase2 && this.bossHealth <= this.maxHealth / 2) {
            this.isPhase2 = true;
            this.activatePhase2();
        }
        
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
                this.scene.start('VitalikTransitionScene');
            }
        });
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
            'vitalik_victoryText'
        ).setOrigin(0.5);
        
        victoryImage.setScale(0.8);
        victoryImage.setAlpha(0);
        victoryImage.setDepth(5);
        
        // Fade in both overlay and victory text
        this.tweens.add({
            targets: [overlay, victoryImage],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    // Start fade out
                    this.tweens.add({
                        targets: [overlay, victoryImage],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            // Transition to EthericHeartScene
                            this.scene.start('EthericHeartScene');
                        }
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
            'vitalik_slash'
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
        if (!this.isRolling && currentTime - this.lastCollisionTime >= this.collisionCooldown) {
            this.lastCollisionTime = currentTime;
            const knockbackDirection = this.player.x < this.boss.x ? -1 : 1;
            this.player.setVelocityX(150 * knockbackDirection);
        }
    }

    activatePhase2() {
        // Visual indication of phase 2
        this.boss.setTint(0xffff00);
        this.time.delayedCall(500, () => this.boss.clearTint());
        
        // Make base attacks faster
        this.bossAttackDelay = 200;
        this.attackWarningTime = 600;
    }

    triggerRapidAttacks() {
        if (this.isRapidAttacking) return;
        this.isRapidAttacking = true;
        this.rapidAttackCount = 0;

        // Create warning indicator
        const warningText = this.add.text(this.boss.x, this.boss.y - 100, '!', {
            fontFamily: "Metroidvania",
            fontSize: '32px',
            color: '#ff0000'
        }).setOrigin(0.5);

        // Flash warning
        this.tweens.add({
            targets: warningText,
            alpha: { from: 1, to: 0 },
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                warningText.destroy();
                this.executeRapidAttackSequence();
            }
        });
    }

    executeRapidAttackSequence() {
        if (this.rapidAttackCount >= 5) {
            this.isRapidAttacking = false;
            this.playerAttackCount = 0;
            return;
        }

        // Teleport to alternate sides
        const playerSide = this.player.x < this.boss.x ? 1 : -1;
        const teleportX = this.player.x + (playerSide * 200);
        this.boss.x = Phaser.Math.Clamp(teleportX, 100, this.cameras.main.width - 100);

        // Create attack warning
        const warningBox = this.add.graphics();
        warningBox.lineStyle(2, 0xff0000, 1);
        warningBox.strokeRect(this.boss.x - 100, this.boss.y - 150, 200, 300);

        // Execute attack after warning
        this.time.delayedCall(100, () => {
            const damage = this.rapidAttackCount === 4 ? 12 : 8;
            this.executeRapidAttack(damage, warningBox);
            
            // Queue next attack
            this.time.delayedCall(250, () => {
                this.rapidAttackCount++;
                this.executeRapidAttackSequence();
            });
        });
    }

    executeRapidAttack(damage, warningBox) {
        warningBox.destroy();

        const attackBox = new Phaser.Geom.Rectangle(
            this.boss.x - 100,
            this.boss.y - 150,
            200,
            300
        );

        if (!this.isRolling && Phaser.Geom.Rectangle.Overlaps(
            attackBox,
            this.player.getBounds()
        )) {
            this.damagePlayer(damage);
        }

        // Visual feedback
        const slash = this.add.image(this.boss.x, this.boss.y, 'vitalik_slash');
        slash.setTint(0xff0000);
        slash.setAlpha(0.8);
        slash.setScale(1.2);

        this.tweens.add({
            targets: slash,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            onComplete: () => slash.destroy()
        });
    }

    showDeathScreen() {
        // Add background darkening
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0);
        overlay.setDepth(4);
        overlay.setAlpha(0);

        const deathImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'deathText'
        ).setOrigin(0.5);
        
        deathImage.setScale(0.8);
        deathImage.setAlpha(0);
        deathImage.setDepth(5);
        
        // Fade in both overlay and death text
        this.tweens.add({
            targets: [overlay, deathImage],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    // Start fade out
                    this.tweens.add({
                        targets: [overlay, deathImage],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            // Restart the scene or go to another scene
                            this.scene.restart();
                        }
                    });
                });
            }
        });
    }
} 