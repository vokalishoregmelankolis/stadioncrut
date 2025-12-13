// STADIUM TOWERS - Corner Towers and Staircase Towers

// Manchester United themed corner tower
function createMUCornerTower(x, z, faceAngle = 0) {
    const tower = new THREE.Group();

    const towerW = 14;
    const towerH = 50;

    // Main body - Deep Manchester United red
    const redMat = new THREE.MeshStandardMaterial({
        color: 0xDA020E,
        roughness: 0.4,
        metalness: 0.1,
        emissive: 0x220000,
        emissiveIntensity: 0.15
    });

    // Base section
    const baseSection = new THREE.Mesh(
        new THREE.BoxGeometry(towerW + 2, 15, towerW + 2),
        redMat
    );
    baseSection.position.y = 7.5;
    baseSection.castShadow = true;
    tower.add(baseSection);

    // Main tower body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(towerW, towerH - 15, towerW),
        redMat
    );
    body.position.y = 15 + (towerH - 15) / 2;
    body.castShadow = true;
    tower.add(body);

    // Gold accent materials
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0x332200,
        emissiveIntensity: 0.2
    });

    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.3, metalness: 0.0
    });

    // Devil Trident Motif
    [-1, 1].forEach(side => {
        const tridentGroup = new THREE.Group();

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 0.5), goldMat);
        handle.position.set(0, -2, 0);
        tridentGroup.add(handle);

        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.5), goldMat);
        crossbar.position.set(0, 2, 0);
        tridentGroup.add(crossbar);

        const prongGeo = new THREE.BoxGeometry(0.6, 5, 0.5);

        const centerProng = new THREE.Mesh(prongGeo, goldMat);
        centerProng.position.set(0, 4.5, 0);
        tridentGroup.add(centerProng);

        const leftProng = new THREE.Mesh(prongGeo, goldMat);
        leftProng.position.set(-2.2, 4.5, 0);
        tridentGroup.add(leftProng);

        const rightProng = new THREE.Mesh(prongGeo, goldMat);
        rightProng.position.set(2.2, 4.5, 0);
        tridentGroup.add(rightProng);

        tridentGroup.position.set(side * (towerW / 2 + 0.3), towerH / 2 + 5, 0);
        tridentGroup.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        tower.add(tridentGroup);
    });

    // White corner stripes
    for (let i = 0; i < 4; i++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.2, towerH - 10, 1.2), whiteMat);
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        stripe.position.set(Math.cos(angle) * (towerW / 2), towerH / 2 + 5, Math.sin(angle) * (towerW / 2));
        tower.add(stripe);
    }

    // Gold accent bands
    [12, towerH / 2, towerH - 5].forEach((yPos, idx) => {
        const bandThickness = idx === 1 ? 3 : 1.5;
        const band = new THREE.Mesh(new THREE.BoxGeometry(towerW + 1.5, bandThickness, towerW + 1.5), goldMat);
        band.position.y = yPos;
        tower.add(band);
    });

    // Crest panel
    const crestPanel = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.6), whiteMat);
    crestPanel.position.set(0, towerH / 2 + 8, towerW / 2 + 0.4);
    tower.add(crestPanel);

    const shield = new THREE.Mesh(
        new THREE.BoxGeometry(6, 6.5, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xCC0000, roughness: 0.3, metalness: 0.0 })
    );
    shield.position.set(0, towerH / 2 + 8, towerW / 2 + 0.7);
    tower.add(shield);

    // Crest trident
    const crestTrident = new THREE.Group();

    const leftHorn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 0.3), goldMat);
    leftHorn.position.set(-1.5, 1, 0);
    leftHorn.rotation.z = 0.3;
    crestTrident.add(leftHorn);

    const rightHorn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 0.3), goldMat);
    rightHorn.position.set(1.5, 1, 0);
    rightHorn.rotation.z = -0.3;
    crestTrident.add(rightHorn);

    const crestCenterProng = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.5, 0.3), goldMat);
    crestCenterProng.position.set(0, 0.5, 0);
    crestTrident.add(crestCenterProng);

    crestTrident.position.set(0, towerH / 2 + 8.5, towerW / 2 + 0.95);
    tower.add(crestTrident);

    // Top cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.3 });
    const cap = new THREE.Mesh(new THREE.BoxGeometry(towerW + 3, 2, towerW + 3), capMat);
    cap.position.y = towerH + 1;
    tower.add(cap);

    const crownTrim = new THREE.Mesh(new THREE.BoxGeometry(towerW + 3.5, 0.5, towerW + 3.5), goldMat);
    crownTrim.position.y = towerH + 2.2;
    tower.add(crownTrim);

    // Corner lights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFEE88, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 4; i++) {
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), lightMat);
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        light.position.set(Math.cos(angle) * (towerW / 2 + 1), towerH + 2.5, Math.sin(angle) * (towerW / 2 + 1));
        tower.add(light);
    }

    tower.position.set(x, 0, z);
    tower.rotation.y = faceAngle;
    return tower;
}

// Staircase tower (Orange Old Trafford style)
function createStaircaseTower(xPos, zPos, height = 45) {
    const tower = new THREE.Group();
    const towerW = 8;
    const towerD = 8;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xD4824A, roughness: 0.7, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(towerW, height, towerD), bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    tower.add(body);

    // Walkable steps
    const stepGeo = new THREE.BoxGeometry(towerW * 0.9, 0.5, towerD * 0.9);
    const steps = new THREE.Mesh(stepGeo, stadiumMaterials.concrete);
    steps.position.set(0, height / 2, 0);
    steps.castShadow = true;
    steps.receiveShadow = true;
    if (window.walkableObjects) window.walkableObjects.push(steps);
    tower.add(steps);

    // White accent panels
    const whitePanelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.0 });
    [-1, 1].forEach(side => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(towerW * 0.3, height - 10, 0.5), whitePanelMat);
        panel.position.set(0, height / 2, side * (towerD / 2 + 0.3));
        tower.add(panel);
    });

    // Top cap
    const topCapMat = new THREE.MeshStandardMaterial({ color: 0xBF7040, roughness: 0.6, metalness: 0.1 });
    const topCap = new THREE.Mesh(new THREE.BoxGeometry(towerW + 1, 2, towerD + 1), topCapMat);
    topCap.position.y = height + 1;
    tower.add(topCap);

    tower.position.set(xPos, 0, zPos);
    return tower;
}
