import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimMode, TargetContainer, CameraView } from '../../types';

interface LabSceneProps {
  mode: SimMode;
  isPouring: boolean;
  tiltAngle: number; // 0 to 45
  targetContainer: TargetContainer;
  cameraView: CameraView;
  onPourComplete: () => void;
  waterLevels: { tumbler: number; bowl: number; bottle: number };
  onUpdateWaterLevels: (levels: { tumbler: number; bowl: number; bottle: number }) => void;
  showLabels: boolean;
}

export const LabScene: React.FC<LabSceneProps> = ({
  mode,
  isPouring,
  tiltAngle,
  targetContainer,
  cameraView,
  onPourComplete,
  waterLevels,
  onUpdateWaterLevels,
  showLabels,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep state across renders without re-initializing Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 3D Objects references
  const pitcherGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);

  // Tab 1 water meshes
  const tumblerWaterMeshRef = useRef<THREE.Mesh | null>(null);
  const bowlWaterMeshRef = useRef<THREE.Mesh | null>(null);
  const bottleWaterMeshRef = useRef<THREE.Mesh | null>(null);

  // Tab 2 objects
  const plankGroupRef = useRef<THREE.Group | null>(null);
  const trayWaterMeshRef = useRef<THREE.Mesh | null>(null);
  const ripplesGroupRef = useRef<THREE.Group | null>(null);
  const flowParticlesRef = useRef<THREE.Points | null>(null);

  // Simulation state refs
  const pouringRef = useRef(isPouring);
  pouringRef.current = isPouring;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const tiltAngleRef = useRef(tiltAngle);
  tiltAngleRef.current = tiltAngle;

  const waterLevelsRef = useRef(waterLevels);
  waterLevelsRef.current = waterLevels;

  const targetContainerRef = useRef(targetContainer);
  targetContainerRef.current = targetContainer;

  // Particle positions & velocities array
  const particleCount = 200;
  const particlePositionsRef = useRef<Float32Array>(new Float32Array(particleCount * 3));
  const particleVelocitiesRef = useRef<THREE.Vector3[]>([]);

  // Flow particles for Tab 2
  const flowCount = 180;
  const flowPositionsRef = useRef<Float32Array>(new Float32Array(flowCount * 3));
  const flowLifeRef = useRef<Float32Array>(new Float32Array(flowCount));

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Deep slate background
    scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go far under table
    controls.minDistance = 3;
    controls.maxDistance = 16;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    dirLight.position.set(5, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 0.8, 15);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // 6. Build Environment (Lab Table & Room)
    createLabEnvironment(scene);

    // 7. Build Tab 1 Objects (Glass Containers & Pitcher)
    const tab1Group = new THREE.Group();
    tab1Group.name = 'tab1Group';
    createGlassContainers(tab1Group);
    createPitcher(tab1Group);
    scene.add(tab1Group);

    // 8. Build Tab 2 Objects (Plank & Tray)
    const tab2Group = new THREE.Group();
    tab2Group.name = 'tab2Group';
    createFlowExperiment(tab2Group);
    tab2Group.visible = false;
    scene.add(tab2Group);

    // 9. Particles setup
    createPourParticles(scene);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update Controls
      controls.update();

      // Handle Pouring Animations
      if (modeRef.current === 'shape') {
        updateShapePouring(delta, elapsed);
      } else {
        updateFlowPouring(delta, elapsed);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --- Environment Construction ---
  const createLabEnvironment = (scene: THREE.Scene) => {
    // Tabletop
    const tableGeo = new THREE.BoxGeometry(9.5, 0.3, 5.5);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Modern dark slate lab desk
      roughness: 0.3,
      metalness: 0.2,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0, 0);
    table.receiveShadow = true;
    scene.add(table);

    // Table Rim / Bezel
    const rimGeo = new THREE.BoxGeometry(9.7, 0.1, 5.7);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(0, -0.15, 0);
    scene.add(rim);

    // Subtle Desk Grid Lines
    const grid = new THREE.GridHelper(9, 18, 0x38bdf8, 0x334155);
    grid.position.set(0, 0.16, 0);
    scene.add(grid);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 3);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const legPositions = [
      [-4.4, -1.65, -2.4],
      [4.4, -1.65, -2.4],
      [-4.4, -1.65, 2.4],
      [4.4, -1.65, 2.4],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });
  };

  // --- Tab 1: Glass Containers ---
  const createGlassContainers = (group: THREE.Group) => {
    // Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.2,
      specularIntensity: 1.2,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.1,
      transmission: 0.6,
      opacity: 0.88,
      transparent: true,
      roughness: 0.1,
      ior: 1.333,
      side: THREE.DoubleSide,
    });

    // --- Container 1: Tumbler (Cốc) at X = -2.8 ---
    const tumblerGroup = new THREE.Group();
    tumblerGroup.position.set(-2.8, 0.16, 0);

    // Glass shell
    const tumblerShellGeo = new THREE.CylinderGeometry(0.7, 0.6, 1.8, 32, 1, true);
    const tumblerShell = new THREE.Mesh(tumblerShellGeo, glassMat);
    tumblerShell.position.y = 0.9;
    tumblerShell.castShadow = true;
    tumblerGroup.add(tumblerShell);

    const tumblerBottomGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.08, 32);
    const tumblerBottom = new THREE.Mesh(tumblerBottomGeo, glassMat);
    tumblerBottom.position.y = 0.04;
    tumblerGroup.add(tumblerBottom);

    // Water Mesh inside Tumbler
    const tumblerWaterGeo = new THREE.CylinderGeometry(0.68, 0.58, 1.7, 32);
    const tumblerWater = new THREE.Mesh(tumblerWaterGeo, waterMat);
    tumblerWater.position.y = 0.85;
    tumblerWater.scale.set(1, 0.001, 1); // Start empty
    tumblerWaterMeshRef.current = tumblerWater;
    tumblerGroup.add(tumblerWater);

    group.add(tumblerGroup);

    // --- Container 2: Bowl (Bát) at X = 0 ---
    const bowlGroup = new THREE.Group();
    bowlGroup.position.set(0, 0.16, 0);

    // Glass Bowl Shell (Inverted hemisphere cut)
    const bowlShellGeo = new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const bowlShell = new THREE.Mesh(bowlShellGeo, glassMat);
    bowlShell.rotation.x = Math.PI; // Flip upside down to form bowl
    bowlShell.position.y = 0.95;
    bowlShell.castShadow = true;
    bowlGroup.add(bowlShell);

    const bowlBaseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.08, 32);
    const bowlBase = new THREE.Mesh(bowlBaseGeo, glassMat);
    bowlBase.position.y = 0.04;
    bowlGroup.add(bowlBase);

    // Water Mesh inside Bowl (hemisphere slightly scaled down)
    const bowlWaterGeo = new THREE.SphereGeometry(0.96, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const bowlWater = new THREE.Mesh(bowlWaterGeo, waterMat);
    bowlWater.rotation.x = Math.PI;
    bowlWater.position.y = 0.93;
    bowlWater.scale.set(1, 0.001, 1);
    bowlWaterMeshRef.current = bowlWater;
    bowlGroup.add(bowlWater);

    group.add(bowlGroup);

    // --- Container 3: Bottle (Chai) at X = 2.8 ---
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(2.8, 0.16, 0);

    // Bottle body (Cylinder + Cone neck + Cylinder lip)
    const bottleBodyGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.3, 32, 1, true);
    const bottleBody = new THREE.Mesh(bottleBodyGeo, glassMat);
    bottleBody.position.y = 0.65;
    bottleBody.castShadow = true;
    bottleGroup.add(bottleBody);

    const bottleShoulderGeo = new THREE.ConeGeometry(0.65, 0.6, 32, 1, true);
    const bottleShoulder = new THREE.Mesh(bottleShoulderGeo, glassMat);
    bottleShoulder.position.y = 1.6;
    bottleGroup.add(bottleShoulder);

    const bottleNeckGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.6, 32, 1, true);
    const bottleNeck = new THREE.Mesh(bottleNeckGeo, glassMat);
    bottleNeck.position.y = 2.0;
    bottleGroup.add(bottleNeck);

    const bottleBaseGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 32);
    const bottleBase = new THREE.Mesh(bottleBaseGeo, glassMat);
    bottleBase.position.y = 0.04;
    bottleGroup.add(bottleBase);

    // Water Mesh inside Bottle
    const bottleWaterGeo = new THREE.CylinderGeometry(0.62, 0.62, 1.25, 32);
    const bottleWater = new THREE.Mesh(bottleWaterGeo, waterMat);
    bottleWater.position.y = 0.62;
    bottleWater.scale.set(1, 0.001, 1);
    bottleWaterMeshRef.current = bottleWater;
    bottleGroup.add(bottleWater);

    group.add(bottleGroup);
  };

  // --- Water Pitcher (Bình nước) ---
  const createPitcher = (group: THREE.Group) => {
    const pitcherGroup = new THREE.Group();
    pitcherGroup.position.set(-2.8, 2.8, 0.8);

    // Pitcher main body
    const pitcherGeo = new THREE.CylinderGeometry(0.45, 0.35, 1.1, 24);
    const pitcherMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const pitcherBody = new THREE.Mesh(pitcherGeo, pitcherMat);
    pitcherBody.castShadow = true;
    pitcherGroup.add(pitcherBody);

    // Handle
    const handleGeo = new THREE.TorusGeometry(0.35, 0.05, 12, 24, Math.PI);
    const handle = new THREE.Mesh(handleGeo, pitcherMat);
    handle.rotation.z = -Math.PI / 2;
    handle.position.set(-0.4, 0, 0);
    pitcherGroup.add(handle);

    // Spout
    const spoutGeo = new THREE.ConeGeometry(0.15, 0.3, 12);
    const spout = new THREE.Mesh(spoutGeo, pitcherMat);
    spout.rotation.z = -Math.PI / 3;
    spout.position.set(0.4, 0.45, 0);
    pitcherGroup.add(spout);

    // Water content inside pitcher
    const innerWaterGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.8, 24);
    const innerWaterMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.9 });
    const innerWater = new THREE.Mesh(innerWaterGeo, innerWaterMat);
    innerWater.position.y = -0.1;
    pitcherGroup.add(innerWater);

    pitcherGroupRef.current = pitcherGroup;
    group.add(pitcherGroup);
  };

  // --- Pour Particles ---
  const createPourParticles = (scene: THREE.Scene) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // hide initially
      positions[i * 3 + 2] = 0;
      particleVelocitiesRef.current.push(new THREE.Vector3(0, 0, 0));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Canvas particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(147, 197, 253, 0.95)');
      grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.7)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const pMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, pMaterial);
    particleSystemRef.current = particles;
    scene.add(particles);
  };

  // --- Tab 2: Flow Experiment (Plank & Tray) ---
  const createFlowExperiment = (group: THREE.Group) => {
    // 1. Bottom Plastic Tray (Khay nhựa)
    const trayGroup = new THREE.Group();
    trayGroup.position.set(0, 0.16, 0);

    const trayMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
    });

    const trayBaseGeo = new THREE.BoxGeometry(4.2, 0.12, 2.6);
    const trayBase = new THREE.Mesh(trayBaseGeo, trayMat);
    trayBase.position.y = 0.06;
    trayBase.receiveShadow = true;
    trayGroup.add(trayBase);

    // Tray rims
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.25, 0.08), rimMat);
    r1.position.set(0, 0.15, 1.26);
    const r2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.25, 0.08), rimMat);
    r2.position.set(0, 0.15, -1.26);
    const r3 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 2.6), rimMat);
    r3.position.set(-2.06, 0.15, 0);
    const r4 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 2.6), rimMat);
    r4.position.set(2.06, 0.15, 0);

    trayGroup.add(r1, r2, r3, r4);

    // Water accumulation pool in tray floor
    const trayWaterGeo = new THREE.PlaneGeometry(4.0, 2.4);
    const trayWaterMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0,
      roughness: 0.1,
      metalness: 0.1,
    });
    const trayWater = new THREE.Mesh(trayWaterGeo, trayWaterMat);
    trayWater.rotation.x = -Math.PI / 2;
    trayWater.position.y = 0.13;
    trayWaterMeshRef.current = trayWater;
    trayGroup.add(trayWater);

    // Ripples Group inside tray
    const ripplesGroup = new THREE.Group();
    ripplesGroup.position.set(0, 0.14, 0);
    ripplesGroupRef.current = ripplesGroup;
    trayGroup.add(ripplesGroup);

    group.add(trayGroup);

    // 2. Wooden Plank (Tấm gỗ) with Hinge
    const plankGroup = new THREE.Group();
    plankGroup.position.set(-1.2, 0.22, 0); // hinge pivot point at left

    const plankGeo = new THREE.BoxGeometry(3.0, 0.1, 1.8);
    // Plank texture procedural color
    const plankMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Rich amber wood
      roughness: 0.6,
      metalness: 0.05,
    });
    const plankMesh = new THREE.Mesh(plankGeo, plankMat);
    plankMesh.position.set(1.5, 0.05, 0); // offset so pivot is at left hinge
    plankMesh.castShadow = true;
    plankMesh.receiveShadow = true;
    plankGroup.add(plankMesh);

    // Hinge indicator
    const hingeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.9, 16);
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    const hinge = new THREE.Mesh(hingeGeo, hingeMat);
    hinge.rotation.x = Math.PI / 2;
    hinge.position.set(0, 0.05, 0);
    plankGroup.add(hinge);

    plankGroupRef.current = plankGroup;
    group.add(plankGroup);

    // 3. Setup Flow Particles for Tab 2
    const flowGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount; i++) {
      posArr[i * 3] = 0;
      posArr[i * 3 + 1] = -100;
      posArr[i * 3 + 2] = 0;
      flowLifeRef.current[i] = 0;
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const flowMat = new THREE.PointsMaterial({
      size: 0.16,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const flowPts = new THREE.Points(flowGeo, flowMat);
    flowParticlesRef.current = flowPts;
    group.add(flowPts);
  };

  // --- Animation Updates: Tab 1 (Shape) ---
  const updateShapePouring = (delta: number, elapsed: number) => {
    if (!pitcherGroupRef.current) return;

    // Pitcher target positions depending on target container
    let targetX = -2.8;
    if (targetContainerRef.current === 'bowl') targetX = 0;
    if (targetContainerRef.current === 'bottle') targetX = 2.8;

    // If pouring is inactive, reset pitcher smoothly
    if (!pouringRef.current) {
      pitcherGroupRef.current.position.x += (targetX - pitcherGroupRef.current.position.x) * 0.1;
      pitcherGroupRef.current.position.y += (2.8 - pitcherGroupRef.current.position.y) * 0.1;
      pitcherGroupRef.current.rotation.z += (0 - pitcherGroupRef.current.rotation.z) * 0.1;

      // Hide pour particles
      if (particleSystemRef.current) {
        const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] = -100;
        }
        particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }
      return;
    }

    // Move Pitcher over target container and tilt down!
    const targetPitcherX = targetX - 0.7;
    const targetPitcherY = 2.5;
    const targetTilt = -Math.PI / 4; // tilt 45 deg

    pitcherGroupRef.current.position.x += (targetPitcherX - pitcherGroupRef.current.position.x) * 0.08;
    pitcherGroupRef.current.position.y += (targetPitcherY - pitcherGroupRef.current.position.y) * 0.08;
    pitcherGroupRef.current.rotation.z += (targetTilt - pitcherGroupRef.current.rotation.z) * 0.08;

    // Emit Stream Particles from Spout
    const spoutPos = new THREE.Vector3(0.4, 0.45, 0);
    spoutPos.applyMatrix4(pitcherGroupRef.current.matrixWorld);

    if (particleSystemRef.current) {
      const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        if (positions[i * 3 + 1] < 0.25 || positions[i * 3 + 1] === -100) {
          // Reset particle to spout
          positions[i * 3] = spoutPos.x + (Math.random() - 0.5) * 0.08;
          positions[i * 3 + 1] = spoutPos.y;
          positions[i * 3 + 2] = spoutPos.z + (Math.random() - 0.5) * 0.08;
          particleVelocitiesRef.current[i] = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            -3 - Math.random() * 2,
            (Math.random() - 0.5) * 0.1
          );
        } else {
          // Fall down with gravity
          positions[i * 3] += particleVelocitiesRef.current[i].x * delta;
          positions[i * 3 + 1] += particleVelocitiesRef.current[i].y * delta;
          positions[i * 3 + 2] += particleVelocitiesRef.current[i].z * delta;
        }
      }
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Fill water inside active container smoothly
    const current = { ...waterLevelsRef.current };
    const fillRate = delta * 0.35; // fills in ~3 seconds

    let isDone = false;
    if (targetContainerRef.current === 'tumbler' || targetContainerRef.current === 'all') {
      if (current.tumbler < 0.85) {
        current.tumbler = Math.min(0.85, current.tumbler + fillRate);
      } else if (targetContainerRef.current === 'all' && current.bowl < 0.85) {
        targetContainerRef.current = 'bowl';
      } else if (targetContainerRef.current === 'all' && current.bottle < 0.85) {
        targetContainerRef.current = 'bottle';
      } else {
        isDone = true;
      }
    }

    if (targetContainerRef.current === 'bowl') {
      if (current.bowl < 0.85) {
        current.bowl = Math.min(0.85, current.bowl + fillRate);
      } else if (targetContainerRef.current === 'all' && current.bottle < 0.85) {
        targetContainerRef.current = 'bottle';
      } else {
        isDone = true;
      }
    }

    if (targetContainerRef.current === 'bottle') {
      if (current.bottle < 0.85) {
        current.bottle = Math.min(0.85, current.bottle + fillRate);
      } else {
        isDone = true;
      }
    }

    onUpdateWaterLevels(current);

    // Apply scale to water meshes
    if (tumblerWaterMeshRef.current) {
      const lvl = current.tumbler;
      tumblerWaterMeshRef.current.scale.y = Math.max(0.001, lvl);
      tumblerWaterMeshRef.current.position.y = 0.04 + (1.7 * lvl) / 2;
    }

    if (bowlWaterMeshRef.current) {
      const lvl = current.bowl;
      bowlWaterMeshRef.current.scale.y = Math.max(0.001, lvl);
      bowlWaterMeshRef.current.position.y = 0.95 - (1 - lvl) * 0.45;
    }

    if (bottleWaterMeshRef.current) {
      const lvl = current.bottle;
      bottleWaterMeshRef.current.scale.y = Math.max(0.001, lvl);
      bottleWaterMeshRef.current.position.y = 0.04 + (1.25 * lvl) / 2;
    }

    if (isDone && pouringRef.current) {
      onPourComplete();
    }
  };

  // --- Animation Updates: Tab 2 (Flow) ---
  const updateFlowPouring = (delta: number, elapsed: number) => {
    // 1. Update Plank Tilt Angle in 3D scene smoothly
    if (plankGroupRef.current) {
      const targetRad = THREE.MathUtils.degToRad(tiltAngleRef.current);
      // Plank rotates around Z axis hinge
      plankGroupRef.current.rotation.z += (targetRad - plankGroupRef.current.rotation.z) * 0.12;
    }

    if (!pitcherGroupRef.current) return;

    // Position pitcher over top end of plank
    const angleRad = plankGroupRef.current ? plankGroupRef.current.rotation.z : 0;
    const topPlankX = -1.2 + Math.cos(angleRad) * 2.6;
    const topPlankY = 0.22 + Math.sin(angleRad) * 2.6 + 1.2;

    pitcherGroupRef.current.position.x += (topPlankX - pitcherGroupRef.current.position.x) * 0.1;
    pitcherGroupRef.current.position.y += (topPlankY - pitcherGroupRef.current.position.y) * 0.1;

    if (!pouringRef.current) {
      pitcherGroupRef.current.rotation.z += (0 - pitcherGroupRef.current.rotation.z) * 0.1;
      // Hide flow particles
      if (flowParticlesRef.current) {
        const pos = flowParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < flowCount; i++) pos[i * 3 + 1] = -100;
        flowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      return;
    }

    // Pitcher pouring tilt
    pitcherGroupRef.current.rotation.z += (-Math.PI / 3 - pitcherGroupRef.current.rotation.z) * 0.1;

    // Simulate Particles along plank incline down into tray
    if (flowParticlesRef.current) {
      const pos = flowParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const slopeFactor = Math.sin(angleRad); // 0 when flat, high when steep

      for (let i = 0; i < flowCount; i++) {
        flowLifeRef.current[i] += delta;

        if (flowLifeRef.current[i] > 1.2 || pos[i * 3 + 1] === -100) {
          // Spawn particle at pitcher spout
          pos[i * 3] = topPlankX + (Math.random() - 0.5) * 0.15;
          pos[i * 3 + 1] = topPlankY - 0.2;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
          flowLifeRef.current[i] = 0;
        } else {
          // If hit plank surface
          if (pos[i * 3 + 1] > 0.25) {
            // Falling to plank
            pos[i * 3 + 1] -= delta * 3.5;
          } else {
            // Sliding on plank / tray surface
            if (angleRad < 0.05) {
              // Flat (0°): Spreads in circular radial direction!
              const angle = Math.random() * Math.PI * 2;
              pos[i * 3] += Math.cos(angle) * delta * 0.6;
              pos[i * 3 + 2] += Math.sin(angle) * delta * 0.6;
            } else {
              // Tilted (>0°): Slides down to lower end (left side X = -1.2)!
              pos[i * 3] -= delta * (1.5 + slopeFactor * 4.5); // Faster when steeper!
              pos[i * 3 + 2] += (Math.random() - 0.5) * delta * 0.8; // Loang nhẹ ra 2 bên
            }
          }
        }
      }
      flowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Accumulate Water Pool on Tray
    if (trayWaterMeshRef.current) {
      const mat = trayWaterMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.min(0.7, mat.opacity + delta * 0.15);
    }

    // Generate Concentric Water Ripples (Vòng sóng loang ra) on Tray Floor
    if (ripplesGroupRef.current && Math.random() < 0.3) {
      const ringGeo = new THREE.RingGeometry(0.05, 0.1, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;

      // Position ripples at bottom of plank
      ring.position.set(-1.1 + (Math.random() - 0.5) * 0.4, 0.01, (Math.random() - 0.5) * 1.2);
      ripplesGroupRef.current.add(ring);
    }

    // Animate and shrink/expand ripples
    if (ripplesGroupRef.current) {
      for (let i = ripplesGroupRef.current.children.length - 1; i >= 0; i--) {
        const ring = ripplesGroupRef.current.children[i] as THREE.Mesh;
        const mat = ring.material as THREE.MeshBasicMaterial;
        ring.scale.x += delta * 2.5;
        ring.scale.y += delta * 2.5;
        mat.opacity -= delta * 1.2;

        if (mat.opacity <= 0) {
          ripplesGroupRef.current.remove(ring);
          ring.geometry.dispose();
          mat.dispose();
        }
      }
    }
  };

  // --- Handle Tab Switch (Mode Change) ---
  useEffect(() => {
    if (!sceneRef.current) return;

    const tab1 = sceneRef.current.getObjectByName('tab1Group');
    const tab2 = sceneRef.current.getObjectByName('tab2Group');

    if (tab1) tab1.visible = mode === 'shape';
    if (tab2) tab2.visible = mode === 'flow';

    // Camera animation smoothly adjust target
    if (cameraRef.current && controlsRef.current) {
      if (mode === 'shape') {
        cameraRef.current.position.set(0, 4.0, 8.5);
        controlsRef.current.target.set(0, 1.2, 0);
      } else {
        cameraRef.current.position.set(0, 4.8, 7.8);
        controlsRef.current.target.set(0, 0.8, 0);
      }
    }
  }, [mode]);

  // --- Handle Camera Preset Changes ---
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    if (cameraView === 'front') {
      cameraRef.current.position.set(0, 2.0, 8.5);
      controlsRef.current.target.set(0, 1.1, 0);
    } else if (cameraView === 'top') {
      cameraRef.current.position.set(0, 9.5, 0.1);
      controlsRef.current.target.set(0, 0.5, 0);
    } else if (cameraView === 'iso') {
      cameraRef.current.position.set(6, 5, 6);
      controlsRef.current.target.set(0, 1.0, 0);
    } else {
      cameraRef.current.position.set(0, 4.2, 8.5);
      controlsRef.current.target.set(0, 1.1, 0);
    }
  }, [cameraView]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Glass Container Labels (Tab 1) */}
      {mode === 'shape' && showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cốc Label */}
          <div className="absolute top-[28%] left-[23%] -translate-x-1/2 flex flex-col items-center animate-fade-in">
            <span className="px-3 py-1 bg-blue-900/90 text-blue-200 border border-blue-400/50 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
              🥤 1. Cốc thủy tinh (Hình trụ)
            </span>
            <div className="w-0.5 h-6 bg-blue-400/60 my-1"></div>
          </div>

          {/* Bát Label */}
          <div className="absolute top-[28%] left-[50%] -translate-x-1/2 flex flex-col items-center animate-fade-in">
            <span className="px-3 py-1 bg-blue-900/90 text-blue-200 border border-blue-400/50 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
              🥣 2. Bát thủy tinh (Hình bán cầu)
            </span>
            <div className="w-0.5 h-6 bg-blue-400/60 my-1"></div>
          </div>

          {/* Chai Label */}
          <div className="absolute top-[28%] left-[77%] -translate-x-1/2 flex flex-col items-center animate-fade-in">
            <span className="px-3 py-1 bg-blue-900/90 text-blue-200 border border-blue-400/50 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
              🍾 3. Chai thủy tinh (Cổ hẹp)
            </span>
            <div className="w-0.5 h-6 bg-blue-400/60 my-1"></div>
          </div>
        </div>
      )}

      {/* 3D Flow Labels (Tab 2) */}
      {mode === 'flow' && showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Plank Tilt Badge */}
          <div className="absolute top-[22%] left-[30%] -translate-x-1/2 flex flex-col items-center">
            <span className="px-3 py-1 bg-amber-950/90 text-amber-200 border border-amber-500/50 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
              🪵 Tấm gỗ (Độ nghiêng: {tiltAngle}°)
            </span>
            <div className="w-0.5 h-8 bg-amber-400/60 my-1"></div>
          </div>

          {/* Tray Badge */}
          <div className="absolute bottom-[28%] left-[50%] -translate-x-1/2 flex flex-col items-center">
            <span className="px-3 py-1 bg-sky-950/90 text-sky-200 border border-sky-400/50 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
              🌊 Khay nhựa (Nước chảy lan ra mọi phía)
            </span>
          </div>
        </div>
      )}

      {/* Helpful Orbit Drag Indicator */}
      <div className="absolute bottom-4 right-4 pointer-events-none bg-slate-800/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 shadow-lg">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Dùng chuột / tay kéo để xoay góc nhìn 360°</span>
      </div>
    </div>
  );
};
