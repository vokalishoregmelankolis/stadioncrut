// ==========================================
// 3D FOOTBALL STADIUM - Three.js
// Realistic Stadium with Proper Orientation
// ==========================================

let scene, camera, renderer;
let orbitControls, pointerLockControls;
let currentMode = 'orbit';

// Walking
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = true, isRunning = false;
let playerHeight = 1.8;
let prevTime = performance.now();

// Stadium dimensions
const FIELD_LENGTH = 105;
const FIELD_WIDTH = 68;

// Initialize
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

// ==========================================
// ADVANCED LIGHTING
// ==========================================
function setupAdvancedLighting() {
    // === REALISTIC OLD TRAFFORD LIGHTING (Overcast Match Day) ===

    // 1. Hemisphere Light - Overcast sky (muted blue-grey)
    const hemi = new THREE.HemisphereLight(0x7799aa, 0x445544, 0.6);
    hemi.position.set(0, 500, 0);
    scene.add(hemi);

    // 2. Main Directional Light - Soft diffused daylight (overcast)
    const sun = new THREE.DirectionalLight(0xcccccc, 0.8);
    sun.position.set(-50, 100, 50);
    sun.castShadow = true;

    // High quality soft shadows
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    sun.shadow.bias = -0.0001;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    // 3. Ambient - Low fill to maintain shadows
    const ambient = new THREE.AmbientLight(0x333344, 0.3);
    scene.add(ambient);

    // 4. Stadium Floodlights - Focused on pitch, natural intensity
    const floodPositions = [
        // Behind each goal
        { x: 60, y: 50, z: 0, tx: 0, tz: 0 },
        { x: -60, y: 50, z: 0, tx: 0, tz: 0 },
        // North stand edge
        { x: -35, y: 48, z: -52, tx: 0, tz: 0 },
        { x: 35, y: 48, z: -52, tx: 0, tz: 0 },
        // South stand edge
        { x: -35, y: 45, z: 47, tx: 0, tz: 0 },
        { x: 35, y: 45, z: 47, tx: 0, tz: 0 },
    ];

    floodPositions.forEach((pos, index) => {
        // Stadium floodlight - white, controlled intensity
        const spot = new THREE.SpotLight(0xffffff, 800);
        spot.position.set(pos.x, pos.y, pos.z);
        spot.target.position.set(pos.tx, 0, pos.tz);
        spot.angle = Math.PI / 3;
        spot.penumbra = 0.5;
        spot.decay = 2;
        spot.distance = 150;
        spot.castShadow = index < 2;
        spot.shadow.mapSize.width = 1024;
        spot.shadow.mapSize.height = 1024;
        scene.add(spot);
        scene.add(spot.target);

        // Visible floodlight fixture (small)
        const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 3), fixtureMat);
        fixture.position.set(pos.x, pos.y + 1, pos.z);
        scene.add(fixture);
    });

    // 5. Pitch illumination (subtle warm fill from above)
    const pitchLight = new THREE.RectAreaLight(0xffffee, 2, 100, 65);
    pitchLight.position.set(0, 60, 0);
    pitchLight.rotation.x = -Math.PI / 2;
    scene.add(pitchLight);
}

