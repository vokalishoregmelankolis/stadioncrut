// ==========================================
// 3D FOOTBALL STADIUM - Three.js
// Main Entry Point
// ==========================================

// Initialize the stadium scene
function init() {
    // Optimization: Global array for objects the player can walk on
    window.walkableObjects = [];

    // Scene with Overcast Morning Atmosphere
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7a9090); // Slightly darker overcast sky
    // scene.fog = new THREE.FogExp2(0x050510, 0.002); // Fog handled in lighting.js

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);

    // Renderer with better settings
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85; // Lower for more natural look
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 80;
    orbitControls.maxDistance = 400;
    orbitControls.maxPolarAngle = Math.PI / 2.1;

    pointerLockControls = new THREE.PointerLockControls(camera, document.body);
    scene.add(pointerLockControls.getObject());

    // Build scene
    setupAdvancedLighting();
    createEnvironment();
    initFireworks(scene); // Initialize Fireworks
    createField();
    createFieldMarkings();
    createGoals();
    createStadiumStructure();
    createPlayers();
    createBall();
    initMinimap();

    // Events
    window.addEventListener('resize', onWindowResize);
    setupControlButtons();
    setupModeSelector();
    setupWalkingControls();

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    // Controls update
    if (currentMode === 'orbit') {
        orbitControls.update();
    } else {
        updateWalking(delta);
    }

    animateFireworks(); // Animate Fireworks
    updateFlags(time * 0.001); // Animate Flags (convert ms to seconds)


    renderer.render(scene, camera);
    prevTime = time;
}

// Start
init();
