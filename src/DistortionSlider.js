import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, ShaderMaterial, PlaneGeometry } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContext } from 'react';
import { LenisContext } from './App'; // Assuming App.js provides Lenis

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  uniform float uVelo;
  varying vec2 vUv;
  #define M_PI 3.1415926535897932384626433832795
  void main() {
    vec3 pos = position;
    pos.x += sin(uv.y * M_PI) * uVelo * 0.125;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMeshSize;
  uniform vec2 uImageSize;
  uniform float uVelo;
  uniform float uScale;
  varying vec2 vUv;

  vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio = imageSize.x / imageSize.y;
    vec2 newSize = screenRatio < imageRatio ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y) : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
    vec2 newOffset = (screenRatio < imageRatio ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    return uv * screenSize / newSize + newOffset;
  }

  void main() {
    vec2 uv = vUv;
    vec2 texCenter = vec2(0.5);
    vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
    vec2 texScale = (texUv - texCenter) * uScale + texCenter;
    vec4 texture = texture2D(uTexture, texScale);
    texScale.x += 0.15 * uVelo;
    if (uv.x < 1.0) texture.g = texture2D(uTexture, texScale).g;
    texScale.x += 0.10 * uVelo;
    if (uv.x < 1.0) texture.b = texture2D(uTexture, texScale).b;
    gl_FragColor = texture;
  }
`;

const Plane = ({ url, position, size, veloRef }) => {
  const meshRef = useRef();
  const { viewport } = useThree();
  const texture = new TextureLoader().load(url);
  const material = new ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uMeshSize: { value: [size[0], size[1]] },
      uImageSize: { value: [texture.image.width, texture.image.height] },
      uVelo: { value: 0 },
      uScale: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  useFrame(() => {
    material.uniforms.uVelo.value = veloRef.current * 0.0005;
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <planeGeometry args={[size[0], size[1], 32, 32]} />
    </mesh>
  );
};

const DistortionSlider = ({ images }) => {
    const containerRef = useRef();
    const groupRef = useRef();
    const veloRef = useRef(0);
    const lenis = useContext(LenisContext);
    const [totalWidth, setTotalWidth] = useState(0);
  
    useEffect(() => {
      let widths = images.map((img) => img.width || 400);
      setTotalWidth(widths.reduce((a, b) => a + b + 15, 0));
  
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: () => `+=${totalWidth - window.innerWidth}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          gsap.to(groupRef.current.position, { x: -self.progress * (totalWidth - window.innerWidth), duration: 0 });
        },
      });
  
      lenis?.on('scroll', ({ velocity }) => {
        veloRef.current = velocity;
      });
  
      return () => st.kill();
    }, [totalWidth, lenis, images]);
  
    let posX = 0;
    const planes = images.map((img, i) => {
      const pos = [posX + (img.width || 400) / 2, img.align === 'flex-end' ? -((400 - (img.height || 400)) / 2) : (img.align === 'flex-start' ? ((400 - (img.height || 400)) / 2) : 0), 0];
      posX += (img.width || 400) + 15;
      return <Plane key={i} url={img.url} position={pos} size={[img.width || 400, img.height || 400]} veloRef={veloRef} />;
    });
  
    return (
      <div ref={containerRef} style={{ height: '100vh', width: '100%', position: 'relative' }}>
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} orthographic camera={{ near: 0, far: 1000, position: [0, 0, 1] }}>
          <group ref={groupRef}>{planes}</group>
        </Canvas>
      </div>
    );
  };

export default DistortionSlider;