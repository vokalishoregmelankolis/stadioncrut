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
