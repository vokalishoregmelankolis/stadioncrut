// ==========================================
// 3D FOOTBALL STADIUM - Three.js
// Main Entry Point
// ==========================================

// Initialize the stadium scene
function init() {
    // Scene with overcast atmosphere
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8899aa); // Overcast grey
    scene.fog = new THREE.FogExp2(0x8899aa, 0.002); // Light atmospheric fog

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);

    // Renderer with better settings
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true; // Key for AAA lighting
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

// Start
init();