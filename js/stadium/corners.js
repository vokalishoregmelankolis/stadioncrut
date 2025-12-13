// STADIUM CORNERS - Old Trafford Style Curved Corner Sections

function createStadiumCorner(xSign, zSign) {
    if (Math.abs(xSign) !== 1 || Math.abs(zSign) !== 1) return new THREE.Group();

    const group = new THREE.Group();
    const seatCollector = { red: [] }; // Only red seats in corners

    // Parameters
    const rowHeight = 0.6;
    const rowDepth = 0.8;
    const numSegments = 10;
    const numRows = 22;
    const innerRadius = 3;  // Front row radius

    let startAngle;
    if (xSign > 0 && zSign > 0) { // SE
        startAngle = Math.PI;
    } else if (xSign < 0 && zSign > 0) { // SW
        startAngle = Math.PI * 1.5;
    } else if (xSign < 0 && zSign < 0) { // NW
        startAngle = 0;  // 0°
    } else { // NE
        startAngle = Math.PI / 2;
    }

    const arcAngle = Math.PI / 2;  // 90 degrees sweep
    const dummy = new THREE.Object3D(); // Helper for matrix calculation

    // Create tiered seating along the arc
    for (let row = 0; row < numRows; row++) {
        const y = row * rowHeight;
        const radius = innerRadius + row * rowDepth;

        for (let seg = 0; seg < numSegments; seg++) {
            const t = (seg + 0.5) / numSegments;
            const angle = startAngle + t * arcAngle;
            const segWidth = Math.max(0.8, radius * (arcAngle / numSegments) * 0.85);

            // Concrete step
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(segWidth, rowHeight, rowDepth),
                stadiumMaterials.concrete
            );
            step.position.set(
                Math.cos(angle) * radius,
                y + rowHeight / 2,
                Math.sin(angle) * radius
            );
            step.rotation.y = -angle;
            step.receiveShadow = true;

            // Optimize: Add to walkable list
            if (window.walkableObjects) window.walkableObjects.push(step);

            group.add(step);

            // Red seat (Instance Data)
            dummy.position.set(
                Math.cos(angle) * radius,
                y + rowHeight + 0.06,
                Math.sin(angle) * radius
            );
            dummy.rotation.set(0, -angle, 0);
            dummy.scale.set(segWidth * 0.9, 1, 1);
            dummy.updateMatrix();
            addSeatInstance(seatCollector, 'red', dummy.matrix.clone());
        }
    }

    // Finalize Instanced Seats for Corner
    finalizeInstancedSeats(group, seatCollector, 600, rowDepth);

    // Back wall
    const wallHeight = numRows * rowHeight + 8;
    const outerRadius = innerRadius + numRows * rowDepth + 2;

    for (let seg = 0; seg < numSegments; seg++) {
        const t = (seg + 0.5) / numSegments;
        const angle = startAngle + t * arcAngle;
        const segWidth = outerRadius * (arcAngle / numSegments);

        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(segWidth, wallHeight, 2),
            stadiumMaterials.brick
        );
        wall.position.set(
            Math.cos(angle) * outerRadius,
            wallHeight / 2,
            Math.sin(angle) * outerRadius
        );
        wall.rotation.y = -angle;
        wall.castShadow = true;
        group.add(wall);
    }

    // Roof
    const roofY = wallHeight + 2;
    const roofGeo = new THREE.RingGeometry(innerRadius - 2, outerRadius + 5, numSegments, 1, startAngle, arcAngle);
    const roof = new THREE.Mesh(roofGeo, stadiumMaterials.roof);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = roofY;
    group.add(roof);

    // Position at the OUTER corner of the stadium
    const standDepth = 35;
    const cornerX = (FIELD_LENGTH / 2 + 4 + standDepth) * xSign;
    const cornerZ = (FIELD_WIDTH / 2 + 4 + standDepth) * zSign;

    group.position.set(cornerX, 0, cornerZ);

    return group;
}
