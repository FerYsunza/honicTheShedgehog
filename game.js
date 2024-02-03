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

    // Honic the Shedgehog properties
    const honic = {
        x: 50, // Honic starts running from the left
        y: 0, // Updated dynamically based on landscape
        radius: 20,
        speed: 2, // Honic's running speed
    };

    honic.y = canvas.height - (canvas.height / 3) - honic.radius; // Initial Y position based on landscape

    // Landscape properties
    const landscape = {
        amplitude: 20, // Height of the waves
        frequency: 0.05, // How frequent the waves are
        speed: 2, // Speed of the landscape movement to match Honic's running
    };

    // Rings properties
    let rings = [];
    const ringRadius = 10;
    const ringSpacing = 300; // Distance between rings
    let ringIndex = 0;

    function generateRings() {
        for (let i = 0; i < 5; i++) { // Generate 5 rings initially
            rings.push({
                x: canvas.width + (ringSpacing * i),
                y: canvas.height - (canvas.height / 4),
                radius: ringRadius,
                collected: false,
            });
        }
    }

    generateRings(); // Initial ring generation

    function generateSound(frequency, type) {
        // Sound generation logic remains the same
    }

    function drawLandscape() {
        ctx.fillStyle = '#228B22'; // Dark green for the grass
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x++) {
            const y = canvas.height - (canvas.height / 3) + Math.sin(x * landscape.frequency + ringIndex) * landscape.amplitude;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
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
                generateSound(523.25, 'sine'); // Play a different sound for ring collection
            }
        });
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLandscape();

        // Update ring positions and check for collection
        rings.forEach((ring, index) => {
            if (ring.x + ring.radius < 0) {
                rings[index] = { // Recycle rings
                    x: canvas.width + ringRadius,
                    y: canvas.height - (canvas.height / 4),
                    radius: ringRadius,
                    collected: false,
                };
            }
            ring.x -= landscape.speed; // Move rings with the landscape
        });

        collectRing();
        drawRings();
        drawHonic();

        ringIndex += landscape.speed; // Increment for landscape movement
        requestAnimationFrame(updateGame);
    }

    updateGame();
});
