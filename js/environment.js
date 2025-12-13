// External Environment (Roads, Buildings, etc.)
function createEnvironment() {
    const environment = new THREE.Group();
    if (typeof scene !== 'undefined') scene.add(environment);

    // Configuration
    const groundSize = 3000;

    // Boundary for Stadium Area (Stadium + Fountain + Parking)
    const bounds = {
        minX: -300, maxX: 550, // Extended East for Parking
        minZ: -350, maxZ: 350
    };

    // 1. GROUND
    function createGround() {
        const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x555555, // Darker grey asphalt/concrete color
            roughness: 0.9,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1; // Slightly below y=0
        ground.receiveShadow = true;
        environment.add(ground);

        // Optimize: Add to walkable list
        if (window.walkableObjects) window.walkableObjects.push(ground);
    }

    // 2. PERIMETER FENCE
    function createFence() {
        const fenceGroup = new THREE.Group();
        const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
        const meshMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.5,
            metalness: 0.5,
            wireframe: true // Simple mesh look
        });

        const height = 10;
        const postInterval = 20;

        // Helper to create fence segment
        const createSegment = (x1, z1, x2, z2) => {
            const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
            const angle = Math.atan2(z2 - z1, x2 - x1);

            // Wireframe mesh panel
            const panel = new THREE.Mesh(
                new THREE.BoxGeometry(dist, height, 0.5),
                meshMat
            );
            panel.position.set((x1 + x2) / 2, height / 2, (z1 + z2) / 2);
            panel.rotation.y = -angle;
            fenceGroup.add(panel);

            // Posts
            const numPosts = Math.floor(dist / postInterval);
            for (let i = 0; i <= numPosts; i++) {
                const px = x1 + (x2 - x1) * (i / numPosts);
                const pz = z1 + (z2 - z1) * (i / numPosts);

                const post = new THREE.Mesh(
                    new THREE.BoxGeometry(1, height + 2, 1),
                    postMat
                );
                post.position.set(px, height / 2, pz);
                fenceGroup.add(post);
            }
        };

        // Draw Rectangular Fence
        createSegment(bounds.minX, bounds.minZ, bounds.maxX, bounds.minZ); // North
        // East (Split for Gate)
        const gateWidth = 60;
        createSegment(bounds.maxX, bounds.minZ, bounds.maxX, -gateWidth / 2); // East North-Part
        createSegment(bounds.maxX, gateWidth / 2, bounds.maxX, bounds.maxZ);  // East South-Part

        createSegment(bounds.maxX, bounds.maxZ, bounds.minX, bounds.maxZ); // South
        createSegment(bounds.minX, bounds.maxZ, bounds.minX, bounds.minZ); // West

        environment.add(fenceGroup);
    }

    // 3. ROADS (Outside the fence + Parking Access)
    function createRoads() {
        const roadGroup = new THREE.Group();
        const roadWidth = 40;
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

        const offset = 30; // Distance from fence

        // Ring Road Coords
        const rMinX = bounds.minX - offset;
        const rMaxX = bounds.maxX + offset;
        const rMinZ = bounds.minZ - offset;
        const rMaxZ = bounds.maxZ + offset;

        const createRoadSegment = (x, z, w, d) => {
            const road = new THREE.Mesh(
                new THREE.BoxGeometry(w, 0.5, d),
                roadMat
            );
            road.position.set(x, 0.1, z);
            roadGroup.add(road);
        };

        // North Road
        createRoadSegment((rMinX + rMaxX) / 2, rMinZ, rMaxX - rMinX + roadWidth, roadWidth);
        // South Road
        createRoadSegment((rMinX + rMaxX) / 2, rMaxZ, rMaxX - rMinX + roadWidth, roadWidth);
        // East Road (External)
        createRoadSegment(rMaxX, (rMinZ + rMaxZ) / 2, roadWidth, rMaxZ - rMinZ + roadWidth);
        // West Road
        createRoadSegment(rMinX, (rMinZ + rMaxZ) / 2, roadWidth, rMaxZ - rMinZ + roadWidth);

        // ACCESS ROAD (Gate to Parking) from External Road
        // From rMaxX (approx 580) to Parking X (450)
        const accessLen = (rMaxX) - 450 + roadWidth / 2;
        createRoadSegment((rMaxX + 450) / 2, 0, 150, roadWidth); // Adjusted length to fit the gap

        environment.add(roadGroup);
    }

    // 4. PARKING LOT (East Side - Inside Fence)
    function createParkingLot() {
        const parkingGroup = new THREE.Group();
        const lotWidth = 150;
        const lotDepth = 300;
        const px = 450; // Inside the fence (maxX is 550)
        const pz = 0;   // Position Z

        // Markings directly on ground (levitating slightly)
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow lines
        const spotWidth = 12;
        const spotDepth = 20;

        for (let x = px - lotWidth / 2 + 5; x < px + lotWidth / 2 - 5; x += spotWidth) {
            for (let z = pz - lotDepth / 2 + 10; z < pz + lotDepth / 2 - 10; z += spotDepth + 5) {
                // Line
                const line = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, spotDepth), lineMat);
                line.position.set(x, 0.1, z);
                parkingGroup.add(line);

                // Add random cars (50% chance)
                if (Math.random() > 0.5) {
                    createCar(x + spotWidth / 2, z, parkingGroup);
                }
            }
        }
        environment.add(parkingGroup);
    }

    // Keyword: CAR GENERATOR
    function createCar(x, z, parentGroup) {
        const carGroup = new THREE.Group();
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffffff, 0x000000, 0xcccccc];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const carMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.6 });
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.1 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 8), carMat);
        body.position.y = 1.5;
        carGroup.add(body);

        // Cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 5), windowMat);
        cabin.position.set(0, 2.8, 0);
        carGroup.add(cabin);

        // Wheels
        [[-2, -2.5], [2, -2.5], [-2, 2.5], [2, 2.5]].forEach(pos => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos[0], 0.8, pos[1]);
            carGroup.add(wheel);
        });

        carGroup.position.set(x, 0, z);
        // Random rotation (facing forward or backward in spot)
        carGroup.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;

        parentGroup.add(carGroup);
    }

    // 5. BUILDINGS (City Lights - Toned Down)
    function createBuildings() {
        const buildGroup = new THREE.Group();
        const buildMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });

        // Emissive light for windows (Subtler)
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0xffffee, // Warmer white
            emissiveIntensity: 0.3, // Reduced from 0.5
            roughness: 0.2
        });

        // Place blocks of buildings further out
        const positions = [
            { x: -500, z: -100, w: 150, d: 500 },
            { x: 650, z: 200, w: 150, d: 300 },
        ];

        positions.forEach(block => {
            for (let i = 0; i < 20; i++) {
                const w = 20 + Math.random() * 30;
                const h = 40 + Math.random() * 100;
                const d = 20 + Math.random() * 30;

                const bx = block.x + (Math.random() - 0.5) * block.w;
                const bz = block.z + (Math.random() - 0.5) * block.d;

                const building = new THREE.Group();
                const core = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildMat);
                core.position.y = h / 2;
                core.castShadow = false; // Optimize: Background buildings don't cast dynamic shadows
                core.receiveShadow = true;
                building.add(core);

                const winCount = Math.floor(h / 5);
                for (let j = 0; j < winCount; j++) {
                    if (Math.random() > 0.4) { // Fewer lit windows
                        const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 2, d + 0.2), glassMat);
                        band.position.y = 5 + j * 5;
                        band.castShadow = false;
                        building.add(band);
                    }
                }

                building.position.set(bx, 0, bz);
                buildGroup.add(building);
            }
        });
        environment.add(buildGroup);
    }

    // 6. HOUSES (Residential Area - South Side)
    function createHouses() {
        const houseGroup = new THREE.Group();
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.8 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x331111, roughness: 0.8 });
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffaa00, emissiveIntensity: 0.4 }); // Reduced from 0.8

        const startZ = 450;
        const startX = -400;

        for (let x = startX; x < 400; x += 60) {
            for (let z = startZ; z < startZ + 300; z += 60) {
                if (Math.random() > 0.8) continue;

                const house = new THREE.Group();

                const w = 25, h = 15, d = 20;
                const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
                base.position.y = h / 2;
                base.castShadow = false; // Optimize
                base.receiveShadow = true;
                house.add(base);

                const win = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), windowMat);
                win.position.set(0, h / 2, d / 2 + 0.1);
                house.add(win);

                const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 10, 4), roofMat);
                roof.position.y = h + 5;
                roof.rotation.y = Math.PI / 4;
                roof.castShadow = false; // Optimize
                roof.receiveShadow = true;
                house.add(roof);

                house.position.set(x, 0, z);
                houseGroup.add(house);
            }
        }
        environment.add(houseGroup);
    }

    // 7. FOUNTAIN
    function createFountain() {
        const fountainGroup = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 });
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x44aaff, transparent: true, opacity: 0.8, emissive: 0x002244, emissiveIntensity: 0.2 }); // Reduced from 0.5

        // Pools
        const bottomPool = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 2, 32), stoneMat);
        bottomPool.position.y = 1;
        fountainGroup.add(bottomPool);

        const waterLevel = new THREE.Mesh(new THREE.CylinderGeometry(19, 19, 0.5, 32), waterMat);
        waterLevel.position.y = 2;
        fountainGroup.add(waterLevel);

        const midPool = new THREE.Mesh(new THREE.CylinderGeometry(10, 8, 3, 16), stoneMat);
        midPool.position.y = 2.5;
        fountainGroup.add(midPool);

        const topPool = new THREE.Mesh(new THREE.CylinderGeometry(5, 2, 6, 16), stoneMat);
        topPool.position.y = 5;
        fountainGroup.add(topPool);

        // Water Drops
        const dropGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        for (let i = 0; i < 30; i++) {
            const drop = new THREE.Mesh(dropGeo, waterMat);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 8;
            drop.position.set(Math.cos(angle) * radius, 5 + Math.random() * 5, Math.sin(angle) * radius);
            fountainGroup.add(drop);
        }

        // Fountain Light (Water glow)
        const fLight = new THREE.PointLight(0x00ffff, 1, 30);
        fLight.position.set(0, 5, 0);
        fountainGroup.add(fLight);

        // Positioned further out in front of the stadium (East side), on the ground
        fountainGroup.position.set(220, 0, 0);
        environment.add(fountainGroup);
    }

    // 8. STREETLIGHTS (Along Road)
    function createStreetlights() {
        const lightsGroup = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

        const offset = 30;
        const rMinX = bounds.minX - offset;
        const rMaxX = bounds.maxX + offset;
        const rMinZ = bounds.minZ - offset;
        const rMaxZ = bounds.maxZ + offset;

        const positions = [];
        // Generate positions along the ring road
        for (let x = rMinX; x <= rMaxX; x += 80) {
            positions.push({ x: x, z: rMinZ - 25 }); // North side
            positions.push({ x: x, z: rMaxZ + 25 }); // South side
        }
        for (let z = rMinZ; z <= rMaxZ; z += 80) {
            positions.push({ x: rMaxX + 25, z: z }); // East side
            positions.push({ x: rMinX - 25, z: z }); // West side
        }

        positions.forEach(pos => {
            const group = new THREE.Group();

            // Pole
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 20), poleMat);
            pole.position.y = 10;
            group.add(pole);

            // Arm
            const arm = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 0.5), poleMat);
            arm.position.set(2, 19, 0);
            group.add(arm);

            // Lightbulb
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(1), bulbMat);
            bulb.position.set(4, 18.5, 0);
            group.add(bulb);

            // Actual Light
            const spot = new THREE.SpotLight(0xffffcc, 100);
            spot.position.set(4, 18, 0);
            spot.target.position.set(4, 0, 0);
            spot.angle = 0.8;
            spot.penumbra = 0.5;
            scene.add(spot.target);
            group.add(spot);

            group.position.set(pos.x, 0, pos.z);
            // Rotate to face road if needed (simplified here)
            lightsGroup.add(group);
        });

        environment.add(lightsGroup);
    }

    // 9. SKY (Stars & Moon)
    function createSky() {
        // Starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const posArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 4000; // Large spread
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars); // Add directly to scene to avoid group transforms if any

        // Moon Sprite
        const moonGeo = new THREE.SphereGeometry(30, 32, 32);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(-300, 600, -300); // Matches directional light source
        scene.add(moon);
    }

    // Execute generation
    createGround();
    createFence();
    createRoads();
    createParkingLot();
    createBuildings();
    createHouses();
    createFountain();
    createStreetlights(); // NEW
    createSky(); // NEW

    return environment;
}