// ==========================================
// ENVIRONMENT
// ==========================================
function createEnvironment() {
    // Ground outside stadium
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4a7a4a,
        roughness: 0.9,
        metalness: 0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sky gradient dome (Overcast cloudy day)
    const skyGeo = new THREE.SphereGeometry(450, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x6688aa) }, // Grey-blue clouds
            bottomColor: { value: new THREE.Color(0x99aabb) }, // Light grey horizon
            offset: { value: 20 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

// ==========================================
// FIELD WITH TEXTURE
// ==========================================
function createField() {
    // Create procedural grass texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Stripe pattern
    const stripeW = 64;
    for (let i = 0; i < canvas.width; i += stripeW * 2) {
        ctx.fillStyle = '#3a9d4a';
        ctx.fillRect(i, 0, stripeW, canvas.height);
        ctx.fillStyle = '#2d8a3d';
        ctx.fillRect(i + stripeW, 0, stripeW, canvas.height);
    }

    // Add grass noise
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 12;
        imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
        imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
        imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const grassTex = new THREE.CanvasTexture(canvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(8, 5);
    grassTex.anisotropy = 16;

    const fieldGeo = new THREE.PlaneGeometry(FIELD_LENGTH, FIELD_WIDTH);
    const fieldMat = new THREE.MeshStandardMaterial({
        map: grassTex,
        roughness: 0.85,
        metalness: 0,
        envMapIntensity: 0.3
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    scene.add(field);

    // Surrounding grass area
    const surroundGeo = new THREE.PlaneGeometry(FIELD_LENGTH + 12, FIELD_WIDTH + 8);
    const surroundMat = new THREE.MeshStandardMaterial({
        color: 0x2a7a3a,
        roughness: 0.9
    });
    const surround = new THREE.Mesh(surroundGeo, surroundMat);
    surround.rotation.x = -Math.PI / 2;
    surround.position.y = -0.02;
    surround.receiveShadow = true;
    scene.add(surround);
}

// ==========================================
// FIELD MARKINGS
// ==========================================
function createFieldMarkings() {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineH = 0.03;
    const lineW = 0.12;

    const halfL = FIELD_LENGTH / 2;
    const halfW = FIELD_WIDTH / 2;

    function line(len, w, x, z, rotY = 0) {
        const geo = new THREE.PlaneGeometry(len, w);
        const mesh = new THREE.Mesh(geo, lineMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = rotY;
        mesh.position.set(x, lineH, z);
        return mesh;
    }

    const group = new THREE.Group();

    // Boundary
    group.add(line(FIELD_LENGTH, lineW, 0, halfW));
    group.add(line(FIELD_LENGTH, lineW, 0, -halfW));
    group.add(line(lineW, FIELD_WIDTH, halfL, 0));
    group.add(line(lineW, FIELD_WIDTH, -halfL, 0));

    // Center
    group.add(line(lineW, FIELD_WIDTH, 0, 0));

    // Center circle
    const circleGeo = new THREE.RingGeometry(9.15 - 0.06, 9.15 + 0.06, 64);
    const circle = new THREE.Mesh(circleGeo, lineMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = lineH;
    group.add(circle);

    // Center spot
    const spotGeo = new THREE.CircleGeometry(0.25, 24);
    const spot = new THREE.Mesh(spotGeo, lineMat);
    spot.rotation.x = -Math.PI / 2;
    spot.position.y = lineH;
    group.add(spot);

    // Penalty areas
    const penW = 40.3, penD = 16.5, goalW = 18.32, goalD = 5.5;

    [1, -1].forEach(side => {
        const px = side * halfL;

        // Penalty box vertical line
        group.add(line(lineW, penW, px - side * penD, 0));
        // Penalty box horizontal lines
        group.add(line(penD + lineW / 2, lineW, px - side * penD / 2, penW / 2));
        group.add(line(penD + lineW / 2, lineW, px - side * penD / 2, -penW / 2));

        // Goal area
        group.add(line(lineW, goalW, px - side * goalD, 0));
        group.add(line(goalD + lineW / 2, lineW, px - side * goalD / 2, goalW / 2));
        group.add(line(goalD + lineW / 2, lineW, px - side * goalD / 2, -goalW / 2));

        // Penalty spot
        const ps = spot.clone();
        ps.position.set(px - side * 11, lineH, 0);
        group.add(ps);

        // Penalty arc
        const arcGeo = new THREE.RingGeometry(9.15 - 0.06, 9.15 + 0.06, 32, 1,
            side === 1 ? Math.PI * 0.63 : Math.PI * -0.37, Math.PI * 0.74);
        const arc = new THREE.Mesh(arcGeo, lineMat);
        arc.rotation.x = -Math.PI / 2;
        arc.position.set(px - side * 11, lineH, 0);
        group.add(arc);
    });

    scene.add(group);
}

// ==========================================
// GOALS (Realistic with full net cage)
// ==========================================
function createGoals() {
    const goalW = 7.32, goalH = 2.44, goalD = 2.5;
    const postR = 0.08;

    const postMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4
    });
    const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });

    function createGoal(xPos) {
        const goal = new THREE.Group();
        const dir = xPos > 0 ? 1 : -1;

        // === FRAME ===
        // Front posts (left and right)
        const postGeo = new THREE.CylinderGeometry(postR, postR, goalH, 12);

        const postLeft = new THREE.Mesh(postGeo, postMat);
        postLeft.position.set(0, goalH / 2, -goalW / 2);
        postLeft.castShadow = true;
        goal.add(postLeft);

        const postRight = new THREE.Mesh(postGeo, postMat);
        postRight.position.set(0, goalH / 2, goalW / 2);
        postRight.castShadow = true;
        goal.add(postRight);

        // Crossbar
        const crossGeo = new THREE.CylinderGeometry(postR, postR, goalW + postR * 2, 12);
        const crossbar = new THREE.Mesh(crossGeo, postMat);
        crossbar.rotation.x = Math.PI / 2;
        crossbar.position.set(0, goalH, 0);
        crossbar.castShadow = true;
        goal.add(crossbar);

        // Back support posts
        const backPostLeft = new THREE.Mesh(postGeo, postMat);
        backPostLeft.position.set(dir * goalD, goalH / 2, -goalW / 2);
        goal.add(backPostLeft);

        const backPostRight = new THREE.Mesh(postGeo, postMat);
        backPostRight.position.set(dir * goalD, goalH / 2, goalW / 2);
        goal.add(backPostRight);

        // Back crossbar
        const backCrossbar = new THREE.Mesh(crossGeo, postMat);
        backCrossbar.rotation.x = Math.PI / 2;
        backCrossbar.position.set(dir * goalD, goalH, 0);
        goal.add(backCrossbar);

        // === NETS ===
        // Back net (vertical)
        const backNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalW, goalH, 20, 12),
            netMat
        );
        backNet.position.set(dir * goalD, goalH / 2, 0);
        backNet.rotation.y = Math.PI / 2;
        goal.add(backNet);

        // Top net (horizontal)
        const topNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalD, goalW, 8, 20),
            netMat
        );
        topNet.position.set(dir * goalD / 2, goalH, 0);
        topNet.rotation.x = Math.PI / 2;
        goal.add(topNet);

        // Side nets (left and right triangular panels)
        const sideNetGeo = new THREE.PlaneGeometry(goalD, goalH, 8, 12);

        const sideNetLeft = new THREE.Mesh(sideNetGeo, netMat);
        sideNetLeft.position.set(dir * goalD / 2, goalH / 2, -goalW / 2);
        goal.add(sideNetLeft);

        const sideNetRight = new THREE.Mesh(sideNetGeo, netMat);
        sideNetRight.position.set(dir * goalD / 2, goalH / 2, goalW / 2);
        goal.add(sideNetRight);

        // Bottom bar (ground level, back)
        const bottomBarGeo = new THREE.CylinderGeometry(postR * 0.5, postR * 0.5, goalW, 8);
        const bottomBar = new THREE.Mesh(bottomBarGeo, postMat);
        bottomBar.rotation.x = Math.PI / 2;
        bottomBar.position.set(dir * goalD, postR, 0);
        goal.add(bottomBar);

        goal.position.x = xPos;
        return goal;
    }

    scene.add(createGoal(FIELD_LENGTH / 2));
    scene.add(createGoal(-FIELD_LENGTH / 2));
}

