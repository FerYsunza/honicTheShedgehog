//
// honicTheShedgehog
//
// By Fer Ysunza, 03/02/24.
//

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initCanvas();
        this.honic = new Honic(this.canvas);
        this.landscape = new Landscape(this.canvas);
        this.rings = new RingManager(this.canvas, this.honic);
        this.addEventListeners();
        this.update();
    }

    initCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === "Space") {
                this.honic.jump();
            }
        });

        window.addEventListener('touchstart', () => this.honic.jump());
    }

    generateSound(frequency, type) {
        let oscillator = this.audioContext.createOscillator();
        let gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 1);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.landscape.draw(this.ctx);
        this.honic.update(this.ctx);
        this.rings.update(this.ctx, () => this.generateSound(523.25, 'sine'));
        requestAnimationFrame(() => this.update());
    }
}

class Honic {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 50;
        this.y = this.canvas.height - (this.canvas.height / 3) - 20; // Set dynamically based on the landscape
        this.radius = 20;
        this.gravity = 0.8;
        this.lift = -18; // Increased lift for higher jumps
        this.velocity = 0;
        this.onGround = true;
    }

    jump() {
        if (this.onGround) {
            this.velocity = this.lift;
            this.onGround = false;
        }
    }

    update(ctx) {
        this.velocity += this.gravity;
        this.y += this.velocity;
        let groundLevel = this.canvas.height - (this.canvas.height / 3) - this.radius;
        if (this.y > groundLevel) {
            this.y = groundLevel;
            this.velocity = 0;
            this.onGround = true;
        }
        this.draw(ctx);
    }

    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Landscape {
    constructor(canvas) {
        this.canvas = canvas;
        this.amplitude = 20;
        this.frequency = 0.05;
        this.speed = 2;
        this.index = 0;
    }

    draw(ctx) {
        ctx.fillStyle = '#228B22'; // Green color for the grass
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);
        for (let x = 0; x <= this.canvas.width; x++) {
            const y = this.canvas.height - (this.canvas.height / 3) + Math.sin(x * this.frequency + this.index) * this.amplitude;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.fill();
        this.index += this.speed;
    }
}

class RingManager {
    constructor(canvas, honic) {
        this.canvas = canvas;
        this.honic = honic;
        this.rings = [];
        this.populateRings();
    }

    populateRings() {
        for (let i = 0; i < 5; i++) {
            this.rings.push({
                x: this.canvas.width + (i * 300),
                y: this.canvas.height - (this.canvas.height / 3) - 150 - (Math.random() * 100),
                radius: 10,
                collected: false,
            });
        }
    }

    update(ctx, collectSoundCallback) {
        this.rings = this.rings.filter(ring => {
            if (!ring.collected && this.checkCollision(ring, this.honic)) {
                collectSoundCallback();
                return false;
            }
            return true;
        });
        this.draw(ctx);
        this.shiftRings();
    }

    draw(ctx) {
        this.rings.forEach(ring => {
            if (!ring.collected) {
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    checkCollision(ring, honic) {
        let dx = ring.x - honic.x;
        let dy = ring.y - honic.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < honic.radius + ring.radius;
    }

    shiftRings() {
        this.rings.forEach(ring => ring.x -= this.canvas.width * 0.005);
        if (this.rings[this.rings.length - 1].x < this.canvas.width - 300) {
            this.populateRings();
        }
    }
}

// Initialize the game
new Game('gameCanvas');
