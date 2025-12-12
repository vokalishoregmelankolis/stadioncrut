// ==========================================
// CONFIG - Global Variables and Constants
// ==========================================

// Global scene objects
let scene, camera, renderer;
let orbitControls, pointerLockControls;
let currentMode = 'orbit';

// Walking state
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = true, isRunning = false;
let playerHeight = 1.8;
let prevTime = performance.now();

// Stadium dimensions
const FIELD_LENGTH = 105;
const FIELD_WIDTH = 68;

// Raycaster for ground detection
const groundRaycaster = new THREE.Raycaster();
const downDirection = new THREE.Vector3(0, -1, 0);
let lastGroundY = 0;

// Minimap context
let minimapCtx;
