// STADIUM ENTRANCE - External Facade and Main Entrance
// Extracted from stadium.js for better organization

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

// === OLD TRAFFORD MAIN ENTRANCE FACADE ===
function createMainEntrance() {
    const entrance = new THREE.Group();

    const entranceWidth = 80;
    const entranceHeight = 25;

    // Large GREEN glass facade (Old Trafford signature teal color)
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x4A9A8C,  // Teal/turquoise like Old Trafford
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.7
    });

    const glassPanel = new THREE.Mesh(
        new THREE.BoxGeometry(entranceWidth, 30, 1),
        glassMat
    );
    glassPanel.position.set(0, 15, 0);
    entrance.add(glassPanel);

    // White steel frame grid
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0, roughness: 0.3, metalness: 0.5
    });

    // Vertical frames
    const numVFrames = 8;
    for (let i = 0; i <= numVFrames; i++) {
        const x = -entranceWidth / 2 + (entranceWidth / numVFrames) * i;
        const vFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 30, 0.8),
            frameMat
        );
        vFrame.position.set(x, 15, 0.5);
        entrance.add(vFrame);
    }

    // Horizontal frames
    const numHFrames = 5;
    for (let i = 0; i <= numHFrames; i++) {
        const y = (30 / numHFrames) * i;
        const hFrame = new THREE.Mesh(
            new THREE.BoxGeometry(entranceWidth, 0.6, 0.6),
            frameMat
        );
        hFrame.position.set(0, y, 0.5);
        entrance.add(hFrame);
    }

    // === SIDE SCREENS (With Images) ===
    const screenWidth = 25;
    const screenHeight = 20;
    const screenGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 1);

    const screenFrameMat = new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 0.5, metalness: 0.8
    });

    const textureLoader = new THREE.TextureLoader();

    const createScreen = (xPos, imagePath) => {
        const screenGroup = new THREE.Group();

        // Frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(screenWidth + 1, screenHeight + 1, 1.2),
            screenFrameMat
        );
        screenGroup.add(frame);

        // Display Area
        let displayMat;
        if (imagePath) {
            const texture = textureLoader.load(imagePath);
            displayMat = new THREE.MeshStandardMaterial({
                map: texture,
                color: 0xffffff,
                roughness: 0.2,
                metalness: 0.1,
                emissive: 0xffffff,
                emissiveIntensity: 0.15
            });
        } else {
            displayMat = new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 0.2,
                metalness: 0.6,
                emissive: 0x111111,
                emissiveIntensity: 0.2
            });
        }

        const display = new THREE.Mesh(screenGeo, displayMat);
        display.position.z = 0.2;
        screenGroup.add(display);

        screenGroup.position.set(xPos, 15, 0);
        return screenGroup;
    };

    // Left Screen - MU Logo / Hero Image
    const leftScreen = createScreen(-entranceWidth / 2 - screenWidth / 2 - 2, 'assets/most of famous player in the world was dreaming to play in Manchester united.jfif');
    entrance.add(leftScreen);

    // Right Screen - Fans Banner
    const rightScreen = createScreen(entranceWidth / 2 + screenWidth / 2 + 2, 'assets/Forever and ever_ Manchester is Red.jfif');
    entrance.add(rightScreen);

    // === GLASS DOORS ===
    const doorGroup = new THREE.Group();
    const doorHeight = 4;
    const doorWidth = 3;
    const doorFrameColor = 0x333333;

    const doorFrameMat = new THREE.MeshStandardMaterial({
        color: doorFrameColor, roughness: 0.5, metalness: 0.5
    });

    // 4 Sliding Doors in the center
    for (let i = -1.5; i <= 1.5; i += 1) {
        const xPos = i * doorWidth;

        // Door Glass
        const doorGlass = new THREE.Mesh(
            new THREE.BoxGeometry(doorWidth - 0.2, doorHeight, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0x88ccff, transparent: true, opacity: 0.6, roughness: 0.1
            })
        );
        doorGlass.position.set(xPos, doorHeight / 2, 0);
        doorGroup.add(doorGlass);

        // Top bar
        const dTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.2, 0.35), doorFrameMat);
        dTop.position.set(xPos, doorHeight, 0);
        doorGroup.add(dTop);

        // Bottom bar
        const dBot = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.2, 0.35), doorFrameMat);
        dBot.position.set(xPos, 0, 0);
        doorGroup.add(dBot);

        // Side bars
        [-1, 1].forEach(s => {
            const dSide = new THREE.Mesh(new THREE.BoxGeometry(0.2, doorHeight, 0.35), doorFrameMat);
            dSide.position.set(xPos + s * (doorWidth / 2 - 0.1), doorHeight / 2, 0);
            doorGroup.add(dSide);
        });

        // Door Handle
        const handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
        );
        handle.position.set(xPos + 1, doorHeight / 2, 0.2);
        doorGroup.add(handle);
    }

    doorGroup.position.set(0, 0, 1);
    entrance.add(doorGroup);

    // "MANCHESTER UNITED" signage bar
    const signBgMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5, roughness: 0.4, metalness: 0.0
    });
    const signBg = new THREE.Mesh(
        new THREE.BoxGeometry(entranceWidth, 6, 1.5),
        signBgMat
    );
    signBg.position.set(0, entranceHeight + 8, 1);
    entrance.add(signBg);

    // Load font and create 3D text for "MANCHESTER UNITED"
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const textMat = new THREE.MeshStandardMaterial({
            color: 0xCC0000, roughness: 0.3, metalness: 0.0
        });

        // "MANCHESTER" text
        const manchesterGeo = new THREE.TextGeometry('MANCHESTER', {
            font: font,
            size: 3,
            height: 0.8,
            curveSegments: 12
        });
        manchesterGeo.computeBoundingBox();
        manchesterGeo.center();
        const manchesterMesh = new THREE.Mesh(manchesterGeo, textMat);
        manchesterMesh.position.set(-20, entranceHeight + 8, 2);
        entrance.add(manchesterMesh);

        // "UNITED" text
        const unitedGeo = new THREE.TextGeometry('UNITED', {
            font: font,
            size: 3,
            height: 0.8,
            curveSegments: 12
        });
        unitedGeo.computeBoundingBox();
        unitedGeo.center();
        const unitedMesh = new THREE.Mesh(unitedGeo, textMat);
        unitedMesh.position.set(18, entranceHeight + 8, 2);
        entrance.add(unitedMesh);
    });

    // === UNITED TRINITY STATUE ===
    const statueBaseMat = new THREE.MeshStandardMaterial({
        color: 0x707070, roughness: 0.7, metalness: 0.1
    });
    const statueMat = new THREE.MeshStandardMaterial({
        color: 0x8B5A2B, roughness: 0.6, metalness: 0.3
    });

    const statueZ = 20;
    const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 5),
        statueBaseMat
    );
    pedestal.position.set(0, 2.5, statueZ);
    entrance.add(pedestal);

    // Three figures
    for (let i = -1; i <= 1; i++) {
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, 6, 12),
            statueMat
        );
        body.position.set(i * 3, 8, statueZ);
        entrance.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 12, 12),
            statueMat
        );
        head.position.set(i * 3, 12, statueZ);
        entrance.add(head);

        if (i === 0) {
            const armL = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 4, 8),
                statueMat
            );
            armL.rotation.z = Math.PI / 3;
            armL.position.set(-2, 10.5, statueZ);
            entrance.add(armL);

            const armR = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 4, 8),
                statueMat
            );
            armR.rotation.z = -Math.PI / 3;
            armR.position.set(2, 10.5, statueZ);
            entrance.add(armR);
        }
    }

    return entrance;
}
