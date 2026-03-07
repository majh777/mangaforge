'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

function InkLogoMesh() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef}>
        <Center>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={1.2}
            height={0.3}
            bevelEnabled
            bevelSize={0.02}
            bevelThickness={0.02}
          >
            InkForge
            <meshStandardMaterial
              color="#FF6B9D"
              metalness={0.9}
              roughness={0.1}
              emissive="#FF6B9D"
              emissiveIntensity={0.3}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  );
}

export default function InkLogo3D() {
  return (
    <div className="h-32 w-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#FF6B9D" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#00F5FF" />
        <InkLogoMesh />
      </Canvas>
    </div>
  );
}