// ==========================================
// STADIUM STRUCTURE - REALISTIC OLD TRAFFORD
// ==========================================
// --- CORNERS (External) ---
function createStadiumCorner(xSign, zSign) {
    if (Math.abs(xSign) !== 1 || Math.abs(zSign) !== 1) return new THREE.Group();

    const group = new THREE.Group();

    // MatDefs (Local copy for safety)
    const matSeatRed = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 });
    const matConcrete = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
    const matRedWall = new THREE.MeshStandardMaterial({ color: 0xb30000, roughness: 0.6 });
    const matRoof = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, roughness: 0.4, side: THREE.DoubleSide });

    const outerRad = 45;
    const innerRad = 15;
    const rows = 20;
    const hStep = 0.5;
    const rStep = (outerRad - innerRad) / rows;

    let ringStart = 0;
    let cylStart = 0;

    if (xSign > 0 && zSign < 0) { // NE
        ringStart = 0;
        cylStart = 1.5 * Math.PI;
    } else if (xSign < 0 && zSign < 0) { // NW
        ringStart = 0.5 * Math.PI;
        cylStart = Math.PI;
    } else if (xSign < 0 && zSign > 0) { // SW
        ringStart = Math.PI;
        cylStart = 0.5 * Math.PI;
    } else if (xSign > 0 && zSign > 0) { // SE
        ringStart = 1.5 * Math.PI;
        cylStart = 0;
    }

    const lengthAng = Math.PI / 2;

    for (let r = 0; r < rows; r++) {
        const y = r * hStep;
        const rin = innerRad + r * rStep;
        const rout = rin + rStep;

        const ring = new THREE.Mesh(new THREE.RingGeometry(rin, rout, 12, 1, ringStart, lengthAng), matSeatRed);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = y + 2;
        group.add(ring);

        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rout, rout, hStep, 12, 1, true, cylStart, lengthAng), matConcrete);
        cyl.position.set(0, y + hStep / 2, 0);
        group.add(cyl);
    }

    const wallH = rows * hStep + 5;
    const wRad = innerRad + rows * rStep;
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(wRad, wRad, wallH, 12, 1, true, cylStart, lengthAng), matRedWall);
    wall.position.y = wallH / 2;
    group.add(wall);

    const roofH = wallH + 5;
    const roof = new THREE.Mesh(new THREE.RingGeometry(innerRad, wRad + 10, 12, 1, ringStart, lengthAng), matRoof);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = roofH;
    group.add(roof);

    group.position.set(xSign * (105 / 2 - 10), 0, zSign * (68 / 2 - 10));

    if (group.position.lengthSq() < 100) return new THREE.Group();

    return group;
}

