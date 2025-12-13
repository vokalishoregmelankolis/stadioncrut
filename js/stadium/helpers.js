// STADIUM HELPERS - Utility Functions for InstancedMesh

// Collects seat transformation matrices for later InstancedMesh creation
function addSeatInstance(collector, type, matrix) {
    if (!collector[type]) collector[type] = [];
    collector[type].push(matrix);
}

// Creates InstancedMesh objects from collected seat data
function finalizeInstancedSeats(group, collector, countEstimate, rowDepth) {
    // Base Geometry for a Seat (Unit size, scaled by instance)
    const seatGeo = new THREE.BoxGeometry(1, 0.12, rowDepth * 0.4);

    // 1. RED SEATS
    if (collector.red && collector.red.length > 0) {
        const mesh = new THREE.InstancedMesh(seatGeo, stadiumMaterials.seatRed, collector.red.length);
        collector.red.forEach((mat, i) => mesh.setMatrixAt(i, mat));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = false; // Performance: Seats don't cast shadows
        mesh.receiveShadow = true;
        group.add(mesh);
    }

    // 2. WHITE SEATS
    if (collector.white && collector.white.length > 0) {
        const mesh = new THREE.InstancedMesh(seatGeo, stadiumMaterials.seatWhite, collector.white.length);
        collector.white.forEach((mat, i) => mesh.setMatrixAt(i, mat));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = false; // Performance: Seats don't cast shadows
        mesh.receiveShadow = true;
        group.add(mesh);
    }
}
