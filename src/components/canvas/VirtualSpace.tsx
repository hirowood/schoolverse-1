"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useKeyboard from '@/hooks/useKeyboard';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket/socketClient';

const MAP_W = 1600;
const MAP_H = 1200;
const TILE = 32;
const AVATAR_R = 16;
const AVATAR_HEIGHT = AVATAR_R;
const SPEED = 200; // units per second (matches legacy 2D canvas implementation)
const BROADCAST_INTERVAL_MS = 50;

const WORLD_BOUNDS = {
  minX: TILE + AVATAR_R,
  maxX: MAP_W - TILE - AVATAR_R,
  minZ: TILE + AVATAR_R,
  maxZ: MAP_H - TILE - AVATAR_R,
};

type PeerState = { x: number; y: number; displayName?: string };

export default function VirtualSpace() {
  const keys = useKeyboard();
  const { user } = useAuthStore();
  const socket = useMemo(() => getSocket(), []);
  const peersRef = useRef<Map<string, PeerState>>(new Map());
  const [peersVersion, setPeersVersion] = useState(0);
  const lastSentRef = useRef(0);

  const emitPosition = useCallback(
    (pos: { x: number; y: number }) => {
      if (!user?.id) return;
      const now = performance.now();
      if (now - lastSentRef.current < BROADCAST_INTERVAL_MS) return;
      lastSentRef.current = now;
      socket.emit('space:position:update', pos);
    },
    [socket, user?.id],
  );

  useEffect(() => {
    if (!user?.id) return;
    socket.emit('presence:join', { userId: user.id, displayName: user.displayName });
    lastSentRef.current = 0;
  }, [socket, user?.id, user?.displayName]);

  useEffect(() => {
    const onState = (players: Array<{ userId: string; x: number; y: number; displayName?: string }>) => {
      const next = new Map<string, PeerState>();
      players.forEach((p) => {
        if (p.userId === user?.id) return;
        next.set(p.userId, { x: p.x, y: p.y, displayName: p.displayName });
      });
      peersRef.current = next;
      setPeersVersion((v) => v + 1);
    };
    const onJoined = (p: { userId: string; x: number; y: number; displayName?: string }) => {
      if (p.userId === user?.id) return;
      peersRef.current.set(p.userId, { x: p.x, y: p.y, displayName: p.displayName });
      setPeersVersion((v) => v + 1);
    };
    const onLeft = (p: { userId: string }) => {
      peersRef.current.delete(p.userId);
      setPeersVersion((v) => v + 1);
    };
    const onPos = (p: { userId: string; x: number; y: number }) => {
      const cur = peersRef.current.get(p.userId);
      if (!cur) return;
      cur.x = p.x;
      cur.y = p.y;
      setPeersVersion((v) => v + 1);
    };

    socket.on('presence:state', onState);
    socket.on('presence:joined', onJoined);
    socket.on('presence:left', onLeft);
    socket.on('space:position:update', onPos);
    return () => {
      socket.off('presence:state', onState);
      socket.off('presence:joined', onJoined);
      socket.off('presence:left', onLeft);
      socket.off('space:position:update', onPos);
    };
  }, [socket, user?.id]);

  const peers = useMemo(
    () => Array.from(peersRef.current.entries()).map(([id, value]) => ({ id, ...value })),
    [peersVersion],
  );

  return (
    <div className="h-[600px] w-full">
      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [MAP_W / 2, 220, MAP_H / 2 + 260], fov: 50, near: 0.1, far: 5000 }}
      >
        <color attach="background" args={['#e2e8f0']} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[200, 400, 200]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Floor />
        <Walls />
        <LocalPlayer keys={keys} displayName={user?.displayName ?? null} onBroadcast={emitPosition} />
        {peers.map((peer) => (
          <PeerAvatar key={peer.id} x={peer.x} y={peer.y} displayName={peer.displayName} />
        ))}
      </Canvas>
    </div>
  );
}

type LocalPlayerProps = {
  keys: ReturnType<typeof useKeyboard>;
  displayName: string | null;
  onBroadcast: (pos: { x: number; y: number }) => void;
};

