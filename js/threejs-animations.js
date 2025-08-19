// Three.js Background Animation for BAAZARX Hero Section
class ThreeJSBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.createScene();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        const container = document.getElementById('threejs-bg');
        if (!container) return;

        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.offsetWidth / container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);
    }

    createParticles() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        // Blue color palette for particles
        const colorPalette = [
            new THREE.Color(0x3b82f6), // Primary blue
            new THREE.Color(0x1d4ed8), // Secondary blue
            new THREE.Color(0x0ea5e9), // Sky blue
            new THREE.Color(0x6366f1), // Indigo
            new THREE.Color(0x8b5cf6)  // Purple
        ];

        for (let i = 0; i < particleCount; i++) {
            // Positions
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // Colors
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Sizes
            sizes[i] = Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Particle material with vertex colors
        const material = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        // Create particle system
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Add some geometric shapes
        this.createGeometricShapes();
    }

    createGeometricShapes() {
        // Create floating geometric shapes
        const shapes = [];
        
        // Wireframe cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
        const cubeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x3b82f6, 
            transparent: true, 
            opacity: 0.3 
        });
        const cube = new THREE.LineSegments(cubeEdges, cubeMaterial);
        cube.position.set(-3, 2, -2);
        shapes.push(cube);
        this.scene.add(cube);

        // Wireframe sphere
        const sphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
        const sphereMaterial = new THREE.LineBasicMaterial({ 
            color: 0x1d4ed8, 
            transparent: true, 
            opacity: 0.3 
        });
        const sphere = new THREE.LineSegments(sphereEdges, sphereMaterial);
        sphere.position.set(3, -2, -1);
        shapes.push(sphere);
        this.scene.add(sphere);

        // Wireframe octahedron
        const octaGeometry = new THREE.OctahedronGeometry(0.6);
        const octaEdges = new THREE.EdgesGeometry(octaGeometry);
        const octaMaterial = new THREE.LineBasicMaterial({ 
            color: 0x0ea5e9, 
            transparent: true, 
            opacity: 0.3 
        });
        const octahedron = new THREE.LineSegments(octaEdges, octaMaterial);
        octahedron.position.set(0, 3, -3);
        shapes.push(octahedron);
        this.scene.add(octahedron);

        this.shapes = shapes;
    }

    animate() {
        if (!this.scene || !this.camera || !this.renderer) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Rotate particles
        if (this.particles) {
            this.particles.rotation.x = time * 0.1;
            this.particles.rotation.y = time * 0.15;
        }

        // Animate geometric shapes
        if (this.shapes) {
            this.shapes.forEach((shape, index) => {
                shape.rotation.x = time * (0.5 + index * 0.1);
                shape.rotation.y = time * (0.3 + index * 0.1);
                shape.position.y += Math.sin(time + index) * 0.002;
            });
        }

        // Floating animation for particles
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
            positions[i] += Math.cos(time + positions[i + 1]) * 0.0005;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse interaction
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    onMouseMove(event) {
        if (!this.particles) return;

        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Subtle particle reaction to mouse movement
        this.particles.rotation.x += mouseY * 0.001;
        this.particles.rotation.y += mouseX * 0.001;
    }

    onWindowResize() {
        const container = document.getElementById('threejs-bg');
        if (!container || !this.camera || !this.renderer) return;

        this.camera.aspect = container.offsetWidth / container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            const container = document.getElementById('threejs-bg');
            if (container && this.renderer.domElement) {
                container.removeChild(this.renderer.domElement);
            }
        }
    }
}

// Initialize Three.js background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure the hero section is rendered
    setTimeout(() => {
        const heroContainer = document.getElementById('threejs-bg');
        if (heroContainer && typeof THREE !== 'undefined') {
            window.threeJSBackground = new ThreeJSBackground();
        } else {
            console.warn('Three.js container not found or Three.js library not loaded');
        }
    }, 100);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.threeJSBackground) {
        window.threeJSBackground.destroy();
    }
});