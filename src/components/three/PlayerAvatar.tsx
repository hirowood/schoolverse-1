"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useKeyboard from "@/hooks/useKeyboard";

const SPEED = 3; // units per frame at ~60fps (~180u/s)

export function PlayerAvatar() {
  const keys = useKeyboard();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const vel = SPEED * (delta * 60); // normalize to ~60fps baseline
    let nx = g.position.x;
    let nz = g.position.z;
    if (keys.up) nz -= vel;
    if (keys.down) nz += vel;
    if (keys.left) nx -= vel;
    if (keys.right) nx += vel;

    g.position.set(nx, g.position.y, nz);
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  );
}

export default PlayerAvatar;

