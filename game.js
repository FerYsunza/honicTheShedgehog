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
        this.honic = new Honic(this.canvas, () => this.generateSound('sine', { frequency: 784.00, startGain: 0.7, endGain: 0.1, duration: 0.5 })); // Boing sound for jumping
        this.landscape = new Landscape(this.canvas);
        this.rings = new RingManager(this.canvas, this.honic, () => this.generateSound('triangle', { frequency: 2093, startGain: 0.5, endGain: 0.01, duration: 0.3 })); // Pling sound for ring collection
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

    generateSound(type, options) {
        let oscillator = this.audioContext.createOscillator();
        let gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.type = type;
        if (options.frequency) {
            oscillator.frequency.value = options.frequency;
        }
        gainNode.gain.setValueAtTime(options.startGain || 1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(options.endGain || 0.001, this.audioContext.currentTime + (options.duration || 1));
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + (options.duration || 1));
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.landscape.draw(this.ctx);
        this.honic.update(this.ctx);
        this.rings.update(this.ctx);
        requestAnimationFrame(() => this.update());
    }
}

class Honic {
    constructor(canvas, jumpSoundCallback) {
        this.canvas = canvas;
        this.jumpSoundCallback = jumpSoundCallback;
        this.x = 50;
        this.y = this.canvas.height - (this.canvas.height / 3) - 20;
        this.radius = 20;
        this.gravity = 0.8;
        this.lift = -18;
        this.velocity = 0;
        this.onGround = true;
    }

    jump() {
        if (this.onGround) {
            this.velocity = this.lift;
            this.onGround = false;
            this.jumpSoundCallback();
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
        ctx.fillStyle = '#228B22';
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
    constructor(canvas, honic, collectSoundCallback) {
        this.canvas = canvas;
        this.honic = honic;
        this.collectSoundCallback = collectSoundCallback;
        this.rings = [];
        this.populateRings();
    }

    populateRings() {
        for (let i = 0; i < 5; i++) {
            this.rings.push({
                x: this.canvas.width + (i * 300),
                y: this.canvas.height - (this.canvas.height / 3) - 150 - (Math.random() * 100),
                outerRadius: 15, // Increased size for outer radius
                innerRadius: 8, // Inner radius to create the hole effect
                collected: false,
            });
        }
    }

    update(ctx) {
        this.rings.forEach(ring => {
            if (!ring.collected && this.checkCollision(ring)) {
                ring.collected = true;
                this.collectSoundCallback();
            }
        });

        this.shiftRings();
        this.draw(ctx);
    }

    draw(ctx) {
        this.rings.forEach(ring => {
            if (!ring.collected) {
                // Draw the outer circle
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.outerRadius, 0, Math.PI * 2);
                ctx.fill();

                // Draw the inner circle to create the hole, simulating a donut shape
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.innerRadius, 0, Math.PI * 2, true);
                ctx.fillStyle = '#87CEEB'; // You can match the background color if it's not black
                ctx.fill();
            }
        });
    }

    checkCollision(ring) {
        let dx = ring.x - this.honic.x;
        let dy = ring.y - this.honic.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        // Adjust collision detection to consider the outerRadius
        return distance < this.honic.radius + ring.outerRadius && distance > ring.innerRadius - this.honic.radius;
    }

    shiftRings() {
        this.rings.forEach(ring => ring.x -= this.canvas.width * 0.005);
        if (this.rings.length < 5 || this.rings[this.rings.length - 1].x < this.canvas.width - 300) {
            this.populateRings();
        }
    }
}


// Initialize the game
new Game('gameCanvas');
