// FIELD - Pitch and Field Markings

function createField() {
    // Create procedural grass texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Stripe pattern
    const stripeW = 64;
    for (let i = 0; i < canvas.width; i += stripeW * 2) {
        ctx.fillStyle = '#3a9d4a';
        ctx.fillRect(i, 0, stripeW, canvas.height);
        ctx.fillStyle = '#2d8a3d';
        ctx.fillRect(i + stripeW, 0, stripeW, canvas.height);
    }

    // Add grass noise
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 12;
        imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
        imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
        imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const grassTex = new THREE.CanvasTexture(canvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(8, 5);
    grassTex.anisotropy = 16;

    const fieldGeo = new THREE.PlaneGeometry(FIELD_LENGTH, FIELD_WIDTH);
    const fieldMat = new THREE.MeshStandardMaterial({
        map: grassTex,
        roughness: 0.85,
        metalness: 0,
        envMapIntensity: 0.3
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    scene.add(field);

    if (window.walkableObjects) window.walkableObjects.push(field);

    // Surrounding grass area
    const surroundGeo = new THREE.PlaneGeometry(FIELD_LENGTH + 12, FIELD_WIDTH + 8);
    const surroundMat = new THREE.MeshStandardMaterial({
        color: 0x2a7a3a,
        roughness: 0.9
    });
    const surround = new THREE.Mesh(surroundGeo, surroundMat);
    surround.rotation.x = -Math.PI / 2;
    surround.position.y = -0.02;
    surround.receiveShadow = true;
    scene.add(surround);

    if (window.walkableObjects) window.walkableObjects.push(surround);
}

function createFieldMarkings() {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineH = 0.03;
    const lineW = 0.12;

    const halfL = FIELD_LENGTH / 2;
    const halfW = FIELD_WIDTH / 2;

    function line(len, w, x, z, rotY = 0) {
        const geo = new THREE.PlaneGeometry(len, w);
        const mesh = new THREE.Mesh(geo, lineMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = rotY;
        mesh.position.set(x, lineH, z);
        return mesh;
    }

    const group = new THREE.Group();

    // Boundary
    group.add(line(FIELD_LENGTH, lineW, 0, halfW));
    group.add(line(FIELD_LENGTH, lineW, 0, -halfW));
    group.add(line(lineW, FIELD_WIDTH, halfL, 0));
    group.add(line(lineW, FIELD_WIDTH, -halfL, 0));

    // Center
    group.add(line(lineW, FIELD_WIDTH, 0, 0));

    // Center circle
    const circleGeo = new THREE.RingGeometry(9.15 - 0.06, 9.15 + 0.06, 64);
    const circle = new THREE.Mesh(circleGeo, lineMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = lineH;
    group.add(circle);

    // Center spot
    const spotGeo = new THREE.CircleGeometry(0.25, 24);
    const spot = new THREE.Mesh(spotGeo, lineMat);
    spot.rotation.x = -Math.PI / 2;
    spot.position.y = lineH;
    group.add(spot);

    // Penalty areas
    const penW = 40.3, penD = 16.5, goalW = 18.32, goalD = 5.5;

    [1, -1].forEach(side => {
        const px = side * halfL;

        // Penalty box vertical line
        group.add(line(lineW, penW, px - side * penD, 0));
        // Penalty box horizontal lines
        group.add(line(penD + lineW / 2, lineW, px - side * penD / 2, penW / 2));
        group.add(line(penD + lineW / 2, lineW, px - side * penD / 2, -penW / 2));

        // Goal area
        group.add(line(lineW, goalW, px - side * goalD, 0));
        group.add(line(goalD + lineW / 2, lineW, px - side * goalD / 2, goalW / 2));
        group.add(line(goalD + lineW / 2, lineW, px - side * goalD / 2, -goalW / 2));

        // Penalty spot
        const ps = spot.clone();
        ps.position.set(px - side * 11, lineH, 0);
        group.add(ps);

        // Penalty arc - curved line outside penalty area
        // Arc center is at penalty spot (11m from goal line)
        // Arc radius is 9.15m
        // Penalty area edge is at 16.5m from goal line
        // Distance from penalty spot to penalty area edge: 16.5 - 11 = 5.5m
        // Arc intersects penalty area edge at angle: acos(5.5 / 9.15)
        const distToPenEdge = penD - 11;  // 5.5m
        const arcAngle = Math.acos(distToPenEdge / 9.15);  // angle where arc meets penalty box

        // Arc from -arcAngle to +arcAngle (the part outside penalty area)
        const arcGeo = new THREE.RingGeometry(9.15 - 0.06, 9.15 + 0.06, 48, 1,
            side === 1 ? (Math.PI - arcAngle) : (-arcAngle),
            arcAngle * 2);
        const arc = new THREE.Mesh(arcGeo, lineMat);
        arc.rotation.x = -Math.PI / 2;
        arc.position.set(px - side * 11, lineH, 0);
        group.add(arc);
    });

    scene.add(group);
}