function createStadiumStructure() {
    const stadium = new THREE.Group();

    // Dimensions
    // Field is 105x68.

    // Distances where stands START (Front row)
    const distN = 68 / 2 + 4; // Z location for North Stand front
    const distS = 68 / 2 + 4; // Z location for South Stand front
    const distW = 105 / 2 + 4; // X location for West Stand front
    const distE = 105 / 2 + 4; // X location for East Stand front

    // === REALISTIC MATERIALS (PBR Properties) ===

    // Concrete - rough, slightly reflective
    const matConcrete = new THREE.MeshStandardMaterial({
        color: 0x909090,
        roughness: 0.95,
        metalness: 0.0
    });

    // Brick exterior - textured appearance (Old Trafford red brick)
    const matBrick = new THREE.MeshStandardMaterial({
        color: 0x8B3A3A, // Darker red-brown brick
        roughness: 0.85,
        metalness: 0.0
    });

    // Dark red accent walls
    const matRedWall = new THREE.MeshStandardMaterial({
        color: 0x6B0000, // Deep Manchester United red
        roughness: 0.6,
        metalness: 0.0
    });

    // Roof - light grey metal panels
    const matRoof = new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        roughness: 0.4,
        metalness: 0.6,
        side: THREE.DoubleSide
    });

    // Steel trusses - white painted steel
    const matTruss = new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        roughness: 0.3,
        metalness: 0.7
    });

    // Seats - glossy plastic (Old Trafford red)
    const matSeatRed = new THREE.MeshStandardMaterial({
        color: 0xc41e3a, // True Old Trafford red
        roughness: 0.4,
        metalness: 0.0
    });
    const matSeatWhite = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.4,
        metalness: 0.0
    });
    const matSeatDarkRed = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.4,
        metalness: 0.0
    });

    // --- Helper for Single Tier (with text pattern support) ---
    function createTier(width, depth, rows, yStart, zStart, pattern = null, mirrorText = false) {
        const g = new THREE.Group();
        const rowDepth = depth / rows;
        const rowHeight = 0.6;

        // Letter patterns (5 rows x 3 cols per letter) - 1 = white, 0 = red
        const letters = {
            'M': [[1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1]],
            'A': [[0, 1, 0], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
            'N': [[1, 0, 1], [1, 1, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
            'C': [[1, 1, 1], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1]],
            'H': [[1, 0, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
            'E': [[1, 1, 1], [1, 0, 0], [1, 1, 0], [1, 0, 0], [1, 1, 1]],
            'S': [[1, 1, 1], [1, 0, 0], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
            'T': [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
            'R': [[1, 1, 0], [1, 0, 1], [1, 1, 0], [1, 0, 1], [1, 0, 1]],
            'U': [[1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]],
            'I': [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
            'D': [[1, 1, 0], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 0]],
            'F': [[1, 1, 1], [1, 0, 0], [1, 1, 0], [1, 0, 0], [1, 0, 0]],
            'O': [[1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]],
            ' ': [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
        };

        // Generate text bitmap
        function getTextBitmap(text, totalCols) {
            const letterWidth = 4; // 3 cols + 1 space
            const textWidth = text.length * letterWidth;
            const startCol = Math.floor((totalCols - textWidth) / 2);

            const bitmap = [];
            for (let row = 0; row < 5; row++) {
                bitmap[row] = [];
                for (let col = 0; col < totalCols; col++) {
                    const letterIdx = Math.floor((col - startCol) / letterWidth);
                    const colInLetter = (col - startCol) % letterWidth;

                    if (letterIdx >= 0 && letterIdx < text.length && colInLetter < 3) {
                        const letter = letters[text[letterIdx]] || letters[' '];
                        bitmap[row][col] = letter[row] ? letter[row][colInLetter] : 0;
                    } else {
                        bitmap[row][col] = 0;
                    }
                }
            }
            return bitmap;
        }

        const numSections = 48; // Sections for text detail
        const sectionWidth = width / numSections;

        // Pre-generate text bitmaps for any pattern
        let textBitmap = null;
        if (pattern) {
            textBitmap = getTextBitmap(pattern, numSections);
        }

        for (let r = 0; r < rows; r++) {
            const y = yStart + r * rowHeight;
            const z = zStart + r * rowDepth;

            // Concrete step
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(width, rowHeight, rowDepth),
                matConcrete
            );
            step.position.set(0, y + rowHeight / 2, z + rowDepth / 2);
            step.receiveShadow = true;
            step.castShadow = true;
            g.add(step);

            // Seats with text pattern
            for (let s = 0; s < numSections; s++) {
                let seatMat = matSeatRed;

                if (textBitmap && rows >= 5) {
                    // Map row to text row (centered in tier)
                    const textRowStart = Math.floor((rows - 5) / 2);
                    const textRow = r - textRowStart;
                    // Flip both horizontal (columns) and vertical (rows) for 180° rotation
                    const flippedCol = numSections - 1 - s;  // Flip horizontal
                    const flippedRow = 4 - textRow;          // Flip vertical (5 rows: 0→4, 1→3, etc)
                    if (textRow >= 0 && textRow < 5) {
                        if (textBitmap[flippedRow] && textBitmap[flippedRow][flippedCol] === 1) {
                            seatMat = matSeatWhite;
                        }
                    }
                }

                const seat = new THREE.Mesh(
                    new THREE.BoxGeometry(sectionWidth * 0.92, 0.12, rowDepth * 0.45),
                    seatMat
                );
                const xPos = -width / 2 + sectionWidth / 2 + s * sectionWidth;
                seat.position.set(xPos, y + rowHeight + 0.06, z + rowDepth / 2);
                g.add(seat);
            }
        }

        return { mesh: g, endY: yStart + rows * rowHeight, endZ: zStart + depth };
    }

    // --- Stand Builder with Old Trafford Details ---
    // tiersConfig: array of { rows, depth, pattern? } objects
    function createStand(width, tiersConfig, standType, mirrorText = false) {
        const group = new THREE.Group();

        let currentY = 0;
        let currentZ = 0;

        tiersConfig.forEach((tier, i) => {
            if (i > 0) {
                // Walkway between tiers
                const walkDepth = 3;
                const walk = new THREE.Mesh(new THREE.BoxGeometry(width, 1, walkDepth), matConcrete);
                walk.position.set(0, currentY + 0.5, currentZ + walkDepth / 2);
                walk.receiveShadow = true;
                group.add(walk);

                // Safety barrier (moved forward to prevent z-fighting)
                const barrierMat = matRedWall.clone();
                barrierMat.polygonOffset = true;
                barrierMat.polygonOffsetFactor = -1;
                barrierMat.polygonOffsetUnits = -1;
                const barrier = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, 0.3), barrierMat);
                barrier.position.set(0, currentY + 1.1, currentZ - 0.2); // Moved forward
                group.add(barrier);

                currentZ += walkDepth;
                currentY += 1;
            }

            // Each tier can have its own pattern
            const tierPattern = tier.pattern || null;
            const t = createTier(width, tier.depth, tier.rows, currentY, currentZ, tierPattern, mirrorText);
            group.add(t.mesh);
            currentY = t.endY;
            currentZ = t.endZ;
        });

        const totalDepth = currentZ;
        const totalHeight = currentY;

        // Back Wall - Brick exterior
        const wallH = totalHeight + 8;
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width + 4, wallH, 2), matBrick);
        wall.position.set(0, wallH / 2, totalDepth + 1);
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        // Side Walls - Brick
        const sideGeo = new THREE.BoxGeometry(2, wallH, totalDepth + 2);
        const sideL = new THREE.Mesh(sideGeo, matBrick);
        sideL.position.set(-width / 2 - 1, wallH / 2, totalDepth / 2);
        sideL.castShadow = true;
        group.add(sideL);

        const sideR = sideL.clone();
        sideR.position.set(width / 2 + 1, wallH / 2, totalDepth / 2);
        group.add(sideR);

        // Roof - Cantilever design
        const roofOverhang = 15;
        const roofY = totalHeight + 12;

        // Main roof panel (exterior - light)
        const roofGeo = new THREE.BoxGeometry(width + 6, 0.8, totalDepth + roofOverhang);
        const roof = new THREE.Mesh(roofGeo, matRoof);
        roof.position.set(0, roofY, (totalDepth + roofOverhang) / 2 - roofOverhang + 5);
        roof.castShadow = true;
        roof.receiveShadow = true;
        group.add(roof);

        // Roof underside (interior - dark steel)
        const roofUndersideMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6,
            metalness: 0.4
        });
        const roofUnderside = new THREE.Mesh(
            new THREE.PlaneGeometry(width + 4, totalDepth + roofOverhang - 2),
            roofUndersideMat
        );
        roofUnderside.rotation.x = Math.PI / 2;
        roofUnderside.position.set(0, roofY - 0.5, (totalDepth + roofOverhang) / 2 - roofOverhang + 5);
        group.add(roofUnderside);

        // === Old Trafford Style Roof Trusses ===
        const numTruss = standType === 'north' ? 8 : 6;
        for (let i = 0; i <= numTruss; i++) {
            const x = -width / 2 + (width / numTruss) * i;

            // Main vertical support column
            const columnH = roofY - totalHeight + 5;
            const column = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, columnH, 0.8),
                matTruss
            );
            column.position.set(x, roofY - columnH / 2, totalDepth);
            column.castShadow = true;
            group.add(column);

            // Horizontal truss beam
            const beamLen = totalDepth + roofOverhang - 5;
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 1.5, beamLen),
                matTruss
            );
            beam.position.set(x, roofY + 1, beamLen / 2);
            group.add(beam);

            // Diagonal cross bracing (triangular truss)
            for (let d = 0; d < 4; d++) {
                const diagLen = 8;
                const diag = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.3, diagLen),
                    matTruss
                );
                const zOff = 5 + d * 10;
                diag.position.set(x, roofY - 2, zOff);
                diag.rotation.x = d % 2 === 0 ? 0.4 : -0.4;
                group.add(diag);
            }
        }

        return { mesh: group, depth: totalDepth, height: totalHeight };
    }

    // --- Create 4 Stands (Old Trafford Layout) ---

    // 1. NORTH (Sir Alex Ferguson Stand) - Tallest, 3 Tiers
    // "MANCHESTER" on top tier, "UNITED" on bottom tier (stacked like real Old Trafford)
    // mirrorText=false because rotation already flips the view
    const north = createStand(FIELD_LENGTH + 15, [
        { rows: 12, depth: 12, pattern: 'UNITED' },      // Bottom tier - UNITED
        { rows: 8, depth: 8 },                            // Middle tier - plain
        { rows: 14, depth: 16, pattern: 'MANCHESTER' }   // Top tier - MANCHESTER
    ], 'north', false);
    north.mesh.rotation.y = Math.PI;
    north.mesh.position.set(0, 0, -distN - 5);
    stadium.add(north.mesh);

    // 2. SOUTH (Bobby Charlton Stand) - 2 Tiers, plain red
    const south = createStand(FIELD_LENGTH + 15, [
        { rows: 15, depth: 15 },
        { rows: 12, depth: 14 }
    ], 'south', false);
    south.mesh.rotation.y = 0;
    south.mesh.position.set(0, 0, distS + 5);
    stadium.add(south.mesh);

    // 3. WEST (Stretford End) - 2 Tiers
    // First tier = lower (bottom), Second tier = upper (top)
    // STRETFORD should be on TOP, END on BOTTOM when viewed from pitch
    const west = createStand(FIELD_WIDTH + 15, [
        { rows: 14, depth: 16, pattern: 'END' },         // Lower tier - END (bottom)
        { rows: 12, depth: 14, pattern: 'STRETFORD' }    // Upper tier - STRETFORD (top)
    ], 'west', false);
    west.mesh.rotation.y = -Math.PI / 2;
    west.mesh.position.set(-distW - 5, 0, 0);
    stadium.add(west.mesh);

    // 4. EAST (Scoreboard End) - 2 Tiers, plain red
    const east = createStand(FIELD_WIDTH + 15, [
        { rows: 14, depth: 14 },
        { rows: 14, depth: 16 }
    ], 'east', false);
    east.mesh.rotation.y = Math.PI / 2;
    east.mesh.position.set(distE + 5, 0, 0);
    stadium.add(east.mesh);

    // === OLD TRAFFORD EXTERIOR DETAILS ===

    // --- Staircase Towers (Tall rectangular towers at corners) ---
    function createStaircaseTower(xPos, zPos, height = 45) {
        const tower = new THREE.Group();
        const towerW = 8;
        const towerD = 8;

        // Main tower body - grey concrete
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x707070, roughness: 0.8, metalness: 0.1
        });
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(towerW, height, towerD),
            bodyMat
        );
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        tower.add(body);

        // Red accent panels on sides
        const redPanelMat = new THREE.MeshStandardMaterial({
            color: 0xc41e3a, roughness: 0.5, metalness: 0.0
        });
        [-1, 1].forEach(side => {
            const panel = new THREE.Mesh(
                new THREE.BoxGeometry(towerW + 0.2, height - 5, 1),
                redPanelMat
            );
            panel.position.set(0, height / 2, side * (towerD / 2 + 0.5));
            tower.add(panel);
        });

        // White vertical stripes
        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, roughness: 0.4, metalness: 0.0
        });
        for (let i = -1; i <= 1; i += 2) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, height - 3, 0.5),
                whiteMat
            );
            stripe.position.set(i * (towerW / 2 - 1), height / 2, 0);
            tower.add(stripe);
        }

        // Tower top cap
        const topCap = new THREE.Mesh(
            new THREE.BoxGeometry(towerW + 1, 2, towerD + 1),
            matRoof
        );
        topCap.position.y = height + 1;
        tower.add(topCap);

        tower.position.set(xPos, 0, zPos);
        return tower;
    }

    // --- External Facade Panels (Red/White stripes) ---
    function createExteriorFacade(width, height, depth, isNorth = false) {
        const facade = new THREE.Group();

        // Base grey wall
        const greyMat = new THREE.MeshStandardMaterial({
            color: 0x808080, roughness: 0.7, metalness: 0.1
        });
        const baseWall = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            greyMat
        );
        baseWall.position.y = height / 2;
        facade.add(baseWall);

        // Red horizontal bands
        const redBandMat = new THREE.MeshStandardMaterial({
            color: 0xb81c2d, roughness: 0.5, metalness: 0.0
        });
        const numBands = 4;
        for (let i = 0; i < numBands; i++) {
            const band = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.2, 2, depth + 0.2),
                redBandMat
            );
            band.position.y = 8 + i * 10;
            facade.add(band);
        }

        // White vertical accent pillars
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0, roughness: 0.4, metalness: 0.1
        });
        const numPillars = Math.floor(width / 20);
        for (let i = 0; i <= numPillars; i++) {
            const pillar = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, height + 5, 2),
                pillarMat
            );
            pillar.position.set(-width / 2 + (width / numPillars) * i, height / 2, depth / 2 + 1);
            facade.add(pillar);
        }

        return facade;
    }

    // --- Glass Entrance Section ---
    function createGlassEntrance(width, height) {
        const glass = new THREE.Group();

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            roughness: 0.1,
            metalness: 0.6,
            transparent: true,
            opacity: 0.5
        });

        // Main glass panel
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 1),
            glassMat
        );
        panel.position.y = height / 2;
        glass.add(panel);

        // Steel frame
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x666666, roughness: 0.3, metalness: 0.8
        });

        // Vertical frames
        [-1, 0, 1].forEach(pos => {
            const vFrame = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, height, 0.5),
                frameMat
            );
            vFrame.position.set(pos * (width / 2 - 1), height / 2, 0.5);
            glass.add(vFrame);
        });

        // Horizontal frames
        for (let i = 0; i <= 3; i++) {
            const hFrame = new THREE.Mesh(
                new THREE.BoxGeometry(width, 0.5, 0.5),
                frameMat
            );
            hFrame.position.set(0, (height / 3) * i, 0.5);
            glass.add(hFrame);
        }

        return glass;
    }

    // === PLACE EXTERIOR ELEMENTS (Simplified) ===

    // Simple corner towers at 4 corners only
    const cornerDist = 10;
    stadium.add(createStaircaseTower(FIELD_LENGTH / 2 + cornerDist, -FIELD_WIDTH / 2 - cornerDist, 38));
    stadium.add(createStaircaseTower(-FIELD_LENGTH / 2 - cornerDist, -FIELD_WIDTH / 2 - cornerDist, 38));
    stadium.add(createStaircaseTower(-FIELD_LENGTH / 2 - cornerDist, FIELD_WIDTH / 2 + cornerDist, 38));
    stadium.add(createStaircaseTower(FIELD_LENGTH / 2 + cornerDist, FIELD_WIDTH / 2 + cornerDist, 38));

    // === INTERIOR DETAILS (Old Trafford Style) ===

    // --- LED Advertising Boards around pitch ---
    const adBoardMat = new THREE.MeshBasicMaterial({ color: 0x111111 }); // Dark LED panel
    const adTextMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red text/accent
    const adBoardHeight = 1.0;
    const adBoardOffset = 3; // Distance from field edge

    // North side advertising
    const adNorth = new THREE.Mesh(
        new THREE.BoxGeometry(FIELD_LENGTH - 10, adBoardHeight, 0.3),
        adBoardMat
    );
    adNorth.position.set(0, adBoardHeight / 2, -FIELD_WIDTH / 2 - adBoardOffset);
    stadium.add(adNorth);

    // South side advertising
    const adSouth = adNorth.clone();
    adSouth.position.set(0, adBoardHeight / 2, FIELD_WIDTH / 2 + adBoardOffset);
    stadium.add(adSouth);

    // West & East side advertising
    const adWest = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, adBoardHeight, FIELD_WIDTH - 10),
        adBoardMat
    );
    adWest.position.set(-FIELD_LENGTH / 2 - adBoardOffset, adBoardHeight / 2, 0);
    stadium.add(adWest);

    const adEast = adWest.clone();
    adEast.position.set(FIELD_LENGTH / 2 + adBoardOffset, adBoardHeight / 2, 0);
    stadium.add(adEast);

    // --- LED light strips on advertising boards ---
    const ledStripMat = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffffff });

    const ledNorth = new THREE.Mesh(
        new THREE.BoxGeometry(FIELD_LENGTH - 12, 0.1, 0.1),
        ledStripMat
    );
    ledNorth.position.set(0, adBoardHeight + 0.05, -FIELD_WIDTH / 2 - adBoardOffset);
    stadium.add(ledNorth);

    const ledSouth = ledNorth.clone();
    ledSouth.position.set(0, adBoardHeight + 0.05, FIELD_WIDTH / 2 + adBoardOffset);
    stadium.add(ledSouth);

    // --- Tunnel entrance (center of one side) ---
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    const tunnel = new THREE.Mesh(
        new THREE.BoxGeometry(8, 3, 2),
        tunnelMat
    );
    tunnel.position.set(0, 1.5, FIELD_WIDTH / 2 + 5);
    stadium.add(tunnel);

    // Tunnel entrance frame (red)
    const tunnelFrame = new THREE.Mesh(
        new THREE.BoxGeometry(9, 3.5, 0.3),
        matRedWall
    );
    tunnelFrame.position.set(0, 1.75, FIELD_WIDTH / 2 + 4);
    stadium.add(tunnelFrame);

    scene.add(stadium);
}

