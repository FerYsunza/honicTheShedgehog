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
        this.x = 50; // Starting X position
        this.y = canvas.height - (canvas.height / 3) - 20; // Adjusted Y position based on canvas height
        this.radius = 20; // Radius of Honic's body
        this.gravity = 0.8;
        this.lift = -18;
        this.velocity = 0;
        this.onGround = true;
        this.rotationAngle = 0; // Initial rotation angle for spinning effect
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
        this.rotationAngle += 0.2; // Increment the angle for the spinning effect
        this.draw(ctx);
    }

    draw(ctx) {
        ctx.save(); // Save the current state of the canvas

        // Move the rotation origin to Honic's center and rotate
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);

        // Move back before drawing Honic
        ctx.translate(-this.x, -this.y);

        // Body
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        this.drawSpikes(ctx); // Draw spikes with consideration for rotation
        this.drawEye(ctx); // Draw Honic's eye
        this.drawShoe(ctx); // Draw Honic's shoe

        ctx.restore(); // Restore the canvas state to not affect other drawings
    }

    drawSpikes(ctx) {
        const spikeLength = this.radius * 0.6; // Adjusted spike length
        const numberOfSpikes = 6; // Total number of spikes
        const startAngle = Math.PI * 0.75; // Start angle for spikes
        const endAngle = Math.PI * 1.45; // End angle for spikes
        const angleIncrement = (endAngle - startAngle) / (numberOfSpikes - 1);

        ctx.fillStyle = 'blue';
        for (let i = 0; i < numberOfSpikes; i++) {
            const angle = startAngle + (i * angleIncrement);

            const baseWidth = this.radius * 0.2; // Adjusted base width for thicker appearance
            const base1X = this.x + Math.cos(angle - angleIncrement / 6) * (this.radius - baseWidth / 2);
            const base1Y = this.y + Math.sin(angle - angleIncrement / 6) * (this.radius - baseWidth / 2);
            const base2X = this.x + Math.cos(angle + angleIncrement / 6) * (this.radius - baseWidth / 2);
            const base2Y = this.y + Math.sin(angle + angleIncrement / 6) * (this.radius - baseWidth / 2);

            const tipX = this.x + Math.cos(angle) * (this.radius + spikeLength);
            const tipY = this.y + Math.sin(angle) * (this.radius + spikeLength);

            ctx.beginPath();
            ctx.moveTo(base1X, base1Y);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(base2X, base2Y);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawEye(ctx) {
        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.radius / 2, this.y - this.radius / 2, this.radius / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawShoe(ctx) {
        // Shoe
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius - 5, this.radius / 2, this.radius / 4, 0, 0, Math.PI);
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
