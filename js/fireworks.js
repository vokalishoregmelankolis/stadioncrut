// Fireworks System (Enhanced)
let fireworks = [];
let particles = [];
let lights = []; // Array to manage flash lights
let sceneRef;

function initFireworks(scene) {
    sceneRef = scene;
}

function createFirework(x, y, z) {
    // Varied colors: Gold, Red, White, Blue (MUFC Colors + Celebration)
    const colors = [0xFFD700, 0xDA020E, 0xFFFFFF, 0x0000FF, 0xFFA500];
    const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

    // Rocket
    const geometry = new THREE.SphereGeometry(0.6, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const rocket = new THREE.Mesh(geometry, material);

    rocket.position.set(x, y, z);

    // Higher and faster
    const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        40 + Math.random() * 25,
        (Math.random() - 0.5) * 15
    );

    sceneRef.add(rocket);
    fireworks.push({ mesh: rocket, velocity: velocity, color: color, life: 50 + Math.random() * 20 });
}

function explodeFirework(firework) {
    const particleCount = 150; // Increased from 50
    const geometry = new THREE.SphereGeometry(0.3, 4, 4); // Slightly larger particles
    const material = new THREE.MeshBasicMaterial({ color: firework.color });

    // 1. Flash Light Effect
    const light = new THREE.PointLight(firework.color, 5, 200, 2);
    light.position.copy(firework.mesh.position);
    sceneRef.add(light);
    lights.push({ light: light, life: 5 }); // Short life flash

    // 2. Spawn Particles
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(geometry, material.clone()); // Clone material for individual opacity
        particle.position.copy(firework.mesh.position);

        // Spherical explosion pattern
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 10 + Math.random() * 20; // Faster explosion

        const velocity = new THREE.Vector3(
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.sin(phi) * Math.sin(theta),
            speed * Math.cos(phi)
        );

        sceneRef.add(particle);
        particles.push({
            mesh: particle,
            velocity: velocity,
            life: 80 + Math.random() * 40,
            opacity: 1.0,
            color: firework.color
        });
    }
}

function updateFireworks() {
    // Update Rockets
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];

        fw.mesh.position.addScaledVector(fw.velocity, 0.1);
        fw.velocity.y -= 0.6; // Gravity
        fw.life--;

        if (fw.life <= 0 || fw.velocity.y < 0) {
            explodeFirework(fw);
            sceneRef.remove(fw.mesh);
            fireworks.splice(i, 1);
        }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.mesh.position.addScaledVector(p.velocity, 0.1);
        p.velocity.y -= 0.3; // Gravity
        p.velocity.multiplyScalar(0.92); // Stronger drag for air resistance effect

        p.life--;
        p.opacity -= 0.015;
        p.mesh.material.opacity = Math.max(0, p.opacity);
        p.mesh.material.transparent = true;

        if (p.life <= 0 || p.opacity <= 0) {
            sceneRef.remove(p.mesh);
            particles.splice(i, 1);
        }
    }

    // Update Lights (Flashes)
    for (let i = lights.length - 1; i >= 0; i--) {
        const l = lights[i];
        l.life--;
        l.light.intensity *= 0.8; // Fade out fast

        if (l.life <= 0) {
            sceneRef.remove(l.light);
            lights.splice(i, 1);
        }
    }
}

// Spawner logic
let spawnerAngle = 0;
const stadiumWidth = 220;
const stadiumLength = 300;
const roofHeight = 45;

function animateFireworks() {
    // PERFORMANCE: Skip fireworks in Walk Mode
    if (window.fireworksPaused) return;

    updateFireworks();

    // spawn multiple rockets for "grand" effect
    if (Math.random() > 0.85) {
        spawnerAngle += 0.8; // Faster circling

        // Spawn a burst of 1-3 rockets
        const burstCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < burstCount; i++) {
            const angle = spawnerAngle + (Math.random() - 0.5) * 0.5;

            const x = (stadiumLength / 2) * Math.cos(angle);
            const z = (stadiumWidth / 2) * Math.sin(angle);

            // Randomize launch height slightly
            createFirework(x, roofHeight, z);
        }
    }
}