// ==========================================
// PLAYERS
// ==========================================
function createPlayers() {
    const group = new THREE.Group();

    function player(x, z, color, isGK) {
        const p = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.6 });
        const shortMat = new THREE.MeshStandardMaterial({ color: isGK ? 0x111111 : 0xffffff, roughness: 0.5 });

        // Body
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), bodyMat);
        body.position.y = 1.1;
        body.castShadow = true;
        p.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat);
        head.position.y = 1.65;
        head.castShadow = true;
        p.add(head);

        // Shorts
        const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.3, 8), shortMat);
        shorts.position.y = 0.55;
        p.add(shorts);

        // Legs
        [-0.08, 0.08].forEach(off => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), skinMat);
            leg.position.set(off, 0.22, 0);
            p.add(leg);
        });

        p.position.set(x, 0, z);
        return p;
    }

    // Team 1 - Red
    const t1 = [[-48, 0, true], [-35, -20], [-35, -7], [-35, 7], [-35, 20], [-18, -24], [-18, -8], [-18, 8], [-18, 24], [-5, -10], [-5, 10]];
    t1.forEach(([x, z, gk]) => group.add(player(x, z, 0xcc2222, gk)));

    // Team 2 - Blue
    const t2 = [[48, 0, true], [35, -20], [35, -7], [35, 7], [35, 20], [18, -24], [18, -8], [18, 8], [18, 24], [5, -10], [5, 10]];
    t2.forEach(([x, z, gk]) => group.add(player(x, z, 0x2244cc, gk)));

    // Referee
    group.add(player(0, 22, 0x111111, false));

    scene.add(group);
}

