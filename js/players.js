// ==========================================
// PLAYERS - Player and Ball Creation
// ==========================================

function createPlayers() {
    const group = new THREE.Group();

    function player(x, z, color, isGK) {
        const p = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.6 });
        const shortMat = new THREE.MeshStandardMaterial({ color: isGK ? 0x111111 : 0xffffff, roughness: 0.5 });

        // Body
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), bodyMat);
        body.position.y = 1.1;
        body.castShadow = true;
        p.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat);
        head.position.y = 1.65;
        head.castShadow = true;
        p.add(head);

        // Shorts
        const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.3, 8), shortMat);
        shorts.position.y = 0.55;
        p.add(shorts);

        // Legs
        [-0.08, 0.08].forEach(off => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), skinMat);
            leg.position.set(off, 0.22, 0);
            p.add(leg);
        });

        p.position.set(x, 0, z);
        return p;
    }

    // Team 1 - Red
    const t1 = [[-48, 0, true], [-35, -20], [-35, -7], [-35, 7], [-35, 20], [-18, -24], [-18, -8], [-18, 8], [-18, 24], [-5, -10], [-5, 10]];
    t1.forEach(([x, z, gk]) => group.add(player(x, z, 0xcc2222, gk)));

    // Team 2 - Blue
    const t2 = [[48, 0, true], [35, -20], [35, -7], [35, 7], [35, 20], [18, -24], [18, -8], [18, 8], [18, 24], [5, -10], [5, 10]];
    t2.forEach(([x, z, gk]) => group.add(player(x, z, 0x2244cc, gk)));

    // Referee
    group.add(player(0, 22, 0x111111, false));

    scene.add(group);
}

function createBall() {
    const ballGeo = new THREE.IcosahedronGeometry(0.22, 2);
    const ballMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.05
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 0.22, 0);
    ball.castShadow = true;
    scene.add(ball);
}
