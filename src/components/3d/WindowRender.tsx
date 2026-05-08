import React, { useRef } from 'react';
import { useStore, WindowItem } from '../../store/useStore';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

export function WindowRender({ item }: { item: WindowItem }) {
  const { width, length, height, selectedId, setSelection, updateWindow } = useStore();
  const isSelected = selectedId === item.id;
  const ref = useRef<THREE.Group>(null);

  // Calculate base position matching the wall exactly
  let wallPos = [0, 0, 0];
  let wallRot = [0, 0, 0];
  
  if (item.wallIndex === 0) { wallPos = [0, height/2, -length/2 + 0.05]; wallRot = [0, 0, 0]; }
  if (item.wallIndex === 1) { wallPos = [width/2 - 0.05, height/2, 0]; wallRot = [0, -Math.PI/2, 0]; }
  if (item.wallIndex === 2) { wallPos = [0, height/2, length/2 - 0.05]; wallRot = [0, Math.PI, 0]; }
  if (item.wallIndex === 3) { wallPos = [-width/2 + 0.05, height/2, 0]; wallRot = [0, Math.PI/2, 0]; }

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelection(item.id, 'window');
  };

  const windowSize = item.type === 'panoramic' ? [2.5, height - 0.4, 0.12] : [1.2, 1.2, 0.12];

  const content = (
    <group onClick={handleClick}>
      {/* Window Frame */}
      <mesh>
        <boxGeometry args={[windowSize[0], windowSize[1], windowSize[2]]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[windowSize[0] - 0.1, windowSize[1] - 0.1, windowSize[2] + 0.05]} />
        <meshPhysicalMaterial 
          color="#93c5fd" 
          transparent={true} 
          opacity={0.3} 
          transmission={0.9} 
          roughness={0.1} 
          side={THREE.DoubleSide}
        />
      </mesh>
      {isSelected && (
        <mesh>
           <boxGeometry args={[windowSize[0] + 0.05, windowSize[1] + 0.05, windowSize[2] + 0.05]} />
           <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );

  return (
    <group position={wallPos as any} rotation={wallRot as any}>
      <group position={item.position as any} ref={ref}>
        {content}
      </group>
      {isSelected && (
          <TransformControls 
            object={ref as any}
            mode="translate" 
           space="local"
           showZ={false} 
           onChange={() => {
             if (ref.current) {
               // Limit the window so it doesn't go outside the wall bounds
               let x = ref.current.position.x;
               let y = ref.current.position.y;
               
               const wallLength = (item.wallIndex === 0 || item.wallIndex === 2) ? width : length;
               const limitX = Math.max(0, wallLength / 2 - windowSize[0] / 2);
               const limitY = Math.max(0, height / 2 - windowSize[1] / 2);
               
               const clampedX = Math.max(-limitX, Math.min(limitX, x));
               const clampedY = Math.max(-height/2 + windowSize[1]/2, Math.min(limitY, y));

               if (Math.abs(x - clampedX) > 0.001 || Math.abs(y - clampedY) > 0.001) {
                 ref.current.position.set(clampedX, clampedY, 0);
               }
             }
           }}
           onMouseUp={() => {
             if (ref.current) {
               // Limit the window so it doesn't go outside the wall bounds
               let x = ref.current.position.x;
               let y = ref.current.position.y;
               
               const wallLength = (item.wallIndex === 0 || item.wallIndex === 2) ? width : length;
               const limitX = Math.max(0, wallLength / 2 - windowSize[0] / 2);
               const limitY = Math.max(0, height / 2 - windowSize[1] / 2);
               
               x = Math.max(-limitX, Math.min(limitX, x));
               y = Math.max(-height/2 + windowSize[1]/2, Math.min(limitY, y));

               ref.current.position.set(x, y, 0);

               updateWindow(item.id, {
                 position: [x, y, 0],
               });
             }
           }}
         />
      )}
    </group>
  );
}