// ==========================================
// BALL
// ==========================================
function createBall() {
    const ballGeo = new THREE.IcosahedronGeometry(0.22, 2);
    const ballMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.05
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 0.22, 0);
    ball.castShadow = true;
    scene.add(ball);
}

// ==========================================
// MODE SELECTOR
// ==========================================
function setupModeSelector() {
    const orbitBtn = document.getElementById('btn-orbit-mode');
    const walkBtn = document.getElementById('btn-walk-mode');
    const blocker = document.getElementById('blocker');
    const walkInstr = document.getElementById('walk-instructions');
    const controls = document.getElementById('controls');
    const hud = document.getElementById('hud');
    const minimap = document.getElementById('minimap');

    // ESC key to toggle mode selector visibility
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (currentMode === 'orbit') {
                // Toggle blocker visibility in orbit mode
                blocker.classList.toggle('hidden');
            }
            // In walk mode, ESC naturally unlocks pointer lock
        }
    });

    orbitBtn.addEventListener('click', () => {
        orbitBtn.classList.add('active');
        walkBtn.classList.remove('active');
        walkInstr.classList.add('hidden');
        currentMode = 'orbit';
        blocker.classList.add('hidden'); // Hide after selecting orbit
        controls.classList.remove('hidden');
        hud.classList.add('hidden');
        minimap.classList.add('hidden');
        orbitControls.enabled = true;
        camera.position.set(0, 100, 150);
        camera.lookAt(0, 0, 0);
    });

    walkBtn.addEventListener('click', () => {
        walkBtn.classList.add('active');
        orbitBtn.classList.remove('active');
        walkInstr.classList.remove('hidden');
        currentMode = 'walk';
        controls.classList.add('hidden');
    });

    walkInstr.addEventListener('click', () => {
        if (currentMode === 'walk') pointerLockControls.lock();
    });

    pointerLockControls.addEventListener('lock', () => {
        blocker.classList.add('hidden');
        hud.classList.remove('hidden');
        minimap.classList.remove('hidden');
        orbitControls.enabled = false;
        if (!document.getElementById('crosshair')) {
            const ch = document.createElement('div');
            ch.id = 'crosshair';
            document.body.appendChild(ch);
        }
        camera.position.set(0, playerHeight, 30);
    });

    pointerLockControls.addEventListener('unlock', () => {
        if (currentMode === 'walk') {
            blocker.classList.remove('hidden');
            hud.classList.add('hidden');
            minimap.classList.add('hidden');
        }
        const ch = document.getElementById('crosshair');
        if (ch) ch.remove();
    });
}

