"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PlayerAvatar } from "@/components/three/PlayerAvatar";

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
}

export function Scene3D() {
  return (
    <Canvas camera={{ position: [6, 6, 10], fov: 60 }} shadows>
      <color attach="background" args={["#f1f5f9"]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      <Suspense fallback={null}>
        <Floor />
        <PlayerAvatar />
      </Suspense>

      <OrbitControls makeDefault />
      {process.env.NODE_ENV === "development" && (
        <>
          {/* helpers for quick debugging */}
          {/* @ts-ignore - drei types for helpers not required */}
          <axesHelper args={[3]} />
          {/* @ts-ignore */}
          <gridHelper args={[50, 50]} />
        </>
      )}
    </Canvas>
  );
}

export default Scene3D;

