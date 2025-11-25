import Phaser from "phaser";
import Upgrades from './Upgrades.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");

        // Atributos básicos
        this.playerSpeed = 200;
        this.enemySpeed = 60;
        this.fireRate = 400;

        this.xp = 5;
        this.level = 1;
        this.playerHP = 150;
        this.maxHP = 150;

        // Fases
        this.currentPhase = 1;
        // Tempo de fase
        this.phaseTimes = { 1: 60, 2: 120, 3: 180 };

        // Para testes
        //this.phaseTimes = { 1: 25, 2: 25, 3: 25 };
        this.phaseNames = {
            1: "Alvorecer Cinzento",
            2: "Luz Fragmentada",
            3: "Crepúsculo de Alune",
        };

        this.timeLeft = this.phaseTimes[1];
        this.phaseActive = true;
    }

    create() {
        const { width, height } = this.scale;

        // ---------------------------------------------------------------
        // BACKGROUND

        this.background = this.add
            .image(width / 2, height / 2, "background")
            .setOrigin(0.5)
            .setDepth(-10);

        this.cameras.main.fadeIn(800, 0, 0, 0);

        // ---------------------------------------------------------------
        // PLAYER
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setOrigin(0.5, 0.5);
        this.player.setScale(0.3);
        this.player.setCollideWorldBounds(true);

        // Ajuste do body com base no tamanho real do frame (pós-scale)
        const w = this.player.displayWidth *1.5;
        const h = this.player.displayHeight * 2.5;

        this.player.body.setSize(w, h);

        // centraliza automaticamente
        this.player.body.setOffset(
            (this.player.displayWidth - 10 / 2),
            (this.player.displayHeight / 2)
        );

        // ---------------------------------------------------------------
        // GRUPOS

        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();

        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

        // ---------------------------------------------------------------
        // CONTROLES

        this.cursors = this.input.keyboard.addKeys({
            up: "W", down: "S", left: "A", right: "D",
            dash: "SPACE"
        });
        this.arrowKeys = this.input.keyboard.createCursorKeys();

        this.input.on("pointerdown", () => {
            if (this.phaseActive && this.upgrades.hasGun) this.useGun();
            else if (this.phaseActive) this.shoot();
        });

        this.input.on("pointerup", () => {});

        // ---------------------------------------------------------------
        // HUD

        this.createHUD();

        // ---------------------------------------------------------------
        // UPGRADES
        this.upgrades = new Upgrades(this);

        // Flags para saber se o jogador tem cada upgrade ativo
        this.upgrades.hasDash = false;
        this.upgrades.hasGun = false;
        this.upgrades.hasLunarBeam = false;

        // ---------------------------------------------------------------
        // TIMER DAS FASES
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.updateTimer(),
        });

        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Chama fase 1
        this.startPhase(1);
        
        // ---------------------------------------------------------------   
        // Animações do Player
        this.anims.create({
            key: 'front',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'back',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });

        // ---------------------------------------------------------------
        // Animação dos Inimigos
        this.anims.create({
            key: 'enemy1_walk',
            frames: this.anims.generateFrameNumbers('enemies1', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy2_walk',
            frames: this.anims.generateFrameNumbers('enemies2', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy3_walk',
            frames: this.anims.generateFrameNumbers('enemies3', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: -1
        });

        // Explosion
        this.anims.create({
            key: 'enemy_explode',
            frames: this.anims.generateFrameNumbers('enemyExplosion', { start: 0, end: 7 }),
            frameRate: 8,
            hideOnComplete: true
        });
        // ---------------------------------------------------------------
        // Animação dos Tiros
        this.anims.create({
            key: 'bullet_anim',
            frames: this.anims.generateFrameNumbers('bullet', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'tripleBullet_anim',
            frames: this.anims.generateFrameNumbers('tripleBullet', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'lunarRay_anim',
            frames: this.anims.generateFrameNumbers('lunarRay', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: 0
        });

        // ---------------------------------------------------------------
        // Sons
        this.sfx = {
            enemyexplosion: this.sound.add("enemyexplosion"),
            menuclick: this.sound.add("menuclick"),
            menuhover: this.sound.add("menuhover"),
            playerdash: this.sound.add("playerdash"),
            playerhit: this.sound.add("playerhit"),
            playerlunarray: this.sound.add("playerlunarray"),
            playershoot: this.sound.add("playershoot"),
            playertripleshoot: this.sound.add("playertripleshoot"),
            upgrades: this.sound.add("upgrades"),
            phaseup: this.sound.add("phaseup"),
            menupause: this.sound.add("menupause")
        };

        // ---------------------------------------------------------------
        // Música
        this.bgm = this.sound.add('music_game', { volume: 0, loop: true });
        this.bgm.play();

        // Fade in
        this.tweens.add({
            targets: this.bgm,
            volume: 0.4,
            duration: 1000
        });
    }

    createHUD() {
        // Caixa de fundo do HUD
        this.hudBox = this.add.rectangle(400, 45, 790, 70, 0x000000, 0.50)
            .setStrokeStyle(2, 0xffffff)
            .setDepth(10);
        
        // -------------------------------------------------------------
        // VIDA 
        this.add.text(15, 20, "Vida:", {
            fontSize: "18px",
            color: "#ffffff",
            stroke: "#d40404",
            strokeThickness: 4
        }).setDepth(12);

        this.hpBarBg = this.createRoundedBar(75, 23, 150, 16, 0x442222);
        this.hpBar = this.createRoundedBar(75, 23, 150, 16, 0xff4444);
        
        // -------------------------------------------------------------
        // XP 
        this.add.text(15, 45, "XP:", {
            fontSize: "18px",
            color: "#ffffff",
            stroke: "#0140b4",
            strokeThickness: 4
        }).setDepth(12);

        this.xpBarBg = this.createRoundedBar(50, 47, 180, 16, 0x223044);
        this.xpBar = this.createRoundedBar(50, 47, 180, 16, 0x4482ff);

        // Timer
        this.timerText = this.add.text(680, 30, this.timeLeft, {
            fontSize: "28px",
            color: "#ffcc00",
            stroke: "#ffcc00",
            strokeThickness: 3
        }).setDepth(12);

        // Fase
        this.phaseText = this.add.text(300, 35, `Fase 1 — ${this.phaseNames[1]}`, {
            fontSize: "22px",
            color: "#ffffff"
        }).setDepth(12);
    }


    // ------------------------------------------------------------------
    // Controle do timer da fase
    updateTimer() {
        if (!this.phaseActive) return;
        this.timeLeft--;
        this.timerText.setText(this.timeLeft);
        if (this.timeLeft <= 0) this.endPhase();
    }

    // ------------------------------------------------------------------
    // Finaliza a fase
    endPhase() {
        this.phaseActive = false;
        if (this.enemySpawnTimer) this.enemySpawnTimer.paused = true;
        this.player.body.setVelocity(0);
        this.enemies.clear(true, true);

        if (this.currentPhase === 3) {
            this.time.delayedCall(1000, () => {
                this.cameras.main.fade(800, 0, 0, 0);
                // Fade out da música
                this.tweens.add({
                    targets: this.bgm,
                    volume: 0,
                    duration: 800, // igual ao fade da câmera
                    onComplete: () => this.bgm.stop()
                });
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start("WinScene", { 
                        xp: this.xp, 
                        level: this.level, 
                        victory: true 
                    });
                });
            });
        } else {
            // Chama aurora para próxima fase
            this.showAuroraBlessing(this.currentPhase + 1);
        }
    }
    //------------------------------------------------------------------
    //Controle de SPAWN e velocidade de Inimigos
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        
        //Tempo entre spawn de inimigos e velocidade dos inimigos
        let spawnRate = 1200;
        let speed = 100;

        //Diminui o tempo entre spawn e aumenta a velocidade em casa fase
        if (phaseNumber === 2) { spawnRate = 1100; speed = 140; }
        else if (phaseNumber === 3) { spawnRate = 900; speed = 160; }

        //armazena a velocidade e evita duplicação
        this.enemySpeed = speed;
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        
        //Cria um novo timer
        this.enemySpawnTimer = this.time.addEvent({ delay: spawnRate, callback: () => this.spawnEnemy(), loop: true });
    }

    //------------------------------------------------------------------
    // Controla o spawn de inimigos
    spawnEnemy() {
        //lados: 0=esquerdo; 1=direito; 2=superior, 3=inferior
        const side = Phaser.Math.Between(0, 3);
        let x, y;
        //Coloca -20 pixel em cada direção para o bicho surgir de fora da tela
        if (side === 0) { x = -20; y = Phaser.Math.Between(0, 600); }
        else if (side === 1) { x = 820; y = Phaser.Math.Between(0, 600); }
        else if (side === 2) { x = Phaser.Math.Between(0, 800); y = -20; }
        else { x = Phaser.Math.Between(0, 800); y = 620; }

        //Pega o sprite do inimigo de cada fase
        const enemySpriteKey = `enemies${this.currentPhase}`;
        //Fisíca do sprite baseado na posição x,y
        const enemy = this.physics.add.sprite(x, y, enemySpriteKey);
        enemy.setScale(2); 

        enemy.body.setSize(15, 15);

        // Centraliza o hitbox
        enemy.body.setOffset(
            (enemy.width - 10) / 2, (enemy.height - 10) / 2
        );
        //Inícia a animação de andar
        enemy.play(`enemy${this.currentPhase}_walk`);
        //Adiciona o inimigo
        this.enemies.add(enemy);
    }

        // ---------------------------------------------------------------
    // Tiro comum: 1 bala
    shoot() {
        // Cria o sprite da bala
        const bullet = this.physics.add.sprite(
            this.player.x,
            this.player.y,
            'bullet'
        );

        // Inicia animação da bala / escala da bala / origem
        bullet.play('bullet_anim');
        bullet.setScale(3);
        bullet.setOrigin(0.5, 0.5);

        bullet.body.setSize(
        bullet.width * 0.05,   
        bullet.height * 0.2
        );
        // Adiciona ao grupo de bullets
        this.bullets.add(bullet);

        // Obtém o ângulo até o pointer
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            pointer.worldX,
            pointer.worldY
        );

        // Rotaciona o sprite para a direção do disparo
        bullet.rotation = angle;

        // Velocidade
        const speed = 500;

        bullet.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Auto-destruição após 2s
        this.time.delayedCall(2000, () => bullet.destroy());
        this.sfx.playershoot.play();
    }
    
    // ---------------------------------------------------------------
    // Tiro triplo: 3 balas (estrelinhas)
    useGun() {
        // Atira 3 balas em ângulos levemente diferentes
        const angleOffsets = [-0.2, 0, 0.2];

        const pointer = this.input.activePointer;
        const baseAngle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            pointer.worldX,
            pointer.worldY
        );


        angleOffsets.forEach(offset => {
            // Cria o sprite da bala
            const bullet = this.physics.add.sprite(
                this.player.x,
                this.player.y,
                'tripleBullet'
            );

            bullet.play('tripleBullet_anim');
            bullet.setOrigin(0.5, 0.5);
            bullet.setScale(1.5);

            bullet.body.setSize(
            bullet.width * 0.2,   
            bullet.height * 0.2
            );

            this.bullets.add(bullet);

            // Define o ângulo do tiro baseado no desvio
            const angle = baseAngle + offset;

            // Rotaciona a bala na direção correta
            bullet.rotation = angle;

            // Velocidade
            const speed = 500;
            bullet.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            // Auto-destruição depois de 2s
            this.time.delayedCall(2000, () => bullet.destroy());
        });
        this.sfx.playertripleshoot.play();
    }
    
    // ---------------------------------------------------------------
    // Raio lunar
    shootMoonBeam() {
        const beam = this.physics.add.sprite(
            this.player.x,
            this.player.y,
            'lunarRay'
        );

        beam.play('lunarRay_anim');
        beam.setOrigin(0, 0.5);
        beam.setScale(2);

        // Beam não se move
        beam.body.setVelocity(0, 0);

        // Direção do feixe
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            pointer.worldX,
            pointer.worldY
        );

        beam.rotation = angle;

        // Hitbox físico real
        beam.body.setSize(100, 50); // ajuste fino se quiser
        beam.body.setOffset(0, -10);

        // Agora sim: deteção real
        this.physics.add.overlap(beam, this.enemies, (beam, enemy) => {
            enemy.destroy();
        });

        // Duração
        this.time.delayedCall(500, () => beam.destroy());
        this.sfx.playerlunarray.play();

    }
    // ---------------------------------------------------------------   
    // Método para efeito de impacto (explosão dos inimigos)
    createImpactEffect(x, y) {
        const impact = this.add.sprite(x, y, "impact_effect");
        if (this.anims.exists("impact_anim")) {
            impact.play("impact_anim");
            impact.on('animationcomplete', () => {
                impact.destroy();
            });
        } else {
            this.time.delayedCall(300, () => {
                impact.destroy();
            });
        }
    }

    // ---------------------------------------------------------------
    // Começar nova fase
    startNextPhase() {
        const next = this.currentPhase + 1;
        this.currentPhase = next;
        this.timeLeft = this.phaseTimes[next];
        this.phaseActive = true;
        this.phaseText.setText(`Fase ${next} — ${this.phaseNames[next]}`);
        this.timerText.setText(this.timeLeft);
        this.startPhase(next);
    }

    // ---------------------------------------------------------------
    // Colisões balas X inimigos
    bulletHitEnemy(bullet, enemy) {
        // Destrói a bala
        if (bullet && bullet.active) bullet.destroy();
        if (!enemy || !enemy.active) return;

        // Cria explosão
        const explosion = this.add.sprite(enemy.x, enemy.y, 'enemyExplosion');
        explosion.play('enemy_explode');
        this.sfx.enemyexplosion.play();

        // Destrói inimigo após a animação da explosão
        explosion.on('animationcomplete', () => {
            if (explosion) explosion.destroy();
        });

        enemy.destroy();

        // XP
        this.xp += 5;

        // Desbloqueia upgrades por nível (só toca som uma vez)
        if (this.level === 2 && !this.dashUnlocked) {
            this.upgrades.unlock('dash');
            this.sfx.upgrades.play();
            this.dashUnlocked = true;
        }
        if (this.level === 3 && !this.gunUnlocked) {
            this.upgrades.unlock('machineGun');
            this.sfx.upgrades.play();
            this.gunUnlocked = true;
        }
        if (this.level === 4 && !this.lunarUnlocked) {
            this.upgrades.unlock('lunarBeam');
            this.sfx.upgrades.play();
            this.lunarUnlocked = true;
        }            

        // Level up simples
        if (this.xp >= this.level * 50) {
            this.level++;
            this.enemySpeed += 10;
        }

        // Atualiza HUD
        this.updateHudBars();
    }


    // ---------------------------------------------------------------
    // Perda de vida do player
    playerHit(player, enemy) {
        enemy.destroy();
        this.playerHP -= 10;
        this.sfx.playerhit.play();
        if (this.playerHP <= 0) {
            this.scene.start("GameOverScene", { xp: this.xp, level: this.level, victory: false });
        }
    }

    // ---------------------------------------------------------------
    // Benção da aurora, entre fases.
    showAuroraBlessing(nextPhase) {
        this.phaseActive = false;
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.remove();
            this.enemySpawnTimer = null;
        }
        this.player.body.setVelocity(0);
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);

        this.prepareNextPhaseSilently(nextPhase);

        this.sfx.phaseup.play();
        this.auroraBg = this.add.image(400, 300, "aurora")
            .setDepth(10000)
            .setAlpha(0);

        this.auroraText = this.add.text(
            400, 520,
            "Alune abençoa sua jornada.\nSua vida é restaurada.",
            {
                fontSize: "32px",
                color: "#ffffff",
                align: "center",
                stroke: "#cddeffff",
                strokeThickness: 2,
                shadow: { blur: 25, color: "#004a83ff", fill: true }
            }
        )
        .setOrigin(0.5)
        .setDepth(10001)
        .setAlpha(0);

        // Cura o player
        this.playerHP = this.maxHP;
        this.updateHudBars();

        this.tweens.add({
            targets: [this.auroraBg, this.auroraText],
            alpha: 1,
            duration: 600,
            ease: "Sine.easeInOut"
        });

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [this.auroraBg, this.auroraText],
                alpha: 0,
                duration: 500,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    // Limpa aurora
                    this.auroraBg.destroy();
                    this.auroraText.destroy();
                    
                    // 6. REATIVA FASE (já estava preparada)
                    this.phaseActive = true;
                    this.phaseText.setAlpha(1);
                    this.timerText.setAlpha(1);
                    if (this.enemySpawnTimer) this.enemySpawnTimer.paused = false;
                }
            });
        });
    }

    // ---------------------------------------------------------------
    // Prepara a nova fase
    /*
    Manter essa função p evitar as "piscadas" de tela entre as transições
    modelo do site phaser
    */
    prepareNextPhaseSilently(nextPhase) {
        this.currentPhase = nextPhase;
        this.timeLeft = this.phaseTimes[nextPhase];
        
        // Atualiza textos mas deixa invisível por enquanto
        this.phaseText.setText(`Fase ${nextPhase} — ${this.phaseNames[nextPhase]}`)
            .setAlpha(0);
        this.timerText.setText(this.timeLeft)
            .setAlpha(0);
        
        // Configura fase
        let spawnRate = 1000;
        let speed = 100;
        if (nextPhase === 2) { spawnRate = 800; speed = 140; }
        else if (nextPhase === 3) { spawnRate = 500; speed = 180; }
        this.enemySpeed = speed;

        // Prepara timer mas não inicia
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemySpawnTimer = this.time.addEvent({ 
            delay: spawnRate, 
            callback: () => this.spawnEnemy(), 
            loop: true,
            paused: true
        });
    }   

    // Desenha barras arredondadas usando Graphics
    createRoundedBar(x, y, width, height, color, radius = 8) {
        const gfx = this.add.graphics();
        gfx.fillStyle(color, 1);
        gfx.fillRoundedRect(0, 0, width, height, radius);

        const bar = this.add.container(x, y, [gfx]);
        bar.setSize(width, height);

        bar.fullWidth = width;
        bar.gfx = gfx;

        return bar;
    }

    // ---------------------------------------------------------------
    // Atualização geral
    update() {
        if (!this.phaseActive) return;

        const body = this.player.body;
        let vx = 0, vy = 0;

        // WASD
        if (this.cursors.left.isDown) vx = -this.playerSpeed;
        if (this.cursors.right.isDown) vx = this.playerSpeed;
        if (this.cursors.up.isDown) vy = -this.playerSpeed;
        if (this.cursors.down.isDown) vy = this.playerSpeed;

        // Setas
        if (this.arrowKeys.left.isDown) vx = -this.playerSpeed;
        if (this.arrowKeys.right.isDown) vx = this.playerSpeed;
        if (this.arrowKeys.up.isDown) vy = -this.playerSpeed;
        if (this.arrowKeys.down.isDown) vy = this.playerSpeed;

        body.setVelocity(vx, vy);

        // Normaliza diagonais (opcional)
        if (vx !== 0 && vy !== 0) {
            body.velocity.normalize().scale(this.playerSpeed);
        }

        // -----------------------------------------
        // ANIMAÇÕES DO PLAYER (apenas UMA vez aqui)
        // -----------------------------------------
        if (vx === 0 && vy === 0) {
            this.player.anims.stop();
        } else {
            if (vy < 0) {
                this.player.anims.play('back', true);
            } else if (vy > 0) {
                this.player.anims.play('front', true);
            } else if (vx > 0) {
                this.player.anims.play('right', true);
            } else if (vx < 0) {
                this.player.anims.play('left', true);
            }
        }

        // -----------------------------------------
        // Dash
        // -----------------------------------------
        if (Phaser.Input.Keyboard.JustDown(this.cursors.dash) && this.upgrades.canUse("dash") && !this.isDashing) {
            if (this.upgrades.use("dash")) {
                this.sfx.playerdash.play();
                const dashMultiplier = 3;
                const dashDuration = 200; // duração em ms

                this.isDashing = true;
                this.playerSpeed *= dashMultiplier;
                this.player.alpha = 0.6;

                this.time.delayedCall(dashDuration, () => {
                    this.playerSpeed /= dashMultiplier;
                    this.player.alpha = 1;
                    this.isDashing = false;
                });

            }
        }
        // Tiro triplo
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E')) && 
            this.upgrades.canUse("machineGun")) {
            if (this.upgrades.use("machineGun")) this.useGun();
        }

        // Raio lunar
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('Q')) && 
            this.upgrades.canUse("lunarBeam")) {
            if (this.upgrades.use("lunarBeam")) this.shootMoonBeam();
        }

        // -----------------------------------------
        // Perseguição + direção do inimigo
        this.enemies.children.iterate((enemy) => {
            if (!enemy || !enemy.body || !enemy.active) return;

            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            enemy.body.setVelocity(Math.cos(angle) * this.enemySpeed, Math.sin(angle) * this.enemySpeed);

            // Orientação da animação
            if (this.player.x < enemy.x) {
                // Player à esquerda = vira para direita
                enemy.setFlipX(true); 
            } else {
                // Player à direita =vira para esquerda
                enemy.setFlipX(false);  
            }
        });

        // HUD e pausa
        this.updateHudBars();

        if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            this.scene.launch("PauseScene");
            this.sfx.menupause.play();
            this.scene.pause();
        }

        // Atualiza as bolinhas de Cooldown
        this.upgrades.updateCooldownGraphics();
    }

    // ---------------------------------------------------------------
    // Atualiza as barras do menu HUD

    updateHudBars() {
        // HP
        const hpPercent = Phaser.Math.Clamp(this.playerHP / this.maxHP, 0, 1);
        this.hpBar.gfx.clear();
        this.hpBar.gfx.fillStyle(0xff4444);
        this.hpBar.gfx.fillRoundedRect(0, 0, this.hpBar.fullWidth * hpPercent, 16, 8);

        // XP
        const xpNeeded = this.level * 50;
        const xpPercent = Phaser.Math.Clamp((this.xp % xpNeeded) / xpNeeded, 0, 1);
        this.xpBar.gfx.clear();
        this.xpBar.gfx.fillStyle(0x4482ff);
        this.xpBar.gfx.fillRoundedRect(0, 0, this.xpBar.fullWidth * xpPercent, 16, 8);
    }

    restartGame() {
        // --- Reset atributos essenciais ---
        this.playerSpeed = 200;
        this.enemySpeed = 60;
        this.fireRate = 400;

        this.xp = 5;
        this.level = 1;

        this.maxHP = 150;
        this.playerHP = this.maxHP;

        this.currentPhase = 1;
        this.timeLeft = this.phaseTimes[1];
        this.phaseActive = true;

        if (this.upgrades) {
            this.upgrades.hasDash = false;
            this.upgrades.hasGun = false;
            this.upgrades.hasLunarBeam = false;
            if (this.upgrades.activeUpgrades && typeof this.upgrades.activeUpgrades.clear === 'function') {
                this.upgrades.activeUpgrades.clear();
            }
        }

        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.remove(false);
            this.enemySpawnTimer = null;
        }
        if (this.countdownTimer) {
            this.countdownTimer.remove(false);
            this.countdownTimer = null;
        }

        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: this.updateTimer,
            callbackScope: this
        });

        if (this.player) {
            this.player.setPosition(this.scale.width / 2, this.scale.height / 2);
            if (this.player.body && typeof this.player.body.setVelocity === 'function') {
                this.player.body.setVelocity(0, 0);
            }
        }

        if (this.bgm && this.bgm.isPlaying) {
            this.tweens.add({
                targets: this.bgm,
                volume: 0,
                duration: 400,
                onComplete: () => { if (this.bgm) this.bgm.stop(); }
            });
        }
        this.bgm = this.sound.add("music_game", { volume: 0, loop: true });
        this.bgm.play();
        this.tweens.add({ targets: this.bgm, volume: 0.4, duration: 800 });

        // Reinicia fase 1 (cria enemySpawnTimer)
        this.startPhase(1);
    }
}
