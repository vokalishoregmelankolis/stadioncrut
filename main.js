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
    // Scene with better background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.0025); // AAA Fog Effect

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
    // 1. Hemisphere Light (Sky vs Ground) - subtle base
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x111111, 0.6);
    hemi.position.set(0, 500, 0);
    scene.add(hemi);

    // 2. Main Sun - Warm, High Intensity, Sharp Shadows
    const sun = new THREE.DirectionalLight(0xfffaed, 3.5);
    sun.position.set(100, 150, 50);
    sun.castShadow = true;

    // High-res shadows for AAA look
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    sun.shadow.bias = -0.00005;
    sun.shadow.normalBias = 0.02; // Reduces shadow acne
    scene.add(sun);

    // 3. Ambient - Fill shadows very slightly
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambient);

    // 4. Floodlights (Visuals & Spotlights)
    const floodPositions = [
        { x: 80, y: 60, z: 60, tx: 0, tz: 0 },
        { x: -80, y: 60, z: 60, tx: 0, tz: 0 },
        { x: 80, y: 60, z: -60, tx: 0, tz: 0 },
        { x: -80, y: 60, z: -60, tx: 0, tz: 0 },
    ];

    floodPositions.forEach(pos => {
        // Light
        const spot = new THREE.SpotLight(0xffffff, 1500); // High intensity for phy-lights
        spot.position.set(pos.x, pos.y, pos.z);
        spot.target.position.set(pos.tx, 0, pos.tz);
        spot.angle = Math.PI / 6;
        spot.penumbra = 0.5;
        spot.decay = 2; // Physical decay
        spot.distance = 400;
        spot.castShadow = true; // Multiple shadow casters = AAA
        spot.shadow.mapSize.width = 1024;
        spot.shadow.mapSize.height = 1024;
        spot.shadow.bias = -0.0001;
        scene.add(spot);
        scene.add(spot.target);

        // Visual "Bulb"
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        bulb.position.set(pos.x, pos.y, pos.z);
        scene.add(bulb);
    });
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

    // Sky gradient dome
    const skyGeo = new THREE.SphereGeometry(450, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0x89cff0) },
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
// GOALS
// ==========================================
function createGoals() {
    const goalW = 7.32, goalH = 2.44, goalD = 2.5;
    const postR = 0.06;

    const postMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2
    });
    const netMat = new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });

    function createGoal(xPos) {
        const goal = new THREE.Group();
        const dir = xPos > 0 ? 1 : -1;

        // Posts
        const postGeo = new THREE.CylinderGeometry(postR, postR, goalH, 12);
        [1, -1].forEach(s => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(0, goalH / 2, s * goalW / 2);
            post.castShadow = true;
            goal.add(post);
        });

        // Crossbar
        const crossGeo = new THREE.CylinderGeometry(postR, postR, goalW, 12);
        const cross = new THREE.Mesh(crossGeo, postMat);
        cross.rotation.x = Math.PI / 2;
        cross.position.set(0, goalH, 0);
        cross.castShadow = true;
        goal.add(cross);

        // Net back
        const backNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalW, goalH, 25, 10),
            netMat
        );
        backNet.position.set(dir * goalD, goalH / 2, 0);
        backNet.rotation.y = Math.PI / 2;
        goal.add(backNet);

        // Net top
        const topNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalW, goalD, 25, 8),
            netMat
        );
        topNet.position.set(dir * goalD / 2, goalH, 0);
        topNet.rotation.x = Math.PI / 2;
        goal.add(topNet);

        // Net sides
        [1, -1].forEach(s => {
            const sideNet = new THREE.Mesh(
                new THREE.PlaneGeometry(goalD, goalH, 8, 10),
                netMat
            );
            sideNet.position.set(dir * goalD / 2, goalH / 2, s * goalW / 2);
            goal.add(sideNet);
        });

        goal.position.x = xPos;
        return goal;
    }

    scene.add(createGoal(FIELD_LENGTH / 2 + 0.5));
    scene.add(createGoal(-FIELD_LENGTH / 2 - 0.5));
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

    // Materials - Old Trafford Colors
    const matConcrete = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.85 });
    const matBrick = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }); // Brick exterior
    const matRedWall = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.7 }); // Dark red
    const matRoof = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.2, side: THREE.DoubleSide });
    const matTruss = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.5 }); // White steel
    const matSeatRed = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.6 });
    const matSeatWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const matSeatDarkRed = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.6 });

    // --- Helper for Single Tier with Seat Patterns ---
    function createTier(width, depth, rows, yStart, zStart, pattern = null) {
        const g = new THREE.Group();
        const rowDepth = depth / rows;
        const rowHeight = 0.6; // Steeper for better visibility

        for (let r = 0; r < rows; r++) {
            const y = yStart + r * rowHeight;
            const z = zStart + r * rowDepth;

            // Concrete step
            const step = new THREE.Mesh(new THREE.BoxGeometry(width, rowHeight, rowDepth), matConcrete);
            step.position.set(0, y + rowHeight / 2, z + rowDepth / 2);
            step.receiveShadow = true;
            step.castShadow = true;
            g.add(step);

            // Seats with pattern support
            const numSeats = Math.floor(width / 0.8);
            const seatWidth = width / numSeats;
            for (let s = 0; s < numSeats; s++) {
                let seatMat = matSeatRed;
                // Create text-like patterns
                if (pattern === 'MANCHESTER') {
                    // Alternating pattern for visual effect
                    if ((r + s) % 7 === 0 || (r + s) % 11 === 0) seatMat = matSeatWhite;
                } else if (pattern === 'UNITED') {
                    if ((r + s) % 5 === 0 || (r + s) % 9 === 0) seatMat = matSeatWhite;
                } else {
                    // Default: mostly red with occasional variation
                    if (Math.random() > 0.92) seatMat = matSeatDarkRed;
                }

                const seat = new THREE.Mesh(new THREE.BoxGeometry(seatWidth * 0.85, 0.15, rowDepth * 0.5), seatMat);
                const xPos = -width / 2 + seatWidth / 2 + s * seatWidth;
                seat.position.set(xPos, y + rowHeight + 0.08, z + rowDepth / 2);
                g.add(seat);
            }
        }

        return { mesh: g, endY: yStart + rows * rowHeight, endZ: zStart + depth };
    }

    // --- Stand Builder with Old Trafford Details ---
    function createStand(width, tiersConfig, standType, pattern = null) {
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

                // Safety barrier
                const barrier = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, 0.2), matRedWall);
                barrier.position.set(0, currentY + 1.1, currentZ + 0.1);
                group.add(barrier);

                currentZ += walkDepth;
                currentY += 1;
            }

            const t = createTier(width, tier.depth, tier.rows, currentY, currentZ, pattern);
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

        // Main roof panel
        const roofGeo = new THREE.BoxGeometry(width + 6, 0.8, totalDepth + roofOverhang);
        const roof = new THREE.Mesh(roofGeo, matRoof);
        roof.position.set(0, roofY, (totalDepth + roofOverhang) / 2 - roofOverhang + 5);
        roof.castShadow = true;
        roof.receiveShadow = true;
        group.add(roof);

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

    // 1. NORTH (Sir Alex Ferguson Stand) - Tallest, 3 Tiers, "MANCHESTER" pattern
    const north = createStand(FIELD_LENGTH + 15, [
        { rows: 18, depth: 18 },
        { rows: 10, depth: 10 },
        { rows: 18, depth: 20 }
    ], 'north', 'MANCHESTER');
    north.mesh.rotation.y = Math.PI;
    north.mesh.position.set(0, 0, -distN - 5);
    stadium.add(north.mesh);

    // 2. SOUTH (Bobby Charlton Stand) - 2 Tiers, "UNITED" pattern
    const south = createStand(FIELD_LENGTH + 15, [
        { rows: 15, depth: 15 },
        { rows: 12, depth: 14 }
    ], 'south', 'UNITED');
    south.mesh.rotation.y = 0;
    south.mesh.position.set(0, 0, distS + 5);
    stadium.add(south.mesh);

    // 3. WEST (Stretford End) - 2 Tiers
    const west = createStand(FIELD_WIDTH + 15, [
        { rows: 14, depth: 14 },
        { rows: 14, depth: 16 }
    ], 'west');
    west.mesh.rotation.y = -Math.PI / 2;
    west.mesh.position.set(-distW - 5, 0, 0);
    stadium.add(west.mesh);

    // 4. EAST (Scoreboard End) - 2 Tiers
    const east = createStand(FIELD_WIDTH + 15, [
        { rows: 14, depth: 14 },
        { rows: 14, depth: 16 }
    ], 'east');
    east.mesh.rotation.y = Math.PI / 2;
    east.mesh.position.set(distE + 5, 0, 0);
    stadium.add(east.mesh);

    // --- Corner Towers (Old Trafford Style - Simple Rectangular) ---
    function createCornerTower(xPos, zPos) {
        const tower = new THREE.Group();
        const towerH = 35;
        const towerW = 12;

        // Main tower body - brick
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(towerW, towerH, towerW),
            matBrick
        );
        body.position.y = towerH / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        tower.add(body);

        // Red accent strip
        const accent = new THREE.Mesh(
            new THREE.BoxGeometry(towerW + 0.5, 3, towerW + 0.5),
            matRedWall
        );
        accent.position.y = towerH - 5;
        tower.add(accent);

        // Tower top
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(towerW + 2, 2, towerW + 2),
            matRoof
        );
        top.position.y = towerH + 1;
        tower.add(top);

        tower.position.set(xPos, 0, zPos);
        return tower;
    }

    // Add 4 corner towers
    const cornerOffset = 8;
    stadium.add(createCornerTower(FIELD_LENGTH / 2 + cornerOffset, -FIELD_WIDTH / 2 - cornerOffset)); // NE
    stadium.add(createCornerTower(-FIELD_LENGTH / 2 - cornerOffset, -FIELD_WIDTH / 2 - cornerOffset)); // NW
    stadium.add(createCornerTower(-FIELD_LENGTH / 2 - cornerOffset, FIELD_WIDTH / 2 + cornerOffset)); // SW
    stadium.add(createCornerTower(FIELD_LENGTH / 2 + cornerOffset, FIELD_WIDTH / 2 + cornerOffset)); // SE

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

    orbitBtn.addEventListener('click', () => {
        orbitBtn.classList.add('active');
        walkBtn.classList.remove('active');
        walkInstr.classList.add('hidden');
        currentMode = 'orbit';
        blocker.classList.add('hidden');
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

function updateWalking(delta) {
    if (currentMode !== 'walk' || !pointerLockControls.isLocked) return;

    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;
    velocity.y -= 25 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const speed = isRunning ? 50 : 25;
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    pointerLockControls.moveRight(-velocity.x * delta);
    pointerLockControls.moveForward(-velocity.z * delta);
    pointerLockControls.getObject().position.y += velocity.y * delta;

    if (pointerLockControls.getObject().position.y < playerHeight) {
        velocity.y = 0;
        pointerLockControls.getObject().position.y = playerHeight;
        canJump = true;
    }

    const pos = pointerLockControls.getObject().position;
    const bound = 100;
    pos.x = Math.max(-bound, Math.min(bound, pos.x));
    pos.z = Math.max(-bound, Math.min(bound, pos.z));

    updateHUD();
    updateMinimap();
}

function updateHUD() {
    const pos = camera.position;
    document.getElementById('hud-position').textContent = `X: ${pos.x.toFixed(0)} | Z: ${pos.z.toFixed(0)}`;
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
