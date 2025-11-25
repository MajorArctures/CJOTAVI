export default class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene");
    }

    preload() {
        // Carrega os slides
        this.load.image("img1", "assets/images/winscene/001.png");
        this.load.image("img2", "assets/images/winscene/002.png");
        this.load.image("img3", "assets/images/winscene/003.png");

        // Fonte pixel
        this.load.font("pressStart2P", "assets/fonts/pressStart2P/PressStart2P-Regular.ttf");
    }

    create() {
        this.bgm = this.sound.add('music_cutscene', { volume: 0.0, loop: true });
        this.bgm.play();

         this.tweens.add({
            targets: this.bgm,
            volume: 0.5,  // volume final
            duration: 2000, // 2 segundos para fade
            ease: 'Linear'
        });

        this.slides = [
            { key: "img1", text: "Aurelion foi libertado e a ordem recebeu a benção do Alvorecer..." },
            { key: "img2", text: "Após anos de noite eterna a Aurora da manhã finalmente tomou o céu..." },
            { key: "img3", text: "O FIM... ... Por enquanto" },
        ];

        this.currentSlide = 0;

        // Imagem do slide
        this.image = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.slides[0].key
        )
        .setAlpha(0)
        .setOrigin(0.5)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const margin = 40;

        this.text = this.add.text(
            this.cameras.main.width / 2 + (this.cameras.main.width / 4),  // Centro da metade direita
            this.cameras.main.height / 2,  // Centro vertical
            "",
            {
                fontFamily: "pressStart2P",
                fontSize: "16px",
                color: "#ffffff",
                lineSpacing: 13,
                align: "center",  // Centraliza o texto
                wordWrap: {
                    width: (this.cameras.main.width / 2) - margin, 
                    useAdvancedWrap: true
                }
            }
        )
        .setOrigin(0.5, 0.5)  
        .setAlpha(0);

        this.skipText = this.add.text(
            this.cameras.main.width / 2,
            30,
            "Pressione tecla para avançar",
            {
                fontFamily: "pressStart2P",
                fontSize: "12px",
                color: "#bbbbbb",
            }
        ).setOrigin(0.5).setAlpha(0.6);

        // Fade inicial
        this.fadeInSlide();

        // Avança cutscene
        this.input.once("pointerdown", () => this.nextSlide());
        this.input.keyboard.once("keydown", () => this.nextSlide());
    }

    fadeInSlide() {
        const slide = this.slides[this.currentSlide];

        // Troca imagem e reseta transparência
        this.image.setTexture(slide.key);
        this.image.setAlpha(0);

        this.tweens.add({
            targets: this.image,
            alpha: 1,
            duration: 800
        });

        this.text.setText(slide.text);
        this.text.setAlpha(0);  

        this.tweens.add({
            targets: this.text,  
            alpha: 1,
            duration: 800
        });
    }

   nextSlide() {
        this.currentSlide++;

        // Fim reinicia GameScene e volta ao menu
        if (this.currentSlide >= this.slides.length) {

            // Fade no BGM
            this.tweens.add({
                targets: this.bgm,
                volume: 0,
                duration: 800,
                onComplete: () => this.bgm.stop()
            });

            // Volta ao Menu
            const gameScene = this.scene.get("GameScene");
            gameScene.restartGame();
            this.scene.start("MenuScene");
            return;
        }

        // Fade OUT antes de trocar slide
        this.tweens.add({
            targets: [this.image, this.text],
            alpha: 0,
            duration: 400,
            onComplete: () => this.fadeInSlide()
        });

        // Recria listeners
        this.input.once("pointerdown", () => this.nextSlide());
        this.input.keyboard.once("keydown", () => this.nextSlide());
    }
}