function LocalPlayer({ keys, displayName, onBroadcast }: LocalPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(MAP_W / 2, AVATAR_HEIGHT, MAP_H / 2));
  const keysRef = useRef(keys);
  const broadcastFnRef = useRef(onBroadcast);
  const broadcastTimerRef = useRef(-Infinity);
  const cameraTarget = useRef(new THREE.Vector3());
  const desiredCamera = useRef(new THREE.Vector3());

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    broadcastFnRef.current = onBroadcast;
  }, [onBroadcast]);

  useFrame((state, delta) => {
    const { up, down, left, right } = keysRef.current;
    const current = positionRef.current;
    let nextX = current.x;
    let nextZ = current.z;
    const vel = SPEED * delta;

    if (up) nextZ -= vel;
    if (down) nextZ += vel;
    if (left) nextX -= vel;
    if (right) nextX += vel;

    nextX = THREE.MathUtils.clamp(nextX, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
    nextZ = THREE.MathUtils.clamp(nextZ, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);
    current.set(nextX, AVATAR_HEIGHT, nextZ);

    if (groupRef.current) {
      groupRef.current.position.copy(current);
    }

    cameraTarget.current.set(current.x, current.y, current.z);
    desiredCamera.current.set(current.x, current.y + 200, current.z + 240);
    state.camera.position.lerp(desiredCamera.current, Math.min(1, delta * 4));
    state.camera.lookAt(cameraTarget.current);

    const now = performance.now();
    if (now - broadcastTimerRef.current > BROADCAST_INTERVAL_MS) {
      broadcastTimerRef.current = now;
      broadcastFnRef.current({ x: current.x, y: current.z });
    }
  });

  return (
    <group ref={groupRef} position={[MAP_W / 2, AVATAR_HEIGHT, MAP_H / 2]}>
      <mesh castShadow>
        <sphereGeometry args={[AVATAR_R, 32, 32]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      {displayName && (
        <Html
          center
          position={[0, AVATAR_R + 12, 0]}
          style={{ fontSize: '12px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}
        >
          {displayName}
        </Html>
      )}
    </group>
  );
}

type PeerAvatarProps = {
  x: number;
  y: number;
  displayName?: string;
};

function PeerAvatar({ x, y, displayName }: PeerAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector3(x, AVATAR_HEIGHT, y));

  useEffect(() => {
    targetRef.current.set(x, AVATAR_HEIGHT, y);
  }, [x, y]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(targetRef.current, Math.min(1, delta * 8));
  });

  return (
    <group ref={groupRef} position={[x, AVATAR_HEIGHT, y]}>
      <mesh castShadow>
        <sphereGeometry args={[AVATAR_R, 32, 32]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      {displayName && (
        <Html
          center
          position={[0, AVATAR_R + 12, 0]}
          style={{ fontSize: '12px', fontWeight: 500, color: '#064e3b', whiteSpace: 'nowrap' }}
        >
          {displayName}
        </Html>
      )}
    </group>
  );
}

function Floor() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[MAP_W / 2, 0, MAP_H / 2]}
        receiveShadow
      >
        <planeGeometry args={[MAP_W, MAP_H, MAP_W / TILE, MAP_H / TILE]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <gridHelper
        args={[Math.max(MAP_W, MAP_H), Math.max(MAP_W, MAP_H) / TILE, '#cbd5e1', '#e2e8f0']}
        position={[MAP_W / 2, 0.1, MAP_H / 2]}
      />
    </group>
  );
}

function Walls() {
  const thickness = TILE;
  const height = TILE * 3;
  const halfHeight = height / 2;
  return (
    <group position={[0, halfHeight, 0]}>
      <mesh position={[MAP_W / 2, 0, thickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[MAP_W, height, thickness]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[MAP_W / 2, 0, MAP_H - thickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[MAP_W, height, thickness]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[thickness / 2, 0, MAP_H / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, MAP_H]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[MAP_W - thickness / 2, 0, MAP_H / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, MAP_H]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}
