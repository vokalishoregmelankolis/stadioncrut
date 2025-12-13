// GOALS - Football Goals with Nets

function createGoals() {
    const goalW = 7.32, goalH = 2.44, goalD = 2.5;
    const postR = 0.08;

    const postMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4
    });
    const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });

    function createGoal(xPos) {
        const goal = new THREE.Group();
        const dir = xPos > 0 ? 1 : -1;

        // Front posts (left and right)
        const postGeo = new THREE.CylinderGeometry(postR, postR, goalH, 12);

        const postLeft = new THREE.Mesh(postGeo, postMat);
        postLeft.position.set(0, goalH / 2, -goalW / 2);
        postLeft.castShadow = true;
        goal.add(postLeft);

        const postRight = new THREE.Mesh(postGeo, postMat);
        postRight.position.set(0, goalH / 2, goalW / 2);
        postRight.castShadow = true;
        goal.add(postRight);

        // Crossbar
        const crossGeo = new THREE.CylinderGeometry(postR, postR, goalW + postR * 2, 12);
        const crossbar = new THREE.Mesh(crossGeo, postMat);
        crossbar.rotation.x = Math.PI / 2;
        crossbar.position.set(0, goalH, 0);
        crossbar.castShadow = true;
        goal.add(crossbar);

        // Back support posts
        const backPostLeft = new THREE.Mesh(postGeo, postMat);
        backPostLeft.position.set(dir * goalD, goalH / 2, -goalW / 2);
        goal.add(backPostLeft);

        const backPostRight = new THREE.Mesh(postGeo, postMat);
        backPostRight.position.set(dir * goalD, goalH / 2, goalW / 2);
        goal.add(backPostRight);

        // Back crossbar
        const backCrossbar = new THREE.Mesh(crossGeo, postMat);
        backCrossbar.rotation.x = Math.PI / 2;
        backCrossbar.position.set(dir * goalD, goalH, 0);
        goal.add(backCrossbar);

        // === NETS ===
        // Back net (vertical)
        const backNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalW, goalH, 20, 12),
            netMat
        );
        backNet.position.set(dir * goalD, goalH / 2, 0);
        backNet.rotation.y = Math.PI / 2;
        goal.add(backNet);

        // Top net (horizontal)
        const topNet = new THREE.Mesh(
            new THREE.PlaneGeometry(goalD, goalW, 8, 20),
            netMat
        );
        topNet.position.set(dir * goalD / 2, goalH, 0);
        topNet.rotation.x = Math.PI / 2;
        goal.add(topNet);

        // Side nets (left and right triangular panels)
        const sideNetGeo = new THREE.PlaneGeometry(goalD, goalH, 8, 12);

        const sideNetLeft = new THREE.Mesh(sideNetGeo, netMat);
        sideNetLeft.position.set(dir * goalD / 2, goalH / 2, -goalW / 2);
        goal.add(sideNetLeft);

        const sideNetRight = new THREE.Mesh(sideNetGeo, netMat);
        sideNetRight.position.set(dir * goalD / 2, goalH / 2, goalW / 2);
        goal.add(sideNetRight);

        // Bottom bar (ground level, back)
        const bottomBarGeo = new THREE.CylinderGeometry(postR * 0.5, postR * 0.5, goalW, 8);
        const bottomBar = new THREE.Mesh(bottomBarGeo, postMat);
        bottomBar.rotation.x = Math.PI / 2;
        bottomBar.position.set(dir * goalD, postR, 0);
        goal.add(bottomBar);

        goal.position.x = xPos;
        return goal;
    }

    scene.add(createGoal(FIELD_LENGTH / 2));
    scene.add(createGoal(-FIELD_LENGTH / 2));
}
