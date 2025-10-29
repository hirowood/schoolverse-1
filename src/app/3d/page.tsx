"use client";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("@/components/three/Scene3D"), { ssr: false });

export default function Page3D() {
  return (
    <div className="w-full h-[600px]">
      <Scene3D />
    </div>
  );
}

