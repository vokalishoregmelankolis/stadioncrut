// ==========================================
// CONTROLS - Mode Selection and Walking
// ==========================================

function setupModeSelector() {
    const orbitBtn = document.getElementById('btn-orbit-mode');
    const walkBtn = document.getElementById('btn-walk-mode');
    const blocker = document.getElementById('blocker');
    const walkInstr = document.getElementById('walk-instructions');
    const controls = document.getElementById('controls');
    const hud = document.getElementById('hud');
    const minimap = document.getElementById('minimap');

    // ESC key to toggle mode selector visibility
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (currentMode === 'orbit') {
                // Toggle blocker visibility in orbit mode
                blocker.classList.toggle('hidden');
            }
            // In walk mode, ESC naturally unlocks pointer lock
        }
    });

    orbitBtn.addEventListener('click', () => {
        orbitBtn.classList.add('active');
        walkBtn.classList.remove('active');
        walkInstr.classList.add('hidden');
        currentMode = 'orbit';
        blocker.classList.add('hidden'); // Hide after selecting orbit
        controls.classList.remove('hidden');
        hud.classList.add('hidden');
        minimap.classList.add('hidden');
        orbitControls.enabled = true;
        camera.position.set(0, 100, 150);
        camera.lookAt(0, 0, 0);
    });

    walkBtn.addEventListener('click', () => {
        walkBtn.classList.add('active');
        orbitBtn.classList.remove('active');
        walkInstr.classList.remove('hidden');
        currentMode = 'walk';
        controls.classList.add('hidden');
    });

    walkInstr.addEventListener('click', () => {
        if (currentMode === 'walk') pointerLockControls.lock();
    });

    pointerLockControls.addEventListener('lock', () => {
        blocker.classList.add('hidden');
        hud.classList.remove('hidden');
        minimap.classList.remove('hidden');
        orbitControls.enabled = false;
        if (!document.getElementById('crosshair')) {
            const ch = document.createElement('div');
            ch.id = 'crosshair';
            document.body.appendChild(ch);
        }
        camera.position.set(0, playerHeight, 30);
    });

    pointerLockControls.addEventListener('unlock', () => {
        if (currentMode === 'walk') {
            blocker.classList.remove('hidden');
            hud.classList.add('hidden');
            minimap.classList.add('hidden');
        }
        const ch = document.getElementById('crosshair');
        if (ch) ch.remove();
    });
}

function setupWalkingControls() {
    document.addEventListener('keydown', e => {
        if (currentMode !== 'walk' || !pointerLockControls.isLocked) return;
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': moveForward = true; break;
            case 'KeyS': case 'ArrowDown': moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft': moveLeft = true; break;
            case 'KeyD': case 'ArrowRight': moveRight = true; break;
            case 'Space': if (canJump) { velocity.y = 8; canJump = false; } break;
            case 'ShiftLeft': case 'ShiftRight': isRunning = true; break;
        }
    });

    document.addEventListener('keyup', e => {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': moveForward = false; break;
            case 'KeyS': case 'ArrowDown': moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft': moveLeft = false; break;
            case 'KeyD': case 'ArrowRight': moveRight = false; break;
            case 'ShiftLeft': case 'ShiftRight': isRunning = false; break;
        }
    });
}

function updateWalking(delta) {
    if (currentMode !== 'walk' || !pointerLockControls.isLocked) return;

    velocity.x -= velocity.x * 10 * delta;
    velocity.z -= velocity.z * 10 * delta;
    velocity.y -= 25 * delta; // Gravity

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const speed = isRunning ? 50 : 25;
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    pointerLockControls.moveRight(-velocity.x * delta);
    pointerLockControls.moveForward(-velocity.z * delta);
    pointerLockControls.getObject().position.y += velocity.y * delta;

    const pos = pointerLockControls.getObject().position;

    // Raycast downward to find ground (cast from slightly above current position)
    groundRaycaster.set(new THREE.Vector3(pos.x, pos.y + 0.5, pos.z), downDirection);
    groundRaycaster.far = 100;
    const intersects = groundRaycaster.intersectObjects(scene.children, true);

    let groundY = 0; // Default ground level
    if (intersects.length > 0) {
        // Find the first solid ground (filter out thin objects like lines, nets)
        for (let i = 0; i < intersects.length; i++) {
            const hit = intersects[i];
            // Skip very thin objects (wireframe, lines) and transparent objects
            if (hit.object.material && hit.object.material.wireframe) continue;
            if (hit.object.material && hit.object.material.transparent && hit.object.material.opacity < 0.5) continue;

            if (hit.distance < 60) {
                groundY = pos.y + 0.5 - hit.distance; // Adjust for ray start offset
                break;
            }
        }
    }

    // Smooth ground height to prevent jitter (lerp towards detected ground)
    lastGroundY = lastGroundY + (groundY - lastGroundY) * 0.3;

    // Check if on ground (with small tolerance)
    const groundLevel = lastGroundY + playerHeight;
    if (pos.y <= groundLevel + 0.1) {
        velocity.y = 0;
        pos.y = groundLevel;
        canJump = true;
    }

    // Minimum height (don't fall through world)
    if (pos.y < playerHeight) {
        pos.y = playerHeight;
        velocity.y = 0;
        canJump = true;
    }

    // Boundary limits
    const bound = 120;
    pos.x = Math.max(-bound, Math.min(bound, pos.x));
    pos.z = Math.max(-bound, Math.min(bound, pos.z));

    updateHUD(lastGroundY);
    updateMinimap();
}
