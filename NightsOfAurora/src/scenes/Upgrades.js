import Phaser from "phaser";

export default class Upgrades {
    constructor(scene) {
        this.scene = scene;

        this.list = {
            dash: {
                unlocked: false,
                cooldown: 2000,
                lastUsed: -Infinity,
                key: "SPACE",
                description: "Use SPACE para dar um dash rápido",
                icon: null,
                graphics: null,
            },
            machineGun: {
                unlocked: false,
                cooldown: 5000,
                lastUsed: -Infinity,
                key: "E",
                description: "Use E para ativar o Tiro Triplo",
                icon: null,
                graphics: null,
            },
            lunarBeam: {
                unlocked: false,
                cooldown: 10000,
                lastUsed: -Infinity,
                key: "Q",
                description: "Use Q para disparar o Raio Lunar",
                icon: null,
                graphics: null,
            },
        };

        this.createIcons();
    }

    /*unlock(upgradeName) {
        const upgrade = this.list[upgradeName];
        if (!upgrade || upgrade.unlocked) return;

        upgrade.unlocked = true;

        // Mostra tooltip explicando o botão
        const { width, height } = this.scene.scale;
        const tooltip = this.scene.add.text(
            width / 2, height / 2,
            `Novo upgrade desbloqueado: ${upgradeName.toUpperCase()}\n${upgrade.description}`,
            {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: 10,
                align: "center",
            }
        ).setOrigin(0.5).setDepth(10000);

        // Pausa apenas a jogabilidade
        this.scene.phaseActive = false;

        // Mantém o delayedCall rodando
        this.scene.time.delayedCall(1500, () => {
            tooltip.destroy();
            this.scene.phaseActive = true; // retoma a jogabilidade
        });
    }*/
    
        unlock(upgradeName) {
            const upgrade = this.list[upgradeName];
            if (!upgrade || upgrade.unlocked) return;

            upgrade.unlocked = true;

            const scene = this.scene; // mais fácil de ler

            // Criar caixa estilo menu de pause
            const box = scene.add.rectangle(
                scene.scale.width / 2,
                scene.scale.height / 2,
                500,
                200,
                0x000000,
                0.8
            ).setOrigin(0.5).setDepth(2000);

            const text = scene.add.text(
                scene.scale.width / 2,
                scene.scale.height / 2,
                `Novo upgrade desbloqueado:\n${upgradeName.toUpperCase()}\n${upgrade.description}`,
                {
                    fontSize: "26px",
                    color: "#ffffff",
                    align: "center",
                }
            ).setOrigin(0.5).setDepth(2001);

            scene.phaseActive = false;

            scene.time.delayedCall(3000, () => {
                box.destroy();
                text.destroy();

                scene.phaseActive = true;
            });
        }

    canUse(upgradeName) {
        const upgrade = this.list[upgradeName];
        if (!upgrade || !upgrade.unlocked) return false;
        return this.scene.time.now - upgrade.lastUsed >= upgrade.cooldown;
    }

    use(upgradeName) {
        const upgrade = this.list[upgradeName];
        if (!this.canUse(upgradeName)) return false;

        upgrade.lastUsed = this.scene.time.now;
        return true;
    }

    createIcons() {
        const { width, height } = this.scene.scale;
        const startX = width - 60;
        const startY = height - 60;
        let offset = 0;

        for (const key in this.list) {
            const upgrade = this.list[key];

            // Círculo base
            upgrade.icon = this.scene.add.circle(
                startX - offset, startY, 25, 0x666666
            ).setDepth(999);

            // Overlay de cooldown
            upgrade.graphics = this.scene.add.graphics().setDepth(1000);

            offset += 70;
        }
    }

    reset() {
        for (const key in this.list) {
            const upgrade = this.list[key];
            upgrade.unlocked = false;
            upgrade.lastUsed = 0;

            // Remove ícones temporários ou gráficos se quiser reset visual
            if (upgrade.graphics) upgrade.graphics.clear();
        }

        // Flags auxiliares para GameScene
        this.scene.hasDash = false;
        this.scene.hasGun = false;
        this.scene.hasLunarBeam = false;
    }
    updateCooldownGraphics() {
        for (const key in this.list) {
            const upgrade = this.list[key];
            if (!upgrade.unlocked) continue;

            const ratio = Phaser.Math.Clamp(
                (this.scene.time.now - upgrade.lastUsed) / upgrade.cooldown,
                0, 1
            );

            const { x, y } = upgrade.icon;
            upgrade.graphics.clear();
            upgrade.graphics.fillStyle(0x00ff00, 0.5);
            upgrade.graphics.slice(
                x, y, 25, -Math.PI / 2, -Math.PI / 2 + ratio * 2 * Math.PI, false
            );
            upgrade.graphics.fillPath();
        }
    }
}
