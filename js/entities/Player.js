export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'knight_idle');
        
        // Add sprite to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.setCollideWorldBounds(true)
            .setBounce(0.1)
            .setDragX(1500)
            .setMaxVelocity(300, 600)
            .setGravityY(1200)
            .setSize(48, 64);  // Match the sprite size exactly
            
        // Make sure sprite is visible
        this.setAlpha(1);
        this.clearTint();

        // Animation state tracking
        this.isAttacking = false;
        this.currentAnim = 'idle';
        this.isHurt = false;
        this.isDead = false;
        this.isJumping = false;

        // Create animations
        this.createAnimations();
        
        // Start with idle animation
        this.playAnim('idle');
    }
    
    createAnimations() {
        // Remove any existing animations
        ['idle', 'run', 'walk', 'attack1', 'attack2', 'attack3', 'hurt', 'dead', 'jump', 'defend'].forEach(key => {
            const fullKey = 'player_' + key;
            if (this.scene.anims.exists(fullKey)) {
                this.scene.anims.remove(fullKey);
            }
        });
        
        // Create all animations with the correct frame size
        const commonConfig = {
            frameWidth: 96,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        };

        // Idle animation
        this.scene.anims.create({
            key: 'player_idle',
            frames: this.scene.anims.generateFrameNumbers('knight_idle', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        // Run animation
        this.scene.anims.create({
            key: 'player_run',
            frames: this.scene.anims.generateFrameNumbers('knight_run', { start: 0, end: 9 }),
            frameRate: 12,
            repeat: -1
        });

        // Attack animations
        this.scene.anims.create({
            key: 'player_attack1',
            frames: this.scene.anims.generateFrameNumbers('knight_attack1', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'player_attack2',
            frames: this.scene.anims.generateFrameNumbers('knight_attack2', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'player_attack3',
            frames: this.scene.anims.generateFrameNumbers('knight_attack3', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });

        // Jump animation
        this.scene.anims.create({
            key: 'player_jump',
            frames: this.scene.anims.generateFrameNumbers('knight_jump', { start: 0, end: 9 }),
            frameRate: 15,
            repeat: 0
        });

        // Hurt animation
        this.scene.anims.create({
            key: 'player_hurt',
            frames: this.scene.anims.generateFrameNumbers('knight_hurt', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });

        // Death animation
        this.scene.anims.create({
            key: 'player_dead',
            frames: this.scene.anims.generateFrameNumbers('knight_dead', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: 0
        });

        // Roll/Defend animation
        this.scene.anims.create({
            key: 'player_defend',
            frames: this.scene.anims.generateFrameNumbers('knight_defend', { start: 0, end: 9 }),
            frameRate: 15,
            repeat: 0
        });
    }

    playAnim(key, ignoreIfPlaying = true) {
        const fullKey = 'player_' + key;
        
        // Don't interrupt attack or hurt animations
        if ((this.isAttacking && !key.startsWith('attack')) || 
            (this.isHurt && key !== 'hurt') ||
            this.isDead) return;
        
        // Don't restart the same animation unless forced
        if (ignoreIfPlaying && this.anims.currentAnim && this.anims.currentAnim.key === fullKey) {
            return;
        }
        
        this.currentAnim = key;
        this.play(fullKey, true);
    }
    
    update() {
        if (this.isDead) return;
        
        const velocity = this.body.velocity;
        const onGround = this.body.onFloor();
        
        // Only change animation if not in a special state
        if (!this.isAttacking && !this.isHurt) {
            if (!onGround) {
                // Play jump animation when in the air
                if (velocity.y < 0) {
                    // Rising
                    this.playAnim('jump');
                    this.isJumping = true;
                } else {
                    // Falling
                    if (this.isJumping) {
                        this.playAnim('jump');
                    }
                }
            } else {
                this.isJumping = false;
                if (Math.abs(velocity.x) > 160) {
                    this.playAnim('run');
                } else if (Math.abs(velocity.x) > 10) {
                    this.playAnim('walk');
                } else {
                    this.playAnim('idle');
                }
            }
        }
    }
    
    jump() {
        if (this.isDead || !this.body.onFloor()) return;
        
        this.setVelocityY(-500);
        this.isJumping = true;
        this.playAnim('jump', false);
    }
    
    attack() {
        if (this.isDead) return;
        
        this.isAttacking = true;
        // Randomly choose between attack animations
        const attackNum = Phaser.Math.Between(1, 3);
        this.playAnim('attack' + attackNum, false);
        
        this.once('animationcomplete', () => {
            this.isAttacking = false;
            this.playAnim('idle');
        });
    }
    
    hurt() {
        if (this.isDead) return;
        
        this.isHurt = true;
        this.playAnim('hurt', false);
        
        this.once('animationcomplete', () => {
            this.isHurt = false;
            this.playAnim('idle');
        });
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.isAttacking = false;
        this.isHurt = false;
        this.isJumping = false;
        
        // Play death animation
        this.playAnim('dead', false);
        
        // Stop any movement
        this.setVelocity(0, 0);
        
        // Ensure animation completes before death screen
        this.once('animationcomplete', () => {
            // Signal to the scene that death animation is complete
            this.emit('deathAnimComplete');
        });
    }
    
    roll() {
        if (this.isDead) return;
        
        // Visual feedback for roll
        this.setAlpha(0.5);
        this.scene.time.delayedCall(200, () => this.setAlpha(1));
    }
    
    heal() {
        if (this.isDead) return;
        
        // Visual feedback for healing
        this.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => this.clearTint());
    }
} 