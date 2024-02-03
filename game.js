//
// honicTheShedgehog
//
// By Fer Ysunza, 03/02/24.
//

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Honic properties - Adjusted for higher jumps
    const honic = {
        x: 50,
        y: 0, // Set dynamically based on the landscape
        radius: 20,
        gravity: 0.8,
        lift: -18, // Increased lift for higher jumps
        velocity: 0,
        onGround: true,
    };

    honic.y = canvas.height - (canvas.height / 3) - honic.radius; // Initial Y position

    // Landscape properties
    const landscape = {
        amplitude: 20,
        frequency: 0.05,
        speed: 2,
    };

    // Rings - adjusted positioning to be reachable
    let rings = [];
    const ringRadius = 10;
    const ringSpacing = 300;
    let ringIndex = 0;

    function generateRings() {
        for (let i = 0; i < 5; i++) {
            rings.push({
                x: canvas.width + (i * ringSpacing),
                // Y position adjusted to be within Honic's jump reach
                y: canvas.height - (canvas.height / 3) - 150 - (Math.random() * 100),
                radius: ringRadius,
                collected: false,
            });
        }
    }

    function generateSound(frequency, type) {
        let oscillator = audioContext.createOscillator();
        let gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }

    function drawLandscape() {
        ctx.fillStyle = '#228B22'; // Green color for the grass
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x++) {
            const y = canvas.height - (canvas.height / 3) + Math.sin(x * landscape.frequency + ringIndex) * landscape.amplitude;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
    }

    function drawHonic() {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(honic.x, honic.y, honic.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawRings() {
        rings.forEach(ring => {
            if (!ring.collected) {
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function collectRing() {
        rings.forEach(ring => {
            let dx = ring.x - honic.x;
            let dy = ring.y - honic.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < honic.radius + ring.radius && !ring.collected) {
                ring.collected = true;
                generateSound(523.25, 'sine'); // Sound for ring collection
            }
        });
    }

    function jump() {
        if (honic.onGround) {
            honic.velocity = honic.lift;
            honic.onGround = false;
            generateSound(440, 'square'); // Sound for jumping
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === "Space") {
            jump();
        }
    });

    window.addEventListener('touchstart', jump);

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        honic.velocity += honic.gravity;
        honic.y += honic.velocity;

        let groundLevel = canvas.height - (canvas.height / 3) - honic.radius;
        if (honic.y > groundLevel) {
            honic.y = groundLevel;
            honic.velocity = 0;
            honic.onGround = true;
        }

        drawLandscape();
        drawHonic();
        collectRing();
        drawRings();

        rings.forEach((ring, index) => {
            ring.x -= landscape.speed; // Move rings with the landscape
            if (ring.x + ring.radius < 0) { // Recycle rings that move off screen
                rings.splice(index, 1);
                // Generate a new ring to replace the one that was removed
                generateRings();
            }
        });

        ringIndex += landscape.speed;
        requestAnimationFrame(updateGame);
    }

    generateRings();
    updateGame();
});
