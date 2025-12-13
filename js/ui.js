// UI - HUD, Minimap, and Control Buttons

function updateHUD(groundY = 0) {
    const pos = camera.position;
    document.getElementById('hud-position').textContent = `X: ${pos.x.toFixed(0)} | Z: ${pos.z.toFixed(0)} | Ground: ${groundY.toFixed(1)}`;
    document.getElementById('hud-mode').textContent = isRunning ? '🏃 Running' : '🚶 Walking';
}

function initMinimap() {
    const c = document.getElementById('minimap-canvas');
    minimapCtx = c.getContext('2d');
    drawMinimapBg();
}

function drawMinimapBg() {
    const c = document.getElementById('minimap-canvas');
    minimapCtx.fillStyle = '#2a5a2a';
    minimapCtx.fillRect(0, 0, c.width, c.height);
    minimapCtx.strokeStyle = '#fff';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(15, 15, c.width - 30, c.height - 30);
    minimapCtx.beginPath();
    minimapCtx.moveTo(c.width / 2, 15);
    minimapCtx.lineTo(c.width / 2, c.height - 15);
    minimapCtx.stroke();
    minimapCtx.beginPath();
    minimapCtx.arc(c.width / 2, c.height / 2, 10, 0, Math.PI * 2);
    minimapCtx.stroke();
}

function updateMinimap() {
    if (!minimapCtx) return;
    const c = document.getElementById('minimap-canvas');
    const dot = document.getElementById('player-dot');
    const pos = camera.position;
    const mapX = ((pos.x / 100) * (c.width / 2 - 15)) + c.width / 2;
    const mapY = ((pos.z / 100) * (c.height / 2 - 15)) + c.height / 2;
    dot.style.left = (10 + mapX) + 'px';
    dot.style.top = (10 + mapY) + 'px';
}

function setupControlButtons() {
    document.getElementById('btn-top-view').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(0, 200, 1), new THREE.Vector3(0, 0, 0));
    });
    document.getElementById('btn-side-view').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(0, 50, 150), new THREE.Vector3(0, 0, 0));
    });
    document.getElementById('btn-goal-view').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(80, 15, 0), new THREE.Vector3(-20, 2, 0));
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
        animateCamera(new THREE.Vector3(0, 100, 150), new THREE.Vector3(0, 0, 0));
    });
}

function animateCamera(targetPos, targetLook) {
    const startPos = camera.position.clone();
    const startLook = orbitControls.target.clone();
    const startTime = performance.now();
    const dur = 1500;

    function update() {
        const t = Math.min((performance.now() - startTime) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(startPos, targetPos, ease);
        orbitControls.target.lerpVectors(startLook, targetLook, ease);
        orbitControls.update();
        if (t < 1) requestAnimationFrame(update);
    }
    update();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const delta = (now - prevTime) / 1000;
    prevTime = now;
    updateWalking(delta);
    if (currentMode === 'orbit') orbitControls.update();
    renderer.render(scene, camera);
}
