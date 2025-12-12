// ==========================================
// LIGHTING - Stadium Lighting Setup
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
