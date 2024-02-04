//
// honicTheShedgehog
//
// By Fer Ysunza, 03/02/24.
//

class Game {
    constructor(canvasId) {
      this.init(canvasId);
      this.initEntities();
      this.addEventListeners();
      this.update();
    }
  
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.score = 0;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  
    initEntities() {
      this.honic = new Honic(this);
      this.landscape = new Landscape(this.canvas);
      this.rings = new RingManager(this);
    }
  
    addEventListeners() {
      window.addEventListener('keydown', (e) => e.code === "Space" && this.honic.jump());
      window.addEventListener('touchstart', () => this.honic.jump());
    }
  
    generateSound(type, { frequency, startGain, endGain, duration }) {
      let oscillator = this.audioContext.createOscillator();
      let gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode).connect(this.audioContext.destination);
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(startGain, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(endGain, this.audioContext.currentTime + duration);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    }
  
    update() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.landscape.draw(this.ctx);
      this.honic.update();
      this.rings.update();
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
    constructor(game) {
      this.game = game;
      this.canvas = game.canvas;
      this.x = 50;
      this.y = this.canvas.height - (this.canvas.height / 3) - 20;
      this.radius = 20;
      this.gravity = 0.8;
      this.lift = -18;
      this.velocity = 0;
      this.rotationAngle = 0;
    }
  
    jump() {
      if (this.y >= this.canvas.height - (this.canvas.height / 3) - this.radius) {
        this.velocity = this.lift;
        this.game.generateSound('sine', { frequency: 784.00, startGain: 0.7, endGain: 0.1, duration: 0.5 });
      }
    }
  
    update() {
      this.velocity += this.gravity;
      this.y += this.velocity;
      this.y = Math.min(this.y, this.canvas.height - (this.canvas.height / 3) - this.radius);
      this.rotationAngle += 0.6;
      this.draw();
    }
  
    draw() {
      this.game.ctx.save();
      this.game.ctx.translate(this.x, this.y);
      this.game.ctx.rotate(this.rotationAngle);
      this.game.ctx.translate(-this.x, -this.y);
      this.drawBody();
      this.drawSpikes();
      this.drawEye();
      this.drawShoe();
      this.game.ctx.restore();
    }
  
    drawBody() {
      this.game.ctx.fillStyle = 'blue';
      this.game.ctx.beginPath();
      this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.game.ctx.fill();
    }
  
    drawSpikes() {
      const spikeLength = this.radius * 0.6;
      const numberOfSpikes = 6;
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 1.45;
      const angleIncrement = (endAngle - startAngle) / (numberOfSpikes - 1);
      this.game.ctx.fillStyle = 'blue';
      for (let i = 0; i < numberOfSpikes; i++) {
        const angle = startAngle + (i * angleIncrement);
        const baseWidth = this.radius * 0.01;
        const base1X = this.x + Math.cos(angle - angleIncrement / 6) * (this.radius - baseWidth / 2);
        const base1Y = this.y + Math.sin(angle - angleIncrement / 6) * (this.radius - baseWidth / 2);
        const base2X = this.x + Math.cos(angle + angleIncrement / 6) * (this.radius - baseWidth / 2);
        const base2Y = this.y + Math.sin(angle + angleIncrement / 6) * (this.radius - baseWidth / 2);
        const tipX = this.x + Math.cos(angle) * (this.radius + spikeLength);
        const tipY = this.y + Math.sin(angle) * (this.radius + spikeLength);
        this.game.ctx.beginPath();
        this.game.ctx.moveTo(base1X, base1Y);
        this.game.ctx.lineTo(tipX, tipY);
        this.game.ctx.lineTo(base2X, base2Y);
        this.game.ctx.closePath();
        this.game.ctx.fill();
      }
    }
  
    drawEye() {
      const eyeRadius = this.radius / 3;
      const eyeX = this.x + this.radius / 2;
      const eyeY = this.y - this.radius / 2;
      this.game.ctx.fillStyle = 'white';
      this.game.ctx.beginPath();
      this.game.ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      this.game.ctx.fill();
      const pupilRadius = eyeRadius / 2;
      this.game.ctx.fillStyle = 'black';
      this.game.ctx.beginPath();
      this.game.ctx.arc(eyeX + 2, eyeY, pupilRadius, 0, Math.PI * 2);
      this.game.ctx.fill();
      this.game.ctx.strokeStyle = 'black';
      this.game.ctx.lineWidth = 2;
      this.game.ctx.beginPath();
      const eyebrowStartX = eyeX + eyeRadius * 0.6;
      const eyebrowStartY = eyeY - eyeRadius * 0.8;
      const eyebrowEndX = eyeX - eyeRadius * 0.2;
      const eyebrowEndY = eyeY - eyeRadius * 1.1;
      this.game.ctx.moveTo(eyebrowStartX, eyebrowStartY);
      this.game.ctx.lineTo(eyebrowEndX, eyebrowEndY);
      this.game.ctx.stroke();
    }
  
    drawShoe() {
      this.game.ctx.fillStyle = 'red';
      this.game.ctx.beginPath();
      this.game.ctx.ellipse(this.x, this.y + this.radius - 5, this.radius / 2, this.radius / 4, 0, 0, Math.PI);
      this.game.ctx.fill();
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
    constructor(game) {
      this.game = game;
      this.canvas = game.canvas;
      this.honic = game.honic;
      this.collectSoundCallback = () => game.generateSound('triangle', { frequency: 2093, startGain: 0.5, endGain: 0.01, duration: 0.3 });
      this.rings = [];
      this.populateRings();
    }
  
    populateRings() {
      const spacing = 200;
      const honicGroundLevel = this.canvas.height - (this.canvas.height / 3);
      const upperLimit = honicGroundLevel - 150;
      const lowerLimit = honicGroundLevel - this.honic.radius * 2;
  
      while (this.rings.length < 5 || this.rings[this.rings.length - 1].x < this.canvas.width) {
        this.rings.push({
          x: this.rings.length > 0 ? this.rings[this.rings.length - 1].x + spacing : this.canvas.width + spacing,
          y: lowerLimit + (Math.random() * (upperLimit - lowerLimit)),
          outerRadius: 15,
          innerRadius: 8,
          collected: false,
        });
      }
    }
  
    update() {
      const speedIncrease = this.canvas.width * 0.021;
  
      this.rings = this.rings.filter(ring => {
        if (!ring.collected && this.checkCollision(ring)) {
          ring.collected = true;
          this.collectSoundCallback();
          this.game.score += 10;
          return false;
        }
        return ring.x -= speedIncrease;
      });
  
      this.draw();
      this.populateRings();
    }
  
    draw() {
      this.rings.forEach(ring => {
        if (!ring.collected) {
          this.game.ctx.fillStyle = 'yellow';
          this.game.ctx.beginPath();
          this.game.ctx.arc(ring.x, ring.y, ring.outerRadius, 0, Math.PI * 2);
          this.game.ctx.fill();
          this.game.ctx.beginPath();
          this.game.ctx.arc(ring.x, ring.y, ring.innerRadius, 0, Math.PI * 2, true);
          this.game.ctx.fillStyle = '#87CEEB';
          this.game.ctx.fill();
        }
      });
    }
  
    checkCollision(ring) {
      let dx = ring.x - this.honic.x;
      let dy = ring.y - this.honic.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.honic.radius + ring.outerRadius && distance > ring.innerRadius - this.honic.radius;
    }
  }
  
  new Game('gameCanvas');
  