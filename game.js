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
      this.score = 0;
      this.initCanvas();
      this.honic = new Honic(this.canvas, () => this.generateSound('sine', { frequency: 784.00, startGain: 0.7, endGain: 0.1, duration: 0.5 }));
      this.landscape = new Landscape(this.canvas);
      this.rings = new RingManager(this.canvas, this.honic, () => this.generateSound('triangle', { frequency: 2093, startGain: 0.5, endGain: 0.01, duration: 0.3 }), this);
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
      this.drawScore();
      requestAnimationFrame(() => this.update());
    }
  
    drawScore() {
      this.ctx.font = "16px 'Press Start 2P'";
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.textAlign = "right";
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 20, 30);
    }
  }
  
  class Honic {
    constructor(canvas, jumpSoundCallback) {
      this.canvas = canvas;
      this.jumpSoundCallback = jumpSoundCallback;
      this.x = 50;
      this.y = canvas.height - (canvas.height / 3) - 20;
      this.radius = 20;
      this.gravity = 0.8;
      this.lift = -18;
      this.velocity = 0;
      this.onGround = true;
      this.rotationAngle = 0;
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
      this.rotationAngle += 0.6;
      this.draw(ctx);
    }
  
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotationAngle);
      ctx.translate(-this.x, -this.y);
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      this.drawSpikes(ctx);
      this.drawEye(ctx);
      this.drawShoe(ctx);
      ctx.restore();
    }
  
    drawSpikes(ctx) {
      const spikeLength = this.radius * 0.6;
      const numberOfSpikes = 6;
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 1.45;
      const angleIncrement = (endAngle - startAngle) / (numberOfSpikes - 1);
      ctx.fillStyle = 'blue';
      for (let i = 0; i < numberOfSpikes; i++) {
        const angle = startAngle + (i * angleIncrement);
        const baseWidth = this.radius * 0.01;
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
      const eyeRadius = this.radius / 3;
      const eyeX = this.x + this.radius / 2;
      const eyeY = this.y - this.radius / 2;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      const pupilRadius = eyeRadius / 2;
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const eyebrowStartX = eyeX + eyeRadius * 0.6;
      const eyebrowStartY = eyeY - eyeRadius * 0.8;
      const eyebrowEndX = eyeX - eyeRadius * 0.2;
      const eyebrowEndY = eyeY - eyeRadius * 1.1;
      ctx.moveTo(eyebrowStartX, eyebrowStartY);
      ctx.lineTo(eyebrowEndX, eyebrowEndY);
      ctx.stroke();
    }
  
    drawShoe(ctx) {
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
    constructor(canvas, honic, collectSoundCallback, game) {
      this.canvas = canvas;
      this.honic = honic;
      this.collectSoundCallback = collectSoundCallback;
      this.game = game;
      this.rings = [];
      this.populateRings();
    }
  
    populateRings() {
      for (let i = 0; i < 5; i++) {
        const honicGroundLevel = this.canvas.height - (this.canvas.height / 3);
        const upperLimit = honicGroundLevel - 150;
        const lowerLimit = honicGroundLevel - this.honic.radius * 2;
        this.rings.push({
          x: this.canvas.width + (i * 300),
          y: lowerLimit + (Math.random() * (upperLimit - lowerLimit)),
          outerRadius: 15,
          innerRadius: 8,
          collected: false,
        });
      }
    }
  
    update(ctx) {
      this.rings.forEach(ring => {
        if (!ring.collected && this.checkCollision(ring)) {
          ring.collected = true;
          this.collectSoundCallback();
          this.game.score += 10;
        }
      });
  
      this.shiftRings();
      this.draw(ctx);
    }
  
    draw(ctx) {
      this.rings.forEach(ring => {
        if (!ring.collected) {
          ctx.fillStyle = 'yellow';
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.outerRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.innerRadius, 0, Math.PI * 2, true);
          ctx.fillStyle = '#87CEEB';
          ctx.fill();
        }
      });
    }
  
    checkCollision(ring) {
      let dx = ring.x - this.honic.x;
      let dy = ring.y - this.honic.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
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