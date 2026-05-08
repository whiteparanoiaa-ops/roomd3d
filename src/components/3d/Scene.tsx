import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Room } from './Room';
import { FurnitureItem } from './FurnitureItem';
import { WindowRender } from './WindowRender';
import { WASDControls } from './WASDControls';
import { useStore } from '../../store/useStore';

export function Scene() {
  const furniture = useStore((state) => state.furniture);
  const windows = useStore((state) => state.windows);
  const selectedId = useStore((state) => state.selectedId);
  const setSelection = useStore((state) => state.setSelection);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div className="scene-container">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#e5e7eb']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          castShadow 
          position={[10, 10, 5]} 
          intensity={0.8} 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />
        <Environment preset="city" />

        {/* Room & Objects */}
        <group onPointerMissed={() => setSelection(null, null)}>
          <Room />
          {furniture.map((item) => (
             <FurnitureItem key={item.id} item={item} />
          ))}
          {windows.map((item) => (
             <WindowRender key={item.id} item={item} />
          ))}
        </group>

        {/* Controls */}
        <OrbitControls 
          ref={controlsRef}
          makeDefault 
          minDistance={1} 
          maxDistance={30} 
          maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
        />
        <WASDControls controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
