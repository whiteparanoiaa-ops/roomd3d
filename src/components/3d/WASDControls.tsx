import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function WASDControls({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const [movement, setMovement] = useState({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setMovement(m => ({ ...m, w: true }));
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setMovement(m => ({ ...m, s: true }));
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setMovement(m => ({ ...m, a: true }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setMovement(m => ({ ...m, d: true }));
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setMovement(m => ({ ...m, w: false }));
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setMovement(m => ({ ...m, s: false }));
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setMovement(m => ({ ...m, a: false }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setMovement(m => ({ ...m, d: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    
    const speed = 10 * delta; // Adjust flight speed
    
    // Get forward and right directions from camera
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; // Keeping movement on horizontal plane
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const moveVec = new THREE.Vector3();
    if (movement.w) moveVec.addScaledVector(forward, speed);
    if (movement.s) moveVec.addScaledVector(forward, -speed);
    if (movement.d) moveVec.addScaledVector(right, speed);
    if (movement.a) moveVec.addScaledVector(right, -speed);
    
    if (moveVec.lengthSq() > 0) {
      camera.position.add(moveVec);
      controlsRef.current.target.add(moveVec);
    }
  });

  return null;
}
