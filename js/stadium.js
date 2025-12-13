// STADIUM STRUCTURE - REALISTIC OLD TRAFFORD
// ============================================
// Modular structure:
//   - js/stadium/materials.js  - PBR materials
//   - js/stadium/helpers.js    - Helper functions
//   - js/stadium/corners.js    - Corner quadrant fill
//   - js/stadium/tiers.js      - Tier/Stand builders
//   - js/stadium/towers.js     - Corner tower functions
//   - js/stadium/entrance.js   - External facades & main entrance
//   - js/stadium/branding.js   - Advertising, clocks, signs, flags

function createStadiumStructure() {
    const stadium = new THREE.Group();

    // Distances where stands START (Front row)
    const distN = 68 / 2 + 4;
    const distS = 68 / 2 + 4;
    const distW = 105 / 2 + 4;
    const distE = 105 / 2 + 4;

    // PBR Materials (from materials.js)
    const materials = {
        matConcrete: stadiumMaterials.concrete,
        matBrick: stadiumMaterials.brick,
        matRedWall: stadiumMaterials.redWall,
        matRoof: stadiumMaterials.roof,
        matTruss: stadiumMaterials.truss
    };

    // --- Create 4 Stands (Old Trafford Layout) ---
    const standDepth = 40;
    const fullWidth = FIELD_LENGTH + standDepth * 2;

    // 1. NORTH (Sir Alex Ferguson Stand) - Tallest, 3 Tiers
    const north = createStand(fullWidth, [
        { rows: 12, depth: 12, pattern: 'UNITED' },
        { rows: 8, depth: 8 },
        { rows: 14, depth: 16, pattern: 'MANCHESTER' }
    ], 'north', materials);
    north.mesh.rotation.y = Math.PI;
    north.mesh.position.set(0, 0, -distN - 5);
    stadium.add(north.mesh);

    // 2. SOUTH (Bobby Charlton Stand) - 2 Tiers
    const south = createStand(fullWidth, [
        { rows: 15, depth: 15 },
        { rows: 12, depth: 14 }
    ], 'south', materials);
    south.mesh.rotation.y = 0;
    south.mesh.position.set(0, 0, distS + 5);
    stadium.add(south.mesh);

    // 3. WEST (Stretford End) - 2 Tiers
    const fullWidthEW = FIELD_WIDTH + standDepth * 2;
    const west = createStand(fullWidthEW, [
        { rows: 14, depth: 16, pattern: 'END' },
        { rows: 12, depth: 14, pattern: 'STRETFORD' }
    ], 'west', materials);
    west.mesh.rotation.y = -Math.PI / 2;
    west.mesh.position.set(-distW - 5, 0, 0);
    stadium.add(west.mesh);

    // 4. EAST (Scoreboard End) - 2 Tiers
    const east = createStand(fullWidthEW, [
        { rows: 14, depth: 14 },
        { rows: 14, depth: 16 }
    ], 'east', materials);
    east.mesh.rotation.y = Math.PI / 2;
    east.mesh.position.set(distE + 5, 0, 0);
    stadium.add(east.mesh);

    // --- Corner Towers (from towers.js) ---
    const cornerOffset = standDepth + 6;
    stadium.add(createMUCornerTower(FIELD_LENGTH / 2 + cornerOffset, -FIELD_WIDTH / 2 - cornerOffset));
    stadium.add(createMUCornerTower(-FIELD_LENGTH / 2 - cornerOffset, -FIELD_WIDTH / 2 - cornerOffset));
    stadium.add(createMUCornerTower(FIELD_LENGTH / 2 + cornerOffset, FIELD_WIDTH / 2 + cornerOffset));
    stadium.add(createMUCornerTower(-FIELD_LENGTH / 2 - cornerOffset, FIELD_WIDTH / 2 + cornerOffset));

    // --- External Facades (from entrance.js) ---
    // North facade
    const northFacade = createExteriorFacade(fullWidth + 10, 40, 2, true);
    northFacade.position.set(0, 0, -distN - standDepth - 8);
    stadium.add(northFacade);

    // South facade
    const southFacade = createExteriorFacade(fullWidth - 20, 32, 2, false);
    southFacade.position.set(0, 0, distS + standDepth + 8);
    southFacade.rotation.y = Math.PI;
    stadium.add(southFacade);

    // West facade
    const westFacade = createExteriorFacade(fullWidthEW - 10, 35, 2, false);
    westFacade.rotation.y = Math.PI / 2;
    westFacade.position.set(-distW - standDepth - 8, 0, 0);
    stadium.add(westFacade);

    // --- Main Entrance (from entrance.js) ---
    const mainEntrance = createMainEntrance();
    mainEntrance.rotation.y = Math.PI / 2;
    mainEntrance.position.set(distE + 45, 0, 0);
    stadium.add(mainEntrance);

    // --- Branding Elements (from branding.js) ---
    addStadiumBranding(stadium, FIELD_LENGTH, FIELD_WIDTH);

    // Add stadium to scene
    scene.add(stadium);
}
