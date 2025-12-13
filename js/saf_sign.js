// SIR ALEX FERGUSON STAND SIGNAGE 
// Text on the fascia where Theatre of Dreams sign used to be
const safGroup = new THREE.Group();

const loader = new THREE.FontLoader();
loader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    const textMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Gold
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0x332200,
        emissiveIntensity: 0.2
    });

    const textGeo = new THREE.TextGeometry('SIR ALEX FERGUSON STAND', {
        font: font,
        size: 2.5,
        height: 0.5,
        curveSegments: 12
    });
    textGeo.computeBoundingBox();
    textGeo.center();

    const textMesh = new THREE.Mesh(textGeo, textMat);
    safGroup.add(textMesh);
});

// Position on North Stand fascia (where the other sign was removed from)
safGroup.position.set(0, 12, -FIELD_WIDTH / 2 - 6);
safGroup.rotation.y = Math.PI; // Face the pitch
stadium.add(safGroup);
