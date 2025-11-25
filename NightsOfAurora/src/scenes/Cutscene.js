export default class CutsceneScene extends Phaser.Scene {
    constructor() {
        super({ key: "CutsceneScene" });
    }

    preload() {
        this.load.image("slide1", "assets/images/cutscene1/slide1.png");
        this.load.image("slide2", "assets/images/cutscene1/slide2.png");
        this.load.image("slide3", "assets/images/cutscene1/slide3.png");
        this.load.image("slide4", "assets/images/cutscene1/slide4.png");
        this.load.image("slide5", "assets/images/cutscene1/slide5.png");

        this.load.font("pressStart2P", "assets/fonts/pressStart2P/PressStart2P-Regular.ttf");
    }

    create() {
        this.bgm = this.sound.add('music_cutscene', { volume: 0.0, loop: true });
        this.bgm.play();
        
        this.tweens.add({
            targets: this.bgm,
            volume: 0.5,
            duration: 2000,
            ease: 'Linear'
        });

        this.slides = [
            { key: "slide1", text: "O mundo está mergulhado numa noite eterna após aprisionarem Aurelion o espírito da Alvorecer..." },
            { key: "slide2", text: "Mesmo após a derrota de Lucios e a maior parte de suas tropas, o Alvorecer não retornou..." },
            { key: "slide3", text: "Assim, o mundo segue em noite eterna... A única fonte de esperança é Alune, o espírito da Aurora Boreal que ilumina os céus..." },
            { key: "slide4", text: "A ordem de Alune cumpre a missão de enfrentar a noite para libertar Aurelion... cada mago defende o território por 3 noite..." },
            { key: "slide5", text: "A missão de Akshan é terminar a missão de seu mestre e sobreviver por mais três noites para libertar Aurelion." }
        ];

        this.currentSlide = 0;

        // SLIDE
        this.image = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.slides[0].key
        )
        .setAlpha(0)
        .setOrigin(0.5)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // TEXTO DO SLIDE
        const margin = 40;

        this.text = this.add.text(
            this.cameras.main.width / 2 + (this.cameras.main.width / 4),
            this.cameras.main.height / 2,
            "",
            {
                fontFamily: "pressStart2P",
                fontSize: "16px",
                color: "#ffffff",
                lineSpacing: 13,
                align: "center",
                wordWrap: {
                    width: (this.cameras.main.width / 2) - margin,
                    useAdvancedWrap: true
                }
            }
        )
        .setOrigin(0.5)
        .setAlpha(0);

        // TEXTO DE "PULAR"
        this.skipText = this.add.text(
            this.cameras.main.width / 2,
            30,
            "Pressione P para pular e qualquer tecla para avançar",
            {
                fontFamily: "pressStart2P",
                fontSize: "12px",
                color: "#bbbbbb",
            }
        ).setOrigin(0.5).setAlpha(0.6);

        // Fade inicial
        this.fadeInSlide();

        // Avança slide
        this.input.once("pointerdown", () => this.nextSlide());
        this.input.keyboard.once("keydown", () => this.nextSlide());

        //Pular cutscene
        this.input.keyboard.on("keydown-P", () => this.skipCutscene());
    }

    fadeInSlide() {
        const slide = this.slides[this.currentSlide];

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

        if (this.currentSlide >= this.slides.length) {
            this.skipCutscene();
            return;
        }

        this.tweens.add({
            targets: [this.image, this.text],
            alpha: 0,
            duration: 400,
            onComplete: () => this.fadeInSlide()
        });

        this.input.once("pointerdown", () => this.nextSlide());
        this.input.keyboard.once("keydown", () => this.nextSlide());
    }

    skipCutscene() {
        this.tweens.add({
            targets: this.bgm,
            volume: 0,
            duration: 800,
            onComplete: () => this.bgm.stop()
        });

        this.scene.start("GameScene");
    }
}