// ==========================================
// WALKING CONTROLS
// ==========================================
function setupWalkingControls() {
    document.addEventListener('keydown', e => {
        if (currentMode !== 'walk' || !pointerLockControls.isLocked) return;
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': moveForward = true; break;
            case 'KeyS': case 'ArrowDown': moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft': moveLeft = true; break;
            case 'KeyD': case 'ArrowRight': moveRight = true; break;
            case 'Space': if (canJump) { velocity.y = 8; canJump = false; } break;
            case 'ShiftLeft': case 'ShiftRight': isRunning = true; break;
        }
    });

    document.addEventListener('keyup', e => {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': moveForward = false; break;
            case 'KeyS': case 'ArrowDown': moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft': moveLeft = false; break;
            case 'KeyD': case 'ArrowRight': moveRight = false; break;
            case 'ShiftLeft': case 'ShiftRight': isRunning = false; break;
        }
    });
}

// Raycaster for ground detection
const groundRaycaster = new THREE.Raycaster();
const downDirection = new THREE.Vector3(0, -1, 0);
let lastGroundY = 0; // For smoothing

function updateWalking(delta) {
    if (currentMode !== 'walk' || !pointerLockControls.isLocked) return;

    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;
    velocity.y -= 25 * delta; // Gravity

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const speed = isRunning ? 50 : 25;
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    pointerLockControls.moveRight(-velocity.x * delta);
    pointerLockControls.moveForward(-velocity.z * delta);
    pointerLockControls.getObject().position.y += velocity.y * delta;

    const pos = pointerLockControls.getObject().position;

    // Raycast downward to find ground (cast from slightly above current position)
    groundRaycaster.set(new THREE.Vector3(pos.x, pos.y + 0.5, pos.z), downDirection);
    groundRaycaster.far = 100;
    const intersects = groundRaycaster.intersectObjects(scene.children, true);

    let groundY = 0; // Default ground level
    if (intersects.length > 0) {
        // Find the first solid ground (filter out thin objects like lines, nets)
        for (let i = 0; i < intersects.length; i++) {
            const hit = intersects[i];
            // Skip very thin objects (wireframe, lines) and transparent objects
            if (hit.object.material && hit.object.material.wireframe) continue;
            if (hit.object.material && hit.object.material.transparent && hit.object.material.opacity < 0.5) continue;

            if (hit.distance < 60) {
                groundY = pos.y + 0.5 - hit.distance; // Adjust for ray start offset
                break;
            }
        }
    }

    // Smooth ground height to prevent jitter (lerp towards detected ground)
    lastGroundY = lastGroundY + (groundY - lastGroundY) * 0.3;

    // Check if on ground (with small tolerance)
    const groundLevel = lastGroundY + playerHeight;
    if (pos.y <= groundLevel + 0.1) {
        velocity.y = 0;
        pos.y = groundLevel;
        canJump = true;
    }

    // Minimum height (don't fall through world)
    if (pos.y < playerHeight) {
        pos.y = playerHeight;
        velocity.y = 0;
        canJump = true;
    }

    // Boundary limits
    const bound = 120;
    pos.x = Math.max(-bound, Math.min(bound, pos.x));
    pos.z = Math.max(-bound, Math.min(bound, pos.z));

    updateHUD(lastGroundY);
    updateMinimap();
}

