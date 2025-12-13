// STADIUM MATERIALS - PBR Material Definitions for Old Trafford
const stadiumMaterials = {
    // Concrete - rough, slightly reflective
    concrete: new THREE.MeshStandardMaterial({
        color: 0x909090,
        roughness: 0.95,
        metalness: 0.0
    }),
    // Brick exterior - Old Trafford dark red-brown brick
    brick: new THREE.MeshStandardMaterial({
        color: 0x6B2D2D,
        roughness: 0.85,
        metalness: 0.0
    }),
    // Dark red accent walls
    redWall: new THREE.MeshStandardMaterial({
        color: 0x6B0000,
        roughness: 0.6,
        metalness: 0.0
    }),
    // Roof - WHITE panels like Old Trafford
    roof: new THREE.MeshStandardMaterial({
        color: 0xf8f8f8,
        roughness: 0.25,
        metalness: 0.5,
        side: THREE.DoubleSide
    }),
    // Steel trusses - white painted steel
    truss: new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.2,
        metalness: 0.8
    }),
    // Seats - Manchester United red (more vibrant)
    seatRed: new THREE.MeshStandardMaterial({
        color: 0xDA020E,
        roughness: 0.35,
        metalness: 0.0,
        emissive: 0x330000,
        emissiveIntensity: 0.15
    }),
    // White seats for text
    seatWhite: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.0
    }),
    // Yellow/Gold seats for accents
    seatGold: new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.4,
        metalness: 0.1
    }),
    // Premium gold accent (for MU branding)
    gold: new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.25,
        metalness: 0.6,
        emissive: 0x332200,
        emissiveIntensity: 0.2
    }),
    // Black accent for contrast
    black: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.1
    })
};
