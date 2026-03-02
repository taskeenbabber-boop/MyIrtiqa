import React, { useMemo, useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// --- Configuration ---
const CONFIG = {
  particleCount: 5000,
  cycleSpeed: 0.4,
};

// --- GLSL Shaders ---
const vertexShader = `
  uniform float uTime;
  uniform float uMorphFactor;
  uniform float uPixelRatio;
  
  attribute vec3 aTargetPosition;
  attribute float aRandomSize;
  
  varying float vAlpha;
  varying float vDistance;
  
  vec3 noise(float t, float idx) {
    return vec3(
      sin(t * 0.4 + idx * 1.5) * cos(t * 0.2 + idx),
      cos(t * 0.3 + idx * 2.0) * sin(t * 0.5),
      sin(t * 0.6 + idx * 0.8) * cos(t * 0.4 + idx * 1.2)
    ) * 0.25;
  }

  void main() {
    vec3 currentPos = position;
    vec3 targetPos = aTargetPosition;
    
    // Smooth easing for morph
    float smoothMorph = smoothstep(0.0, 1.0, uMorphFactor);
    vec3 pos = mix(currentPos, targetPos, smoothMorph);
    
    // Add flowing noise
    pos += noise(uTime, position.x + position.y) * (1.0 - smoothMorph * 0.7); 
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size varies with distance and morph state
    float sizeMultiplier = 6.0 + smoothMorph * 4.0;
    gl_PointSize = (aRandomSize * sizeMultiplier * uPixelRatio) / -mvPosition.z;
    
    vAlpha = 0.5 + 0.5 * smoothMorph;
    vDistance = -mvPosition.z;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  uniform float uMorphFactor;
  
  varying float vAlpha;
  varying float vDistance;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft glow effect
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);
    
    // Color gradient based on morph
    vec3 finalColor = mix(uSecondaryColor, uColor, uMorphFactor);
    
    // Add subtle color variation
    float colorVariation = sin(vDistance * 0.5) * 0.1;
    finalColor += colorVariation;
    
    gl_FragColor = vec4(finalColor, vAlpha * glow * 0.9);
  }
`;

interface ParticlesProps {
  primaryColor: string;
  secondaryColor: string;
}

const Particles = ({ primaryColor, secondaryColor }: ParticlesProps) => {
  const mesh = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const targetPositions = new Float32Array(CONFIG.particleCount * 3);
    const randomSizes = new Float32Array(CONFIG.particleCount);

    const radius = 2.8;
    const handleLength = 4.0;
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
      // Scattered state - more spread out
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 8 + 2;
      positions[i * 3] = Math.cos(angle) * dist * (Math.random() + 0.5);
      positions[i * 3 + 1] = Math.sin(angle) * dist * 0.6 * (Math.random() + 0.5);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      
      randomSizes[i] = Math.random() * 0.8 + 0.2;

      // Target state (Magnifying Glass)
      if (i < CONFIG.particleCount * 0.7) {
        const r = Math.sqrt(Math.random()) * radius;
        const theta = Math.random() * 2 * Math.PI;
        
        targetPositions[i * 3] = r * Math.cos(theta) - 1.0;
        targetPositions[i * 3 + 1] = r * Math.sin(theta) + 1.0;
        targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        
        // Create ring effect
        if (Math.random() > 0.85) {
          const ringR = radius * (0.9 + Math.random() * 0.2);
          targetPositions[i * 3] = ringR * Math.cos(theta) - 1.0;
          targetPositions[i * 3 + 1] = ringR * Math.sin(theta) + 1.0;
        }
      } else {
        // Handle
        const progress = (i - CONFIG.particleCount * 0.7) / (CONFIG.particleCount * 0.3);
        const handleX = (radius * 0.7) + (progress * handleLength);
        const handleY = -(radius * 0.7) - (progress * handleLength);
        
        const thickness = 0.35;
        targetPositions[i * 3] = (handleX - 1.0) + (Math.random() - 0.5) * thickness;
        targetPositions[i * 3 + 1] = (handleY + 1.0) + (Math.random() - 0.5) * thickness;
        targetPositions[i * 3 + 2] = (Math.random() - 0.5) * thickness;
      }
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geo.setAttribute('aRandomSize', new THREE.BufferAttribute(randomSizes, 1));
    
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphFactor: { value: 0 },
    uColor: { value: new THREE.Color(primaryColor) },
    uSecondaryColor: { value: new THREE.Color(secondaryColor) },
    uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 }
  }), [primaryColor, secondaryColor]);

  // Update colors when theme changes
  useEffect(() => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uColor.value = new THREE.Color(primaryColor);
      material.uniforms.uSecondaryColor.value = new THREE.Color(secondaryColor);
    }
  }, [primaryColor, secondaryColor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = t;
      
      // Smoother morph cycle
      let sine = Math.sin(t * CONFIG.cycleSpeed);
      sine = Math.max(-0.85, Math.min(0.85, sine * 1.1)); 
      const morph = (sine + 0.85) / 1.7; 
      
      material.uniforms.uMorphFactor.value = morph;
      
      // Subtle rotation
      mesh.current.rotation.z = Math.sin(t * 0.1) * 0.02;
    }
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <shaderMaterial
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const ScientificBackground = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme-aware colors
  const isDark = resolvedTheme === 'dark';
  const primaryColor = isDark ? '#60A5FA' : '#0A54FF'; // Lighter blue for dark mode
  const secondaryColor = isDark ? '#A78BFA' : '#3B82F6'; // Purple tint for dark, blue for light

  if (!mounted) {
    return (
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      {/* Fallback gradient that shows through */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/5" />
      
      <Suspense fallback={null}>
        <Canvas 
          camera={{ position: [0, 0, 12], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Particles primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </Canvas>
      </Suspense>
    </div>
  );
};
