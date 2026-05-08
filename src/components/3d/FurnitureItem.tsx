import React, { useRef, useEffect, useState } from 'react';
import { useStore, Furniture } from '../../store/useStore';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

const getBoundingBox = (type: string, scale: number[], rotY: number, posX: number, posY: number, posZ: number) => {
  let dimX = 1 * scale[0];
  let dimZ = 1 * scale[2];
  let dimY = 1 * scale[1];

  switch (type) {
    case 'table': dimX = 1.5 * scale[0]; dimZ = 1 * scale[2]; dimY = 0.8 * scale[1]; break;
    case 'chair': dimX = 0.4 * scale[0]; dimZ = 0.4 * scale[2]; dimY = 1.15 * scale[1]; break;
    case 'armchair': dimX = 0.8 * scale[0]; dimZ = 0.8 * scale[2]; dimY = 1.0 * scale[1]; break;
    case 'sofa': dimX = 2 * scale[0]; dimZ = 0.8 * scale[2]; dimY = 1.0 * scale[1]; break;
    case 'bed': dimX = 1.5 * scale[0]; dimZ = 2 * scale[2]; dimY = 0.55 * scale[1]; break;
    case 'cabinet': dimX = 1 * scale[0]; dimZ = 0.6 * scale[2]; dimY = 2.0 * scale[1]; break;
    case 'tv_stand': dimX = 1.8 * scale[0]; dimZ = 0.4 * scale[2]; dimY = 0.4 * scale[1]; break;
    case 'desk': dimX = 1.5 * scale[0]; dimZ = 0.8 * scale[2]; dimY = 0.8 * scale[1]; break;
    case 'tv': dimX = 1.6 * scale[0]; dimZ = 0.2 * scale[2]; dimY = 0.85 * scale[1]; break;
    case 'office_chair': dimX = 0.6 * scale[0]; dimZ = 0.6 * scale[2]; dimY = 1.45 * scale[1]; break;
    case 'plant': dimX = 0.6 * scale[0]; dimZ = 0.6 * scale[2]; dimY = 0.8 * scale[1]; break;
    case 'lamp': dimX = 0.4 * scale[0]; dimZ = 0.4 * scale[2]; dimY = 1.8 * scale[1]; break;
    case 'carpet': dimX = 2.0 * scale[0]; dimZ = 1.5 * scale[2]; dimY = 0.02 * scale[1]; break;
    case 'bookshelf': dimX = 1.0 * scale[0]; dimZ = 0.4 * scale[2]; dimY = 2.0 * scale[1]; break;
  }

  const cos = Math.abs(Math.cos(rotY));
  const sin = Math.abs(Math.sin(rotY));
  
  const boundX = dimX * cos + dimZ * sin;
  const boundZ = dimX * sin + dimZ * cos;

  return {
    boundX,
    boundY: dimY,
    boundZ,
    minX: posX - 0.5 * boundX,
    maxX: posX + 0.5 * boundX,
    minY: posY,
    maxY: posY + dimY,
    minZ: posZ - 0.5 * boundZ,
    maxZ: posZ + 0.5 * boundZ
  };
};

const checkCollision2D = (box1: any, box2: any) => {
  const margin = 0.001; 
  return (
    box1.minX < box2.maxX - margin &&
    box1.maxX > box2.minX + margin &&
    box1.minZ < box2.maxZ - margin &&
    box1.maxZ > box2.minZ + margin
  );
};

