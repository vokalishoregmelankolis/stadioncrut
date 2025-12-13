// STADIUM TIERS - Tiered Seating and Stand Builder

// Letter patterns for seat text display
const seatLetterPatterns = {
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

// Get text bitmap for seat coloring
function getTextBitmap(text, totalCols) {
    const letterWidth = 4;
    const textWidth = text.length * letterWidth;
    const startCol = Math.floor((totalCols - textWidth) / 2);
    const bitmap = [];
    for (let row = 0; row < 5; row++) {
        bitmap[row] = [];
        for (let col = 0; col < totalCols; col++) {
            const letterIdx = Math.floor((col - startCol) / letterWidth);
            const colInLetter = (col - startCol) % letterWidth;
            if (letterIdx >= 0 && letterIdx < text.length && colInLetter < 3) {
                const letter = seatLetterPatterns[text[letterIdx]] || seatLetterPatterns[' '];
                bitmap[row][col] = letter[row] ? letter[row][colInLetter] : 0;
            } else { bitmap[row][col] = 0; }
        }
    }
    return bitmap;
}

// Create a single tier of seating
function createTier(width, depth, rows, yStart, zStart, pattern, collector, matConcrete) {
    const g = new THREE.Group();
    const rowDepth = depth / rows;
    const rowHeight = 0.6;
    const dummy = new THREE.Object3D();

    const numSections = 48;
    const sectionWidth = width / numSections;
    let textBitmap = pattern ? getTextBitmap(pattern, numSections) : null;

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

        if (window.walkableObjects) window.walkableObjects.push(step);
        g.add(step);

        // Seats (Instanced)
        for (let s = 0; s < numSections; s++) {
            let type = 'red';

            if (textBitmap && rows >= 5) {
                const textRowStart = Math.floor((rows - 5) / 2);
                const textRow = r - textRowStart;
                const flippedCol = numSections - 1 - s;
                const flippedRow = 4 - textRow;
                if (textRow >= 0 && textRow < 5) {
                    if (textBitmap[flippedRow] && textBitmap[flippedRow][flippedCol] === 1) {
                        type = 'white';
                    }
                }
            }

            const xPos = -width / 2 + sectionWidth / 2 + s * sectionWidth;
            dummy.position.set(xPos, y + rowHeight + 0.06, z + rowDepth / 2);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(sectionWidth * 0.92, 1, 1);
            dummy.updateMatrix();
            addSeatInstance(collector, type, dummy.matrix.clone());
        }
    }

    // Fascia
    const fasciaHeight = 1.5;
    const fascia = new THREE.Mesh(
        new THREE.BoxGeometry(width, fasciaHeight, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.0 })
    );
    fascia.position.set(0, yStart + fasciaHeight / 2, zStart - 0.1);
    g.add(fascia);

    return { mesh: g, endY: yStart + rows * rowHeight, endZ: zStart + depth };
}

