export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'knight_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics setup
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setDragX(1500);
        this.setMaxVelocity(300, 600);
        this.setGravityY(1200);
        this.setSize(48, 64);

        // Create animations
        this.createAnimations(scene);
        
        // Start with idle animation
        this.play('knight_idle');
    }

    createAnimations(scene) {
        // Idle animation
        scene.anims.create({
            key: 'knight_idle',
            frames: scene.anims.generateFrameNumbers('knight_idle', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        // Run animation
        scene.anims.create({
            key: 'knight_run',
            frames: scene.anims.generateFrameNumbers('knight_run', { start: 0, end: 9 }),
            frameRate: 12,
            repeat: -1
        });

        // Attack animations
        scene.anims.create({
            key: 'knight_attack1',
            frames: scene.anims.generateFrameNumbers('knight_attack1', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });

        scene.anims.create({
            key: 'knight_attack2',
            frames: scene.anims.generateFrameNumbers('knight_attack2', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });

        scene.anims.create({
            key: 'knight_attack3',
            frames: scene.anims.generateFrameNumbers('knight_attack3', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });

        // Jump animation
        scene.anims.create({
            key: 'knight_jump',
            frames: scene.anims.generateFrameNumbers('knight_jump', { start: 0, end: 9 }),
            frameRate: 15,
            repeat: 0
        });

        // Hurt animation
        scene.anims.create({
            key: 'knight_hurt',
            frames: scene.anims.generateFrameNumbers('knight_hurt', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });

        // Death animation
        scene.anims.create({
            key: 'knight_death',
            frames: scene.anims.generateFrameNumbers('knight_dead', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: 0
        });

        // Roll/Defend animation
        scene.anims.create({
            key: 'knight_defend',
            frames: scene.anims.generateFrameNumbers('knight_defend', { start: 0, end: 9 }),
            frameRate: 15,
            repeat: 0
        });
    }

    update() {
        // Handle animations based on state
        if (this.body.velocity.y < 0) {
            this.play('knight_jump', true);
        } else if (this.body.velocity.x !== 0) {
            this.play('knight_run', true);
        } else {
            this.play('knight_idle', true);
        }
    }

    attack() {
        // Randomly choose between attack animations
        const attackAnim = Phaser.Math.RND.pick(['knight_attack1', 'knight_attack2', 'knight_attack3']);
        this.play(attackAnim, true);
    }

    hurt() {
        this.play('knight_hurt', true);
    }

    die() {
        this.play('knight_death', true);
    }

    heal() {
        this.play('knight_defend', true);
    }

    roll() {
        this.play('knight_defend', true);
    }

    jump() {
        this.setVelocityY(-500);
        this.play('knight_jump', true);
    }
} 