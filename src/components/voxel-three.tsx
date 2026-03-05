'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function VoxelGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 150;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15 - 5,
        ],
        scale: Math.random() * 0.3 + 0.05,
        speed: Math.random() * 0.3 + 0.1,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        offset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.7
          ? new THREE.Color('#FF6B9D')
          : Math.random() > 0.5
          ? new THREE.Color('#00F5FF')
          : new THREE.Color('#1a1a2e'),
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(time * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(time * p.speed * 0.7 + p.offset) * 0.3,
        p.position[2] + Math.sin(time * p.speed * 0.5) * 0.2,
      );
      dummy.rotation.x = time * p.rotSpeed;
      dummy.rotation.y = time * p.rotSpeed * 0.7;
      const pulse = 1 + Math.sin(time * 2 + p.offset) * 0.1;
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, p.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial transparent opacity={0.6} roughness={0.3} metalness={0.8} />
    </instancedMesh>
  );
}

function FloatingOrb({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5 + position[0]) * 0.5;
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[size, 2]} />
        <MeshDistortMaterial color={color} transparent opacity={0.15} distort={0.4} speed={2} roughness={0} metalness={1} />
      </mesh>
    </Float>
  );
}

export default function VoxelThree() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#FF6B9D" />
        <pointLight position={[-10, -5, 5]} intensity={0.3} color="#00F5FF" />
        <VoxelGrid />
        <FloatingOrb position={[-6, 3, -5]} color="#FF6B9D" size={2} />
        <FloatingOrb position={[7, -1, -7]} color="#00F5FF" size={1.5} />
        <FloatingOrb position={[0, 5, -10]} color="#0EA5E9" size={2.5} />
        <gridHelper args={[40, 40, '#1a1a3e', '#0a0a1f']} position={[0, -8, -5]} />
        <fog attach="fog" args={['#0A0A0F', 8, 25]} />
      </Canvas>
    </div>
  );
}
