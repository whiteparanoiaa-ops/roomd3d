import React, { Suspense } from 'react';
import { useStore } from '../../store/useStore';
import { Plane, Grid, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

const TexturedMaterial = ({ textureUrl, color, isSelected, repeatX, repeatY }: { textureUrl: string, color: string, isSelected: boolean, repeatX: number, repeatY: number }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  
  React.useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeatX / 2, repeatY / 2);
      texture.needsUpdate = true;
    }
  }, [texture, repeatX, repeatY]);

  return <meshStandardMaterial map={texture} color={color} roughness={0.8} />;
};

const WallGeometry = ({ width, height, position, rotation, color, texture, isSelected, onClick }: any) => {
  return (
    <mesh position={position} rotation={rotation} onClick={onClick} receiveShadow castShadow>
      <boxGeometry args={[width, height, 0.1]} />
      <Suspense fallback={<meshStandardMaterial color={color} roughness={0.8} />}>
        {texture ? (
          <TexturedMaterial key={texture} textureUrl={texture} color={color} isSelected={isSelected} repeatX={width} repeatY={height} />
        ) : (
          <meshStandardMaterial color={color} roughness={0.8} />
        )}
      </Suspense>
      {isSelected && <Edges scale={1.001} threshold={15} color="#4f46e5" />}
    </mesh>
  );
};

export function Room() {
  const { width, length, height, walls, setSelection, selectedId, selectedType, floorColor, floorTexture } = useStore();

  const handleWallClick = (index: number, e: any) => {
    e.stopPropagation();
    setSelection(index.toString(), 'wall');
  };

  return (
    <group>
      {/* Floor */}
      <Plane
        args={[width, length]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={(e) => { e.stopPropagation(); setSelection('floor', 'floor'); }}
      >
        <Suspense fallback={<meshStandardMaterial color={floorColor} roughness={0.9} />}>
          {floorTexture ? (
             <TexturedMaterial textureUrl={floorTexture} color={floorColor} isSelected={selectedType === 'floor'} repeatX={width} repeatY={length} />
          ) : (
             <meshStandardMaterial color={floorColor} roughness={0.9} />
          )}
        </Suspense>
        {selectedType === 'floor' && <Edges scale={1.001} threshold={15} color="#4f46e5" />}
      </Plane>

      {!floorTexture && (
        <Grid 
          args={[width, length]} 
          position={[0, 0.01, 0]} 
          cellColor="#e5e7eb" 
          sectionColor="#d1d5db" 
          fadeDistance={20} 
          fadeStrength={1} 
        />
      )}

      {/* North Wall - Z is negative */}
      <WallGeometry
        index={0} showAxis="z"
        width={width} height={height}
        position={[0, height / 2, -length / 2]} rotation={[0, 0, 0]}
        color={walls[0].color} texture={walls[0].texture} isSelected={selectedId === '0'}
        onClick={(e: any) => handleWallClick(0, e)}
      />
      {/* East Wall - X is positive */}
      <WallGeometry
        index={1} showAxis="x"
        width={length} height={height}
        position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}
        color={walls[1].color} texture={walls[1].texture} isSelected={selectedId === '1'}
        onClick={(e: any) => handleWallClick(1, e)}
      />
      {/* South Wall - Z is positive */}
      <WallGeometry
        index={2} showAxis="z"
        width={width} height={height}
        position={[0, height / 2, length / 2]} rotation={[0, Math.PI, 0]}
        color={walls[2].color} texture={walls[2].texture} isSelected={selectedId === '2'}
        onClick={(e: any) => handleWallClick(2, e)}
      />
      {/* West Wall - X is negative */}
      <WallGeometry
        index={3} showAxis="x"
        width={length} height={height}
        position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}
        color={walls[3].color} texture={walls[3].texture} isSelected={selectedId === '3'}
        onClick={(e: any) => handleWallClick(3, e)}
      />
    </group>
  );
}
