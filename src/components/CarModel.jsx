import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { useSpeechReveal } from '../contexts/SpeechRevealContext';
import ModelErrorBoundary from './ModelErrorBoundary';
import OrbFallback from './OrbFallback';

// عدّل هنا: [ميل فوق/تحت, دوران يمين/يسار, انقلاب]
const MODEL_ROTATION = [1.5, 3.14, 3.14];
const MODEL_LIFT = 0.35;
const CAMERA_POSITION = [0, 1.6, 7.2];
/** أقرب للكاميرا + زاوية أوسع يبان وجهاً لوجه */
const CAMERA_CHAT_POSITION = [0, 1.38, 4.72];
const CAMERA_CHAT_FOV = 43;
const HEAD_TURN_Y = 0.45;
const HEAD_TURN_X = 0.28;
const MOUSE_LERP = 0.32;

function CarMesh({ speechActive, presentation }) {
  const meshRef = useRef(null);
  const followRef = useRef(null);
  const nodRef = useRef(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const geometry = useLoader(STLLoader, '/assets/single_color (4).stl');

  const isChat = presentation === 'chat';
  const turnY = isChat ? HEAD_TURN_Y * 0.48 : HEAD_TURN_Y;
  const turnX = isChat ? HEAD_TURN_X * 0.42 : HEAD_TURN_X;
  const lerp = isChat ? MOUSE_LERP * 0.65 : MOUSE_LERP;
  const meshScale = isChat ? 1.22 : 1;

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

    const targetYaw = mouseTarget.current.x * turnY;
    const targetPitch = -mouseTarget.current.y * turnX;
    followRef.current.rotation.y = THREE.MathUtils.lerp(followRef.current.rotation.y, targetYaw, lerp);
    followRef.current.rotation.x = THREE.MathUtils.lerp(followRef.current.rotation.x, targetPitch, lerp);

    const t = state.clock.elapsedTime;
    const speed = speechActive ? 3.8 : 0.8;
    const amount = speechActive ? 0.055 : 0.02;
    meshRef.current.position.y = MODEL_LIFT + Math.sin(t * speed) * amount;

    if (nodRef.current) {
      const tgtX = speechActive
        ? Math.sin(t * 5.2) * 0.14 + Math.sin(t * 2.05) * 0.05
        : 0;
      const tgtY = speechActive ? Math.sin(t * 2.85) * 0.075 : 0;
      nodRef.current.rotation.x = THREE.MathUtils.lerp(
        nodRef.current.rotation.x,
        tgtX,
        0.22,
      );
      nodRef.current.rotation.y = THREE.MathUtils.lerp(
        nodRef.current.rotation.y,
        tgtY,
        0.2,
      );
    }
  });

  return (
    <group ref={followRef}>
      <Float speed={1} rotationIntensity={0} floatIntensity={0.15}>
        <group ref={nodRef}>
          <mesh
            ref={meshRef}
            geometry={processedGeometry}
            rotation={MODEL_ROTATION}
            scale={meshScale}
          >
            <meshPhysicalMaterial
              color="#3BFAD2"
              metalness={0.65}
              roughness={0.18}
              clearcoat={1}
              clearcoatRoughness={0.1}
              envMapIntensity={1.4}
              emissive="#3BFAD2"
              emissiveIntensity={speechActive ? 0.16 : 0.1}
              polygonOffset
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
            />
          </mesh>
        </group>
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

function CarModelCanvas({ isTyping = false, presentation = 'welcome' }) {
  const { speechReveal } = useSpeechReveal();
  const speechActive = isTyping || speechReveal;

  const isChat = presentation === 'chat';

  const cameraProps = isChat
    ? { position: CAMERA_CHAT_POSITION, fov: CAMERA_CHAT_FOV }
    : { position: CAMERA_POSITION, fov: 36 };

  return (
    <div className="orb-canvas">
      <Canvas
        camera={{ position: cameraProps.position, fov: cameraProps.fov }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 8, 5]} intensity={0.9} />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#6742E2" />
        <pointLight position={[3, 0, 2]} intensity={0.35} color="#3BFAD2" />
        <Suspense fallback={<Loader />}>
          <CarMesh speechActive={speechActive} presentation={presentation} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function CarModel(props) {
  return (
    <ModelErrorBoundary>
      <CarModelCanvas {...props} />
    </ModelErrorBoundary>
  );
}