export function FurnitureItem({ item }: { item: Furniture }) {
  const { selectedId, setSelection, updateFurniture, width, length, furniture } = useStore();
  const isSelected = selectedId === item.id;
  const ref = useRef<THREE.Group>(null);
  const [mode, setMode] = useState<'translate' | 'rotate'>('translate');
  const lastValidPos = useRef([item.position[0], item.position[1], item.position[2]]);
  const lastValidRot = useRef([item.rotation[0], item.rotation[1], item.rotation[2]]);

  useEffect(() => {
    if (!isSelected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setMode(prev => prev === 'translate' ? 'rotate' : 'translate');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelection(item.id, 'furniture');
  };

  const renderGeometry = () => {
    switch (item.type) {
      case 'table':
        return (
          <group>
            {/* Top */}
            <mesh position={[0, 0.7 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5 * item.scale[0], 0.1 * item.scale[1], 1 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Legs */}
            <mesh position={[-0.65 * item.scale[0], 0.35 * item.scale[1], -0.4 * item.scale[2]]} castShadow><cylinderGeometry args={[0.05 * item.scale[0], 0.05 * item.scale[0], 0.7 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
            <mesh position={[0.65 * item.scale[0], 0.35 * item.scale[1], -0.4 * item.scale[2]]} castShadow><cylinderGeometry args={[0.05 * item.scale[0], 0.05 * item.scale[0], 0.7 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
            <mesh position={[-0.65 * item.scale[0], 0.35 * item.scale[1], 0.4 * item.scale[2]]} castShadow><cylinderGeometry args={[0.05 * item.scale[0], 0.05 * item.scale[0], 0.7 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
            <mesh position={[0.65 * item.scale[0], 0.35 * item.scale[1], 0.4 * item.scale[2]]} castShadow><cylinderGeometry args={[0.05 * item.scale[0], 0.05 * item.scale[0], 0.7 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
          </group>
        );
      case 'chair':
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, 0.45 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4 * item.scale[0], 0.05 * item.scale[1], 0.4 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.75 * item.scale[1], -0.175 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.4 * item.scale[0], 0.4 * item.scale[1], 0.05 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Legs */}
            <mesh position={[-0.15 * item.scale[0], 0.225 * item.scale[1], -0.15 * item.scale[2]]} castShadow><cylinderGeometry args={[0.02 * item.scale[0], 0.02 * item.scale[0], 0.45 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
            <mesh position={[0.15 * item.scale[0], 0.225 * item.scale[1], -0.15 * item.scale[2]]} castShadow><cylinderGeometry args={[0.02 * item.scale[0], 0.02 * item.scale[0], 0.45 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
            <mesh position={[-0.15 * item.scale[0], 0.225 * item.scale[1], 0.15 * item.scale[2]]} castShadow><cylinderGeometry args={[0.02 * item.scale[0], 0.02 * item.scale[0], 0.45 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
            <mesh position={[0.15 * item.scale[0], 0.225 * item.scale[1], 0.15 * item.scale[2]]} castShadow><cylinderGeometry args={[0.02 * item.scale[0], 0.02 * item.scale[0], 0.45 * item.scale[1]]} /><meshStandardMaterial color="#4b5563" /></mesh>
          </group>
        );
      case 'sofa':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.2 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[2 * item.scale[0], 0.4 * item.scale[1], 0.8 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.6 * item.scale[1], -0.3 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[2 * item.scale[0], 0.4 * item.scale[1], 0.2 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Armrests */}
            <mesh position={[-0.9 * item.scale[0], 0.5 * item.scale[1], 0.1 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.2 * item.scale[0], 0.4 * item.scale[1], 0.6 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            <mesh position={[0.9 * item.scale[0], 0.5 * item.scale[1], 0.1 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.2 * item.scale[0], 0.4 * item.scale[1], 0.6 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
          </group>
        );
      case 'armchair':
        return (
          <group>
            <mesh position={[0, 0.25 * item.scale[1], 0]} castShadow receiveShadow><boxGeometry args={[0.8 * item.scale[0], 0.5 * item.scale[1], 0.8 * item.scale[2]]} /><meshStandardMaterial color={item.color} /></mesh>
            <mesh position={[0, 0.7 * item.scale[1], -0.3 * item.scale[2]]} castShadow receiveShadow><boxGeometry args={[0.8 * item.scale[0], 0.6 * item.scale[1], 0.2 * item.scale[2]]} /><meshStandardMaterial color={item.color} /></mesh>
            <mesh position={[-0.35 * item.scale[0], 0.6 * item.scale[1], 0.1 * item.scale[2]]} castShadow receiveShadow><boxGeometry args={[0.1 * item.scale[0], 0.4 * item.scale[1], 0.6 * item.scale[2]]} /><meshStandardMaterial color={item.color} /></mesh>
            <mesh position={[0.35 * item.scale[0], 0.6 * item.scale[1], 0.1 * item.scale[2]]} castShadow receiveShadow><boxGeometry args={[0.1 * item.scale[0], 0.4 * item.scale[1], 0.6 * item.scale[2]]} /><meshStandardMaterial color={item.color} /></mesh>
          </group>
        );
      case 'bed':
        return (
          <group>
            <mesh position={[0, 0.15 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5 * item.scale[0], 0.3 * item.scale[1], 2 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            <mesh position={[0, 0.35 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4 * item.scale[0], 0.15 * item.scale[1], 1.9 * item.scale[2]]} />
              <meshStandardMaterial color="#f3f4f6" />
            </mesh>
            <mesh position={[0, 0.45 * item.scale[1], -0.7 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[1 * item.scale[0], 0.1 * item.scale[1], 0.3 * item.scale[2]]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      case 'cabinet':
        return (
          <group>
            {/* Main Body */}
            <mesh position={[0, 1 * item.scale[1], -0.02 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[1 * item.scale[0], 2 * item.scale[1], 0.56 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Drawer */}
            <mesh position={[0, 0.31 * item.scale[1], 0.28 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.96 * item.scale[0], 0.38 * item.scale[1], 0.04 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Drawer Handle */}
            <mesh position={[0, 0.31 * item.scale[1], 0.31 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.2 * item.scale[0], 0.02 * item.scale[1], 0.02 * item.scale[2]]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Left Door */}
            <mesh position={[-0.245 * item.scale[0], 1.25 * item.scale[1], 0.28 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.47 * item.scale[0], 1.46 * item.scale[1], 0.04 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Left Door Handle */}
            <mesh position={[-0.05 * item.scale[0], 1.25 * item.scale[1], 0.31 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.02 * item.scale[0], 0.2 * item.scale[1], 0.02 * item.scale[2]]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Right Door */}
            <mesh position={[0.245 * item.scale[0], 1.25 * item.scale[1], 0.28 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.47 * item.scale[0], 1.46 * item.scale[1], 0.04 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Right Door Handle */}
            <mesh position={[0.05 * item.scale[0], 1.25 * item.scale[1], 0.31 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.02 * item.scale[0], 0.2 * item.scale[1], 0.02 * item.scale[2]]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.2} />
            </mesh>
          </group>
        );
      case 'desk':
        return (
          <group>
            {/* Top */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5 * item.scale[0], 0.05, 0.8 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Left Leg */}
            <mesh position={[-0.7 * item.scale[0], 0.375 * item.scale[1], 0]} castShadow>
              <boxGeometry args={[0.05, 0.75 * item.scale[1], 0.7 * item.scale[2]]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.7 * item.scale[0], 0.375 * item.scale[1], 0]} castShadow>
              <boxGeometry args={[0.05, 0.75 * item.scale[1], 0.7 * item.scale[2]]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            {/* Back Panel */}
            <mesh position={[0, 0.5 * item.scale[1], -0.3 * item.scale[2]]} castShadow>
              <boxGeometry args={[1.4 * item.scale[0], 0.3 * item.scale[1], 0.05]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
          </group>
        );
      case 'office_chair':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.1 * item.scale[1], 0]} castShadow>
              <cylinderGeometry args={[0.3 * item.scale[0], 0.3 * item.scale[0], 0.05 * item.scale[1], 5]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            {/* Center post */}
            <mesh position={[0, 0.3 * item.scale[1], 0]} castShadow>
              <cylinderGeometry args={[0.03 * item.scale[0], 0.03 * item.scale[0], 0.4 * item.scale[1]]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            {/* Seat */}
            <mesh position={[0, 0.5 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5 * item.scale[0], 0.1 * item.scale[1], 0.5 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.85 * item.scale[1], -0.2 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.45 * item.scale[0], 0.6 * item.scale[1], 0.1 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Arm rests */}
             <mesh position={[-0.25 * item.scale[0], 0.65 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[0.05 * item.scale[0], 0.2 * item.scale[1], 0.3 * item.scale[2]]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
            <mesh position={[0.25 * item.scale[0], 0.65 * item.scale[1], 0]} castShadow receiveShadow>
               <boxGeometry args={[0.05 * item.scale[0], 0.2 * item.scale[1], 0.3 * item.scale[2]]} />
               <meshStandardMaterial color="#4b5563" />
             </mesh>
          </group>
        );
      case 'tv':
        return (
          <group>
            <mesh position={[0, 0.4 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6 * item.scale[0], 0.9 * item.scale[1], 0.05 * item.scale[2]]} />
              <meshStandardMaterial color={item.color === '#ffffff' ? '#1f2937' : item.color} />
            </mesh>
            <mesh position={[0, 0.4 * item.scale[1], 0.03 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[1.5 * item.scale[0], 0.8 * item.scale[1], 0.02 * item.scale[2]]} />
              <meshStandardMaterial color="#111827" roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.05 * item.scale[1], -0.05 * item.scale[2]]} castShadow>
               <boxGeometry args={[0.4 * item.scale[0], 0.1 * item.scale[1], 0.2 * item.scale[2]]} />
               <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[0, 0.2 * item.scale[1], -0.02 * item.scale[2]]} castShadow>
               <boxGeometry args={[0.1 * item.scale[0], 0.3 * item.scale[1], 0.05 * item.scale[2]]} />
               <meshStandardMaterial color="#374151" />
            </mesh>
          </group>
        );
      case 'tv_stand':
        return (
          <group>
            <mesh position={[0, 0.2 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8 * item.scale[0], 0.4 * item.scale[1], 0.4 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
          </group>
        );
      case 'plant':
        return (
          <group>
            <mesh position={[0, 0.15 * item.scale[1], 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2 * item.scale[0], 0.15 * item.scale[0], 0.3 * item.scale[1]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            <mesh position={[0, 0.5 * item.scale[1], 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.3 * item.scale[0], 16, 16]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
          </group>
        );
      case 'lamp':
        return (
          <group>
            <mesh position={[0, 0.025 * item.scale[1], 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15 * item.scale[0], 0.15 * item.scale[0], 0.05 * item.scale[1]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            <mesh position={[0, 0.75 * item.scale[1], 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.02 * item.scale[0], 0.02 * item.scale[0], 1.5 * item.scale[1]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            <mesh position={[0, 1.5 * item.scale[1], 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1 * item.scale[0], 0.2 * item.scale[0], 0.3 * item.scale[1]]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      case 'carpet':
        return (
          <group>
            <mesh position={[0, 0.01 * item.scale[1], 0]} receiveShadow>
              <boxGeometry args={[2.0 * item.scale[0], 0.02 * item.scale[1], 1.5 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
          </group>
        );
      case 'bookshelf':
        return (
          <group>
            {/* Outline box */}
            <mesh position={[0, 1 * item.scale[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[1.0 * item.scale[0], 2.0 * item.scale[1], 0.4 * item.scale[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
            {/* Shelves (darker to give depth) */}
            <mesh position={[0, 1 * item.scale[1], 0.02 * item.scale[2]]} castShadow receiveShadow>
              <boxGeometry args={[0.9 * item.scale[0], 1.9 * item.scale[1], 0.38 * item.scale[2]]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            {/* Horizontal dividers */}
            {[0.4, 0.8, 1.2, 1.6].map((h, i) => (
              <mesh key={i} position={[0, h * item.scale[1], 0.1 * item.scale[2]]} castShadow>
                <boxGeometry args={[0.9 * item.scale[0], 0.05 * item.scale[1], 0.38 * item.scale[2]]} />
                <meshStandardMaterial color={item.color} />
              </mesh>
            ))}
          </group>
        );
      default:
        return <mesh><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="hotpink" /></mesh>;
    }
  };

  return (
    <>
      <group 
        ref={ref} 
        position={item.position as any} 
        rotation={item.rotation as any} 
        onClick={handleClick}
      >
        {renderGeometry()}
        {/* Outline for selection */}
        {isSelected && (
          <mesh position={[0, 0.05, 0]}>
             <boxGeometry args={[
               (['sofa', 'tv_stand', 'bed', 'cabinet', 'desk', 'tv'].includes(item.type) ? 2.1 : 1) * item.scale[0], 
               (['cabinet', 'tv'].includes(item.type) ? 2.1 : 0.1) * item.scale[1], 
               (item.type === 'bed' ? 2.1 : 1) * item.scale[2]
             ]} />
             <meshBasicMaterial color="#4f46e5" wireframe />
          </mesh>
        )}
      </group>
      {isSelected && (
        <TransformControls 
          object={ref as any}
          mode={mode} 
          onMouseDown={() => {
            if (ref.current) {
              lastValidPos.current = [ref.current.position.x, ref.current.position.y, ref.current.position.z];
              lastValidRot.current = [ref.current.rotation.x, ref.current.rotation.y, ref.current.rotation.z];
            }
          }}
          onChange={() => {
            if (ref.current) {
              const myBoxData = getBoundingBox(item.type, item.scale, ref.current.rotation.y, ref.current.position.x, ref.current.position.y, ref.current.position.z);
              
              const limitX = Math.max(0, width / 2 - 0.05 - 0.5 * myBoxData.boundX);
              const limitZ = Math.max(0, length / 2 - 0.05 - 0.5 * myBoxData.boundZ);
              
              const x = ref.current.position.x;
              const z = ref.current.position.z;

              const clampedX = Math.max(-limitX, Math.min(limitX, x));
              const clampedZ = Math.max(-limitZ, Math.min(limitZ, z));

              let newX = clampedX;
              let newZ = clampedZ;
              let newRotY = ref.current.rotation.y;

              const testBox = getBoundingBox(item.type, item.scale, newRotY, newX, 0, newZ);
              let snapY = 0;

              for (const other of furniture) {
                if (other.id === item.id) continue;
                const otherBox = getBoundingBox(other.type, other.scale, other.rotation[1], other.position[0], other.position[1], other.position[2]);
                if (checkCollision2D(testBox, otherBox)) {
                  snapY = Math.max(snapY, otherBox.maxY);
                }
              }

              let newY = snapY;
              
              ref.current.position.set(newX, newY, newZ);
              ref.current.rotation.y = newRotY;
            }
          }}
          onMouseUp={() => {
            if (ref.current) {
              const myBoxData = getBoundingBox(item.type, item.scale, ref.current.rotation.y, ref.current.position.x, ref.current.position.y, ref.current.position.z);
              
              const limitX = Math.max(0, width / 2 - 0.05 - 0.5 * myBoxData.boundX);
              const limitZ = Math.max(0, length / 2 - 0.05 - 0.5 * myBoxData.boundZ);
              
              let x = Math.max(-limitX, Math.min(limitX, ref.current.position.x));
              let z = Math.max(-limitZ, Math.min(limitZ, ref.current.position.z));
              let rotY = ref.current.rotation.y;

              const testBox = getBoundingBox(item.type, item.scale, rotY, x, 0, z);
              let snapY = 0;

              for (const other of furniture) {
                if (other.id === item.id) continue;
                const otherBox = getBoundingBox(other.type, other.scale, other.rotation[1], other.position[0], other.position[1], other.position[2]);
                if (checkCollision2D(testBox, otherBox)) {
                  snapY = Math.max(snapY, otherBox.maxY);
                }
              }

              let y = snapY;

              ref.current.position.set(x, y, z);
              ref.current.rotation.y = rotY;

              updateFurniture(item.id, {
                position: [x, y, z],
                rotation: [ref.current.rotation.x, rotY, ref.current.rotation.z],
              });
            }
          }}
        />
      )}
    </>
  );
}
