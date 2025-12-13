// LIGHTING - Stadium Lighting Setup

function setupAdvancedLighting() {
    // === REALISTIC OVERCAST MORNING (Natural Look) ===

    // 1. Hemisphere Light - Subtle sky/ground color
    const hemi = new THREE.HemisphereLight(0x8899aa, 0x333333, 0.35);
    hemi.position.set(0, 500, 0);
    scene.add(hemi);

    // 2. Directional Light (Diffused sun through clouds)
    const sun = new THREE.DirectionalLight(0xb0b0b0, 0.4);
    sun.position.set(50, 100, 30);
    sun.castShadow = true;

    // Shadow settings
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    sun.shadow.bias = -0.0003;
    sun.shadow.radius = 3;
    scene.add(sun);

    // 3. Ambient Light - Minimal for contrast
    const ambient = new THREE.AmbientLight(0x505060, 0.3);
    scene.add(ambient);

    // 4. Stadium Floodlights - ON for match atmosphere
    const floodPositions = [
        { x: 60, y: 50, z: 0, tx: 0, tz: 0 },
        { x: -60, y: 50, z: 0, tx: 0, tz: 0 },
        { x: -35, y: 48, z: -52, tx: 0, tz: 0 },
        { x: 35, y: 48, z: -52, tx: 0, tz: 0 },
        { x: -35, y: 45, z: 47, tx: 0, tz: 0 },
        { x: 35, y: 45, z: 47, tx: 0, tz: 0 },
    ];

    floodPositions.forEach((pos) => {
        const spot = new THREE.SpotLight(0xffffee, 100);
        spot.position.set(pos.x, pos.y, pos.z);
        spot.target.position.set(pos.tx, 0, pos.tz);
        spot.angle = Math.PI / 3;
        spot.penumbra = 0.5;
        spot.decay = 2;
        spot.distance = 300;

        spot.castShadow = true;
        spot.shadow.mapSize.width = 512;
        spot.shadow.mapSize.height = 512;
        spot.shadow.bias = -0.0001;

        scene.add(spot);
        scene.add(spot.target);

        const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), fixtureMat);
        fixture.position.set(pos.x, pos.y + 0.5, pos.z);
        scene.add(fixture);
    });

    // 5. Pitch Glow (Very subtle)
    const pitchLight = new THREE.RectAreaLight(0xffffee, 0.3, 100, 65);
    pitchLight.position.set(0, 60, 0);
    pitchLight.rotation.x = -Math.PI / 2;
    scene.add(pitchLight);

    // 6. Fog for depth
    scene.fog = new THREE.FogExp2(0x889999, 0.002);
}