// Create a complete stadium stand with multiple tiers
function createStand(width, tiersConfig, standType, materials) {
    const { matConcrete, matBrick, matRedWall, matRoof, matTruss } = materials;
    const group = new THREE.Group();
    const seatCollector = { red: [], white: [] };

    let currentY = 0;
    let currentZ = 0;

    tiersConfig.forEach((tier, i) => {
        if (i > 0) {
            const walkDepth = 3;
            const walk = new THREE.Mesh(new THREE.BoxGeometry(width, 1, walkDepth), matConcrete);
            walk.position.set(0, currentY + 0.5, currentZ + walkDepth / 2);
            walk.receiveShadow = true;

            if (window.walkableObjects) window.walkableObjects.push(walk);
            group.add(walk);

            const barrierMat = matRedWall.clone();
            barrierMat.polygonOffset = true;
            barrierMat.polygonOffsetFactor = -1;
            barrierMat.polygonOffsetUnits = -1;
            const barrier = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, 0.3), barrierMat);
            barrier.position.set(0, currentY + 1.1, currentZ - 0.2);
            group.add(barrier);

            currentZ += walkDepth;
            currentY += 1;
        }

        const tierPattern = tier.pattern || null;
        const t = createTier(width, tier.depth, tier.rows, currentY, currentZ, tierPattern, seatCollector, matConcrete);
        group.add(t.mesh);
        currentY = t.endY;
        currentZ = t.endZ;
    });

    finalizeInstancedSeats(group, seatCollector, 3000, 1.2);

    const totalDepth = currentZ;
    const totalHeight = currentY;

    // Back Wall
    const wallH = totalHeight + 8;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, wallH, 1.5), matBrick);
    wall.position.set(0, wallH / 2, totalDepth + 0.75);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // Facade stripes
    const whiteFacadeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.0 });
    const redAccentMat = new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: 0.4, metalness: 0.0 });

    const numStripes = Math.floor(width / 20);
    for (let i = 0; i <= numStripes; i++) {
        const stripeX = -width / 2 + (width / numStripes) * i;
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.5, wallH - 5, 0.5), whiteFacadeMat);
        stripe.position.set(stripeX, wallH / 2, totalDepth + 2.3);
        group.add(stripe);
    }

    const topBand = new THREE.Mesh(new THREE.BoxGeometry(width + 4, 3, 0.5), redAccentMat);
    topBand.position.set(0, wallH - 2, totalDepth + 2.3);
    group.add(topBand);

    const bottomBand = new THREE.Mesh(new THREE.BoxGeometry(width + 4, 2, 0.5), redAccentMat);
    bottomBand.position.set(0, 2, totalDepth + 2.3);
    group.add(bottomBand);

    // Roof
    const roofOverhang = 15;
    const roofY = totalHeight + 12;

    const roofGeo = new THREE.BoxGeometry(width + 6, 0.8, totalDepth + roofOverhang);
    const roof = new THREE.Mesh(roofGeo, matRoof);
    roof.position.set(0, roofY, (totalDepth + roofOverhang) / 2 - roofOverhang + 5);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // Roof underside
    const roofUndersideMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.4 });
    const roofUnderside = new THREE.Mesh(
        new THREE.PlaneGeometry(width + 4, totalDepth + roofOverhang - 2),
        roofUndersideMat
    );
    roofUnderside.rotation.x = Math.PI / 2;
    roofUnderside.position.set(0, roofY - 0.5, (totalDepth + roofOverhang) / 2 - roofOverhang + 5);
    group.add(roofUnderside);

    // Trusses
    const numTruss = standType === 'north' ? 8 : 6;
    const trussHeight = 8;

    for (let i = 0; i <= numTruss; i++) {
        const x = -width / 2 + (width / numTruss) * i;

        const columnH = roofY - totalHeight + 5;
        const column = new THREE.Mesh(new THREE.BoxGeometry(1.2, columnH, 1.2), matTruss);
        column.position.set(x, roofY - columnH / 2, totalDepth + 1);
        column.castShadow = true;
        group.add(column);

        const beamLen = totalDepth + roofOverhang - 3;
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, beamLen), matTruss);
        beam.position.set(x, roofY + 1, beamLen / 2 - 2);
        group.add(beam);

        const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, beamLen * 0.7), matTruss);
        topBeam.position.set(x, roofY + trussHeight, beamLen * 0.35 - 2);
        group.add(topBeam);

        const diagLen = Math.sqrt(trussHeight * trussHeight + (beamLen * 0.35) * (beamLen * 0.35));
        const diagAngle = Math.atan2(trussHeight, beamLen * 0.35);

        const diagFront = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, diagLen), matTruss);
        diagFront.position.set(x, roofY + trussHeight / 2, beamLen * 0.35 / 2 - 2);
        diagFront.rotation.x = -diagAngle;
        group.add(diagFront);

        const diagRear = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, diagLen * 0.8), matTruss);
        diagRear.position.set(x, roofY + trussHeight / 2, beamLen * 0.5);
        diagRear.rotation.x = diagAngle * 0.7;
        group.add(diagRear);

        for (let v = 1; v < 5; v++) {
            const vz = (beamLen * 0.6 / 5) * v - 2;
            const strut = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, trussHeight * (1 - v * 0.15), 0.3),
                matTruss
            );
            strut.position.set(x, roofY + trussHeight * (1 - v * 0.15) / 2, vz);
            group.add(strut);
        }
    }

    // Cross bracing
    for (let i = 0; i < numTruss; i++) {
        const x1 = -width / 2 + (width / numTruss) * i;
        const x2 = -width / 2 + (width / numTruss) * (i + 1);
        const midX = (x1 + x2) / 2;
        const spanWidth = x2 - x1;

        const tiePeak = new THREE.Mesh(new THREE.BoxGeometry(spanWidth, 0.4, 0.4), matTruss);
        tiePeak.position.set(midX, roofY + trussHeight - 1, 10);
        group.add(tiePeak);

        const tieBase = new THREE.Mesh(new THREE.BoxGeometry(spanWidth, 0.4, 0.4), matTruss);
        tieBase.position.set(midX, roofY + 1, 10);
        group.add(tieBase);
    }

    return { mesh: group, depth: totalDepth, height: totalHeight };
}