function updateHUD(groundY = 0) {
    const pos = camera.position;
    document.getElementById('hud-position').textContent = `X: ${pos.x.toFixed(0)} | Z: ${pos.z.toFixed(0)} | Ground: ${groundY.toFixed(1)}`;
    document.getElementById('hud-mode').textContent = isRunning ? '🏃 Running' : '🚶 Walking';
}

// ==========================================
// MINIMAP
// ==========================================
let minimapCtx;
function initMinimap() {
    const c = document.getElementById('minimap-canvas');
    minimapCtx = c.getContext('2d');
    drawMinimapBg();
}

function drawMinimapBg() {
    const c = document.getElementById('minimap-canvas');
    minimapCtx.fillStyle = '#2a5a2a';
    minimapCtx.fillRect(0, 0, c.width, c.height);
    minimapCtx.strokeStyle = '#fff';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(15, 15, c.width - 30, c.height - 30);
    minimapCtx.beginPath();
    minimapCtx.moveTo(c.width / 2, 15);
    minimapCtx.lineTo(c.width / 2, c.height - 15);
    minimapCtx.stroke();
    minimapCtx.beginPath();
    minimapCtx.arc(c.width / 2, c.height / 2, 10, 0, Math.PI * 2);
    minimapCtx.stroke();
}

function updateMinimap() {
    if (!minimapCtx) return;
    const c = document.getElementById('minimap-canvas');
    const dot = document.getElementById('player-dot');
    const pos = camera.position;
    const mapX = ((pos.x / 100) * (c.width / 2 - 15)) + c.width / 2;
    const mapY = ((pos.z / 100) * (c.height / 2 - 15)) + c.height / 2;
    dot.style.left = (10 + mapX) + 'px';
    dot.style.top = (10 + mapY) + 'px';
}

// ==========================================
// CONTROL BUTTONS
// ==========================================
function setupControlButtons() {
    document.getElementById('btn-top-view').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(0, 200, 1), new THREE.Vector3(0, 0, 0));
    });
    document.getElementById('btn-side-view').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(0, 50, 150), new THREE.Vector3(0, 0, 0));
    });
    document.getElementById('btn-goal-view').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(80, 15, 0), new THREE.Vector3(-20, 2, 0));
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(0, 100, 150), new THREE.Vector3(0, 0, 0));
    });
}

function animateCamera(targetPos, targetLook) {
    const startPos = camera.position.clone();
    const startLook = orbitControls.target.clone();
    const startTime = performance.now();
    const dur = 1500;

    function update() {
        const t = Math.min((performance.now() - startTime) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(startPos, targetPos, ease);
        orbitControls.target.lerpVectors(startLook, targetLook, ease);
        orbitControls.update();
        if (t < 1) requestAnimationFrame(update);
    }
    update();
}

// ==========================================
// RESIZE & ANIMATE
// ==========================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const delta = (now - prevTime) / 1000;
    prevTime = now;
    updateWalking(delta);
    if (currentMode === 'orbit') orbitControls.update();
    renderer.render(scene, camera);
}

// Start
init();
