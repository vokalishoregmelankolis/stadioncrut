// STADIUM BRANDING - Advertising, Dugouts, Clocks, Signs, Flags
// Extracted from stadium.js for better organization

// Gold letter material (shared)
const goldLetterMat = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0x332200,
    emissiveIntensity: 0.3
});

// Add all branding elements to the stadium
function addStadiumBranding(stadium, FIELD_LENGTH, FIELD_WIDTH) {

    // === ADVERTISING BOARDS ===
    const adBoardMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a, roughness: 0.3, metalness: 0.2
    });
    const adBoardHeight = 1.2;
    const adBoardOffset = 3;

    // North side advertising
    const adNorth = new THREE.Mesh(
        new THREE.BoxGeometry(FIELD_LENGTH - 8, adBoardHeight, 0.4),
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
        new THREE.BoxGeometry(0.4, adBoardHeight, FIELD_WIDTH - 8),
        adBoardMat
    );
    adWest.position.set(-FIELD_LENGTH / 2 - adBoardOffset, adBoardHeight / 2, 0);
    stadium.add(adWest);

    const adEast = adWest.clone();
    adEast.position.set(FIELD_LENGTH / 2 + adBoardOffset, adBoardHeight / 2, 0);
    stadium.add(adEast);

    // Sponsor Logo Panels
    const sponsorColors = [0xCC0000, 0x004C99, 0xFFD700, 0xFFFFFF, 0x00AA00];
    const sponsorMat = (color) => new THREE.MeshBasicMaterial({ color: color });

    for (let i = 0; i < 8; i++) {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(10, adBoardHeight - 0.2, 0.15),
            sponsorMat(sponsorColors[i % sponsorColors.length])
        );
        panel.position.set(-35 + i * 10, adBoardHeight / 2, -FIELD_WIDTH / 2 - adBoardOffset + 0.25);
        stadium.add(panel);
    }

    for (let i = 0; i < 8; i++) {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(10, adBoardHeight - 0.2, 0.15),
            sponsorMat(sponsorColors[(i + 2) % sponsorColors.length])
        );
        panel.position.set(-35 + i * 10, adBoardHeight / 2, FIELD_WIDTH / 2 + adBoardOffset - 0.25);
        stadium.add(panel);
    }

    // LED light strips
    const ledStripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ledNorth = new THREE.Mesh(
        new THREE.BoxGeometry(FIELD_LENGTH - 10, 0.15, 0.15),
        ledStripMat
    );
    ledNorth.position.set(0, adBoardHeight + 0.1, -FIELD_WIDTH / 2 - adBoardOffset);
    stadium.add(ledNorth);

    const ledSouth = ledNorth.clone();
    ledSouth.position.set(0, adBoardHeight + 0.1, FIELD_WIDTH / 2 + adBoardOffset);
    stadium.add(ledSouth);

    // === TUNNEL ENTRANCE ===
    const tunnelGroup = new THREE.Group();

    const tunnelMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a, roughness: 0.4, metalness: 0.1
    });
    const tunnel = new THREE.Mesh(
        new THREE.BoxGeometry(10, 4, 5),
        tunnelMat
    );
    tunnel.position.set(0, 2, 2.5);
    tunnelGroup.add(tunnel);

    const tunnelFrameMat = new THREE.MeshStandardMaterial({
        color: 0xCC0000, roughness: 0.4, metalness: 0.1,
        emissive: 0x220000, emissiveIntensity: 0.2
    });

    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(12, 1.5, 1),
        tunnelFrameMat
    );
    topFrame.position.set(0, 4.5, 0);
    tunnelGroup.add(topFrame);

    [-1, 1].forEach(side => {
        const sideFrame = new THREE.Mesh(
            new THREE.BoxGeometry(1, 5, 1),
            tunnelFrameMat
        );
        sideFrame.position.set(side * 5.5, 2.5, 0);
        tunnelGroup.add(sideFrame);
    });

    // "THIS IS OLD TRAFFORD" signage
    const signBgMat = new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 0.5, metalness: 0.1
    });
    const signBg = new THREE.Mesh(
        new THREE.BoxGeometry(18, 3, 0.5),
        signBgMat
    );
    signBg.position.set(0, 7, -0.5);
    tunnelGroup.add(signBg);

    const thisIsPanel = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1.2, 0.3),
        goldLetterMat
    );
    thisIsPanel.position.set(-4, 7.5, -0.3);
    tunnelGroup.add(thisIsPanel);

    const oldTraffordPanel = new THREE.Mesh(
        new THREE.BoxGeometry(12, 1.5, 0.3),
        goldLetterMat
    );
    oldTraffordPanel.position.set(0, 6, -0.3);
    tunnelGroup.add(oldTraffordPanel);

    const crestBg = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    crestBg.position.set(0, 10.5, -0.5);
    tunnelGroup.add(crestBg);

    const tunnelShield = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xCC0000, roughness: 0.3 })
    );
    tunnelShield.position.set(0, 10.5, -0.3);
    tunnelGroup.add(tunnelShield);

    tunnelGroup.position.set(0, 0, FIELD_WIDTH / 2 + 5);
    stadium.add(tunnelGroup);

    // === DUGOUTS ===
    function createDugout(isHome) {
        const dugout = new THREE.Group();
        const dugoutColor = isHome ? 0xCC0000 : 0x333333;

        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x222222, roughness: 0.4, metalness: 0.3
        });
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(12, 0.5, 4),
            roofMat
        );
        roof.position.set(0, 3, 0);
        dugout.add(roof);

        const backMat = new THREE.MeshStandardMaterial({
            color: dugoutColor, roughness: 0.5, metalness: 0.1
        });
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(12, 2.5, 0.3),
            backMat
        );
        back.position.set(0, 1.25, -1.85);
        dugout.add(back);

        const seatMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, roughness: 0.3, metalness: 0.1
        });
        for (let i = 0; i < 6; i++) {
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1, 0.8),
                seatMat
            );
            seat.position.set(-5 + i * 2, 0.5, 0);
            dugout.add(seat);

            const seatBack = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.5, 0.2),
                seatMat
            );
            seatBack.position.set(-5 + i * 2, 1.25, -0.5);
            dugout.add(seatBack);
        }

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xaaddff, roughness: 0.1, metalness: 0.3,
            transparent: true, opacity: 0.4
        });
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(12, 2, 0.1),
            glassMat
        );
        glass.position.set(0, 1.5, 1.95);
        dugout.add(glass);

        if (isHome) {
            const logo = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2, 0.2),
                goldLetterMat
            );
            logo.position.set(0, 1.5, -1.6);
            dugout.add(logo);
        }

        return dugout;
    }

    const homeDugout = createDugout(true);
    homeDugout.position.set(-15, 0, FIELD_WIDTH / 2 + 6);
    homeDugout.rotation.y = Math.PI; // Face the pitch
    stadium.add(homeDugout);

    const awayDugout = createDugout(false);
    awayDugout.position.set(15, 0, FIELD_WIDTH / 2 + 6);
    awayDugout.rotation.y = Math.PI; // Face the pitch
    stadium.add(awayDugout);

    // === STRETFORD END CLOCK ===
    const clockGroup = new THREE.Group();

    const clockFace = new THREE.Mesh(
        new THREE.CircleGeometry(4, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    clockFace.position.z = 0.1;
    clockGroup.add(clockFace);

    const clockBorder = new THREE.Mesh(
        new THREE.RingGeometry(3.8, 4.5, 32),
        goldLetterMat
    );
    clockBorder.position.z = 0.15;
    clockGroup.add(clockBorder);

    const clockCenter = new THREE.Mesh(
        new THREE.CircleGeometry(0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    clockCenter.position.z = 0.25;
    clockGroup.add(clockCenter);

    // Hour hand - 10 o'clock
    const hourHandGroup = new THREE.Group();
    const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    hourHand.position.y = 1;
    hourHandGroup.add(hourHand);
    hourHandGroup.position.z = 0.2;
    hourHandGroup.rotation.z = Math.PI / 6;
    clockGroup.add(hourHandGroup);

    // Minute hand - 2 o'clock
    const minuteHandGroup = new THREE.Group();
    const minuteHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 2.8, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    minuteHand.position.y = 1.4;
    minuteHandGroup.add(minuteHand);
    minuteHandGroup.position.z = 0.22;
    minuteHandGroup.rotation.z = -Math.PI / 3;
    clockGroup.add(minuteHandGroup);

    // Hour markers
    for (let i = 0; i < 12; i++) {
        const markerAngle = (i * Math.PI / 6);
        const marker = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.5, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        marker.position.set(
            Math.sin(markerAngle) * 3.2,
            Math.cos(markerAngle) * 3.2,
            0.2
        );
        marker.rotation.z = -markerAngle;
        clockGroup.add(marker);
    }

    clockGroup.scale.set(1.5, 1.5, 1.5);
    clockGroup.position.set(-FIELD_LENGTH / 2 - 8, 18, 0);
    clockGroup.rotation.y = Math.PI / 2;
    stadium.add(clockGroup);

    // === THEATRE OF DREAMS SIGNAGE ===
    const theatreSignGroup = new THREE.Group();

    const logoTextureLoader = new THREE.TextureLoader();
    const muLogoTexture = logoTextureLoader.load('assets/mu_logo_white.jpg');

    const logoBg = new THREE.Mesh(
        new THREE.BoxGeometry(12, 15, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    logoBg.position.set(0, 12, 0);
    theatreSignGroup.add(logoBg);

    const logoPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(11, 14),
        new THREE.MeshStandardMaterial({
            map: muLogoTexture, roughness: 0.4, metalness: 0.0, transparent: true
        })
    );
    logoPanel.position.set(0, 12, 0.2);
    theatreSignGroup.add(logoPanel);

    const theatreSignBg = new THREE.Mesh(
        new THREE.BoxGeometry(40, 5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 })
    );
    theatreSignBg.position.set(0, 0, 0);
    theatreSignGroup.add(theatreSignBg);

    const theatreFontLoader = new THREE.FontLoader();
    theatreFontLoader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const theatreTextMat = new THREE.MeshStandardMaterial({
            color: 0xCC0000, roughness: 0.3, metalness: 0.0
        });
        const theatreTextGeo = new THREE.TextGeometry('THEATRE OF DREAMS', {
            font: font, size: 1.8, height: 0.3, curveSegments: 12
        });
        theatreTextGeo.computeBoundingBox();
        theatreTextGeo.center();
        const theatreTextMesh = new THREE.Mesh(theatreTextGeo, theatreTextMat);
        theatreTextMesh.position.set(0, 0, 0.4);
        theatreSignGroup.add(theatreTextMesh);
    });

    theatreSignGroup.scale.set(0.8, 0.8, 0.8);
    theatreSignGroup.position.set(0, 36, -FIELD_WIDTH / 2 - 5);
    theatreSignGroup.rotation.y = 0; // Face toward pitch (inward)
    stadium.add(theatreSignGroup);

    // === SIR ALEX FERGUSON STAND SIGNAGE ===
    const safGroup = new THREE.Group();
    const loader = new THREE.FontLoader();
    loader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const textMat = new THREE.MeshStandardMaterial({
            color: 0xDA020E, roughness: 0.3, metalness: 0.1,
            emissive: 0x220000, emissiveIntensity: 0.1
        });
        const textGeo = new THREE.TextGeometry('SIR ALEX FERGUSON STAND', {
            font: font, size: 2.5, height: 0.5, curveSegments: 12
        });
        textGeo.computeBoundingBox();
        textGeo.center();
        const textMesh = new THREE.Mesh(textGeo, textMat);
        safGroup.add(textMesh);
    });
    safGroup.position.set(0, 32, -FIELD_WIDTH / 2 - 2);
    safGroup.rotation.y = 0;
    stadium.add(safGroup);

    // === MUNICH CLOCK MEMORIAL ===
    const munichClockGroup = new THREE.Group();

    const memorialBg = new THREE.Mesh(
        new THREE.BoxGeometry(12, 14, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
    );
    munichClockGroup.add(memorialBg);

    const munichClockFace = new THREE.Mesh(
        new THREE.CircleGeometry(3, 32),
        new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.4 })
    );
    munichClockFace.position.set(0, 3, 0.3);
    munichClockGroup.add(munichClockFace);

    const munichClockBorder = new THREE.Mesh(
        new THREE.RingGeometry(2.8, 3.3, 32),
        new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.4, metalness: 0.2 })
    );
    munichClockBorder.position.set(0, 3, 0.35);
    munichClockGroup.add(munichClockBorder);

    // Hour hand - 3 o'clock
    const munichHourGroup = new THREE.Group();
    const munichHourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 1.5, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    munichHourHand.position.y = 0.75;
    munichHourGroup.add(munichHourHand);
    munichHourGroup.position.set(0, 3, 0.4);
    munichHourGroup.rotation.z = -Math.PI / 2;
    munichClockGroup.add(munichHourGroup);

    // Minute hand - 4 minutes
    const munichMinuteGroup = new THREE.Group();
    const munichMinuteHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    munichMinuteHand.position.y = 1.1;
    munichMinuteGroup.add(munichMinuteHand);
    munichMinuteGroup.position.set(0, 3, 0.42);
    munichMinuteGroup.rotation.z = -((4 / 60) * 2 * Math.PI);
    munichClockGroup.add(munichMinuteGroup);

    const munichTextPanel = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.5 })
    );
    munichTextPanel.position.set(0, -1, 0.3);
    munichClockGroup.add(munichTextPanel);

    const datePanel = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    datePanel.position.set(0, -3, 0.3);
    munichClockGroup.add(datePanel);

    const wreathMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.6 });
    [-1, 1].forEach(side => {
        const wreath = new THREE.Mesh(
            new THREE.TorusGeometry(1.5, 0.3, 8, 16),
            wreathMat
        );
        wreath.position.set(side * 4.5, -1.5, 0.4);
        munichClockGroup.add(wreath);

        const ribbon = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 1.5, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xCC0000 })
        );
        ribbon.position.set(side * 4.5, -3, 0.5);
        munichClockGroup.add(ribbon);
    });

    munichClockGroup.scale.set(1.0, 1.0, 1.0);
    munichClockGroup.position.set(FIELD_LENGTH / 2 + 8, 18, 0);
    munichClockGroup.rotation.y = -Math.PI / 2;
    stadium.add(munichClockGroup);

    // === FLOODLIGHTS ===
    const floodlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFACD });
    const floodlightHousingMat = new THREE.MeshStandardMaterial({
        color: 0x333333, roughness: 0.4, metalness: 0.3
    });

    const floodlightY = 38;
    const floodlightPositions = [
        { x: 0, z: -FIELD_WIDTH / 2 - 20 },
        { x: 0, z: FIELD_WIDTH / 2 + 20 },
        { x: -FIELD_LENGTH / 2 - 20, z: 0 },
        { x: FIELD_LENGTH / 2 + 20, z: 0 }
    ];

    floodlightPositions.forEach((pos, idx) => {
        const isNS = idx < 2;
        const numLights = isNS ? 12 : 8;

        for (let i = 0; i < numLights; i++) {
            const housing = new THREE.Mesh(
                new THREE.BoxGeometry(isNS ? 6 : 1.5, 2.5, isNS ? 1.5 : 6),
                floodlightHousingMat
            );

            const light = new THREE.Mesh(
                new THREE.BoxGeometry(isNS ? 5 : 1, 1.8, isNS ? 1 : 5),
                floodlightMat
            );

            if (isNS) {
                const xPos = -FIELD_LENGTH / 2 + 10 + i * (FIELD_LENGTH / numLights);
                housing.position.set(xPos, floodlightY, pos.z);
                light.position.set(xPos, floodlightY, pos.z + (idx === 0 ? 0.3 : -0.3));
            } else {
                const zPos = -FIELD_WIDTH / 2 + 8 + i * (FIELD_WIDTH / numLights);
                housing.position.set(pos.x, floodlightY, zPos);
                light.position.set(pos.x + (idx === 2 ? 0.3 : -0.3), floodlightY, zPos);
            }
            stadium.add(housing);
            stadium.add(light);
        }
    });

    // === FLAGS (ANIMATED WAVING) ===
    const flagTextureLoader = new THREE.TextureLoader();
    const flagTexture = flagTextureLoader.load('assets/most of famous player in the world was dreaming to play in Manchester united.jfif');
    flagTexture.wrapS = THREE.ClampToEdgeWrapping;
    flagTexture.wrapT = THREE.ClampToEdgeWrapping;

    const flagMat = new THREE.MeshStandardMaterial({
        map: flagTexture, roughness: 0.6, metalness: 0.0, side: THREE.DoubleSide
    });

    const flagPositions = [
        { x: FIELD_LENGTH / 2 + 5, z: -FIELD_WIDTH / 2 - 5, angle: Math.PI / 4 },
        { x: -FIELD_LENGTH / 2 - 5, z: -FIELD_WIDTH / 2 - 5, angle: -Math.PI / 4 },
        { x: FIELD_LENGTH / 2 + 5, z: FIELD_WIDTH / 2 + 5, angle: 3 * Math.PI / 4 },
        { x: -FIELD_LENGTH / 2 - 5, z: FIELD_WIDTH / 2 + 5, angle: -3 * Math.PI / 4 }
    ];

    // Store flags for animation
    window.animatedFlags = [];

    flagPositions.forEach((pos, index) => {
        const flagGroup = new THREE.Group();

        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 12, 8),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.7 })
        );
        pole.position.y = 6;
        flagGroup.add(pole);

        const flag = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 3, 16, 8), // More segments for smoother wave
            flagMat.clone() // Clone material for each flag
        );
        flag.position.set(2.5, 10, 0);

        // Store original positions for animation
        const positions = flag.geometry.attributes.position;
        const originalZ = new Float32Array(positions.count);
        for (let i = 0; i < positions.count; i++) {
            originalZ[i] = positions.getZ(i);
        }

        // Add to animated flags array
        window.animatedFlags.push({
            mesh: flag,
            originalZ: originalZ,
            offset: index * 0.5 // Phase offset for each flag
        });

        flagGroup.add(flag);

        const finial = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            goldLetterMat
        );
        finial.position.y = 12.3;
        flagGroup.add(finial);

        flagGroup.position.set(pos.x, 0, pos.z);
        flagGroup.rotation.y = pos.angle;
        stadium.add(flagGroup);
    });

    // === STRETFORD END SIGN ===
    const stretfordSign = new THREE.Mesh(
        new THREE.BoxGeometry(25, 3, 0.3),
        goldLetterMat
    );
    stretfordSign.position.set(-FIELD_LENGTH / 2 - 20, 28, 0);
    stretfordSign.rotation.y = Math.PI / 2;
    stadium.add(stretfordSign);
}

// Flag animation function - call this in the main animate loop
function updateFlags(time) {
    if (!window.animatedFlags) return;

    window.animatedFlags.forEach(flagData => {
        const positions = flagData.mesh.geometry.attributes.position;
        const originalZ = flagData.originalZ;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);

            // Wave animation using sine waves
            const wave = Math.sin(x * 1.5 + time * 3 + flagData.offset) * 0.3;
            const wave2 = Math.sin(y * 2 + time * 2) * 0.1;

            positions.setZ(i, originalZ[i] + wave + wave2);
        }

        positions.needsUpdate = true;
        flagData.mesh.geometry.computeVertexNormals();
    });
}

