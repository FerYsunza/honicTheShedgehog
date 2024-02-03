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

    const player = {
        x: 50,
        y: canvas.height / 2,
        radius: 20,
        gravity: 0.8,
        lift: -15,
        velocity: 0,
    };

    let audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

    function drawPlayer() {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.velocity += player.gravity;
        player.y += player.velocity;

        if (player.y >= canvas.height - player.radius) {
            player.y = canvas.height - player.radius;
            player.velocity = 0;
        }

        drawPlayer();
        requestAnimationFrame(updateGame);
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === "Space") {
            jump();
        }
    });

    window.addEventListener('touchstart', jump);

    function jump() {
        if (player.y === canvas.height - player.radius) {
            player.velocity += player.lift;
            generateSound(440, 'square'); // Jump sound
        }
    }

    updateGame();
});
