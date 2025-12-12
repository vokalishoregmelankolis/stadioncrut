// ==========================================
// ENVIRONMENT - Sky and Ground
// ==========================================

function createEnvironment() {
    // Ground outside stadium
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4a7a4a,
        roughness: 0.9,
        metalness: 0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sky gradient dome (Overcast cloudy day)
    const skyGeo = new THREE.SphereGeometry(450, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x6688aa) }, // Grey-blue clouds
            bottomColor: { value: new THREE.Color(0x99aabb) }, // Light grey horizon
            offset: { value: 20 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}
