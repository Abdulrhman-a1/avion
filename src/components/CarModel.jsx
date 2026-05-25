import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';

// عدّل هنا: [ميل فوق/تحت, دوران يمين/يسار, انقلاب]
const MODEL_ROTATION = [1.5, 3.14, 3.14];
const MODEL_LIFT = 0.35;
const CAMERA_POSITION = [0, 1.6, 7.2];
const HEAD_TURN_Y = 0.45;
const HEAD_TURN_X = 0.28;
const MOUSE_LERP = 0.32;

function CarMesh({ isResponding }) {
  const meshRef = useRef();
  const followRef = useRef();
  const mouseTarget = useRef({ x: 0, y: 0 });
  const geometry = useLoader(STLLoader, '/assets/single_color (4).stl');

  useEffect(() => {
    const handlePointerMove = (event) => {
      mouseTarget.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const processedGeometry = useMemo(() => {
    const geo = geometry.clone();
    geo.center();
    const merged = mergeVertices(geo);
    merged.computeVertexNormals();
    const box = new THREE.Box3().setFromBufferAttribute(merged.attributes.position);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    merged.scale(2.75 / maxDim, 2.75 / maxDim, 2.75 / maxDim);
    merged.computeVertexNormals();
    return merged;
  }, [geometry]);

  useFrame((state) => {
    if (!meshRef.current || !followRef.current) return;

    const targetYaw = mouseTarget.current.x * HEAD_TURN_Y;
    const targetPitch = -mouseTarget.current.y * HEAD_TURN_X;
    followRef.current.rotation.y = THREE.MathUtils.lerp(followRef.current.rotation.y, targetYaw, MOUSE_LERP);
    followRef.current.rotation.x = THREE.MathUtils.lerp(followRef.current.rotation.x, targetPitch, MOUSE_LERP);

    const speed = isResponding ? 3 : 0.8;
    const amount = isResponding ? 0.05 : 0.02;
    meshRef.current.position.y = MODEL_LIFT + Math.sin(state.clock.elapsedTime * speed) * amount;
  });

  return (
    <group ref={followRef}>
      <Float speed={1} rotationIntensity={0} floatIntensity={0.15}>
        <mesh
          ref={meshRef}
          geometry={processedGeometry}
          rotation={MODEL_ROTATION}
        >
            <meshPhysicalMaterial
            color="#3BFAD2"
            metalness={0.65}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.4}
            emissive="#3BFAD2"
            emissiveIntensity={0.1}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
            />
          </mesh>
      </Float>
    </group>
  );
}

function Loader() {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.8;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.35, 24, 24]} />
      <meshStandardMaterial color="#3BFAD2" transparent opacity={0.25} />
    </mesh>
  );
}

export default function CarModel({ isResponding }) {
  return (
    <div className="orb-canvas">
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 8, 5]} intensity={0.9} />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#6742E2" />
        <pointLight position={[3, 0, 2]} intensity={0.35} color="#3BFAD2" />
        <Suspense fallback={<Loader />}>
          <CarMesh isResponding={isResponding} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
