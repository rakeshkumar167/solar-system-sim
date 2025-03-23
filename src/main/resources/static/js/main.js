import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let planets = [];
let labels = [];

// Planet data with realistic proportions (Sun radius = 100)
// Update planet sizes by multiplying radius by 10
const planetData = [
    { name: 'Mercury', radius: 0.0353 * 10, orbitRadius: 80, rotationPeriod: 58.6, color: 0xFFD700 },
    { name: 'Venus', radius: 0.0868 * 10, orbitRadius: 120, rotationPeriod: 243, color: 0xFFA500 },
    { name: 'Earth', radius: 0.0916 * 10, orbitRadius: 160, rotationPeriod: 1, color: 0x00BFFF },
    { name: 'Mars', radius: 0.0488 * 10, orbitRadius: 200, rotationPeriod: 1.03, color: 0xFF4500 },
    { name: 'Jupiter', radius: 1.0004 * 10, orbitRadius: 280, rotationPeriod: 0.41, color: 0xFFA07A },
    { name: 'Saturn', radius: 0.8145 * 10, orbitRadius: 360, rotationPeriod: 0.44, color: 0xFFE4B5 },
    { name: 'Uranus', radius: 0.3560 * 10, orbitRadius: 440, rotationPeriod: 0.72, color: 0x00CED1 },
    { name: 'Neptune', radius: 0.3460 * 10, orbitRadius: 520, rotationPeriod: 0.67, color: 0x1E90FF }
];

function createLabel(name) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = name;
    div.style.color = '#ffffff';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    div.style.padding = '6px 12px';
    div.style.borderRadius = '4px';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.fontSize = '16px';
    div.style.fontWeight = 'bold';
    div.style.position = 'absolute';
    div.style.zIndex = '1000';
    div.style.pointerEvents = 'none';
    document.body.appendChild(div);
    return div;
}

function updateLabelPosition(label, position) {
    const x = (position.x * .5 + .5) * window.innerWidth;
    const y = (-(position.y * .5) + .5) * window.innerHeight;
    
    label.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    // Make labels always visible by removing the z-check
    label.style.display = 'block';
}

// Update camera far value in init function
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 100;
    camera.position.y = 50;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 300;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 2);
    scene.add(pointLight);
    
    // Create sun
    // Update sun with realistic relative size
    const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 2
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // Create sun label
    labels.push(createLabel('Sun'));

    // Create planets
    planetData.forEach(data => {
        const planetGeometry = new THREE.SphereGeometry(data.radius * 0.8, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({ 
            color: data.color,
            shininess: 30,
            specular: 0x444444,
            emissive: data.color,
            emissiveIntensity: 0.2
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Create orbit (removed nested forEach)
        const orbitGeometry = new THREE.RingGeometry(data.orbitRadius, data.orbitRadius + 0.5, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        
        planet.position.x = data.orbitRadius;
        planets.push({
            mesh: planet,
            orbitRadius: data.orbitRadius,
            rotationSpeed: 1 / data.rotationPeriod,
            orbitSpeed: 1 / Math.sqrt(data.orbitRadius)
        });
        scene.add(planet);
        
        // Create label for planet
        labels.push(createLabel(data.name));
    });

    // Update camera position for better view
    camera.position.set(150, 100, 150);
    
    // Update camera settings for larger scale
    camera.position.set(600, 400, 600);
    controls.minDistance = 100;
    controls.maxDistance = 2000;
    
    animate();
}

// Remove createStars function and its call in init()
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Update controls
    controls.update();
    
    // Rotate and orbit planets
    planets.forEach((planet, index) => {
        const time = Date.now() * 0.001;
        planet.mesh.rotation.y += 0.01 * planet.rotationSpeed;
        
        // Orbital movement
        planet.mesh.position.x = Math.cos(time * planet.orbitSpeed) * planet.orbitRadius;
        planet.mesh.position.z = Math.sin(time * planet.orbitSpeed) * planet.orbitRadius;
    });
    
    updateLabels();
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

// Add this function after updateLabelPosition function
function updateLabels() {
    const tempVector = new THREE.Vector3();
    
    // Update Sun label
    const sunScreenPosition = tempVector.copy(new THREE.Vector3()).project(camera);
    updateLabelPosition(labels[0], sunScreenPosition);

    // Update planet labels
    planets.forEach((planet, index) => {
        const screenPosition = tempVector.copy(planet.mesh.position).project(camera);
        updateLabelPosition(labels[index + 1], screenPosition);
    });
}