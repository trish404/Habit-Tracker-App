// src/pages/Landing.jsx
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef, useMemo, useState, Suspense } from "react";
import { gsap } from "gsap";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";

/* ---------------- Bow ---------------- */
function BowGLB({
  path = "/models/bow.glb",
  targetHeight = 18,
  extraScale = 1.25,
  orientation = [0, Math.PI / 2, 0],
  keepOriginalMaterials = true,
  colorOverride,
  ...props
}) {
  const { scene } = useGLTF(path);
  const bow = useMemo(() => scene.clone(true), [scene]);
  

  useMemo(() => {
    bow.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(bow);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // center the model
    bow.position.sub(center);

    // scale to target height
    const h = size.y || 1;
    const s = (targetHeight / h) * extraScale;
    bow.scale.setScalar(s);

    // initial orientation
    bow.rotation.set(orientation[0], orientation[1], orientation[2]);

    // materials
    bow.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = false;
      o.receiveShadow = false;

      if (!keepOriginalMaterials || colorOverride) {
        o.material = new THREE.MeshPhysicalMaterial({
          color: colorOverride ?? "#ffc1d9",
          roughness: 0.45,
          metalness: 0,
          clearcoat: 0.25,
          clearcoatRoughness: 0.6,
          sheen: 0.4,
          sheenRoughness: 0.7,
          emissive: new THREE.Color("#ff8fbf"),
          emissiveIntensity: 0.12,
        });
      } else {
        o.material.metalness = o.material.metalness ?? 0;
        o.material.roughness = Math.min(0.7, o.material.roughness ?? 0.45);
        if (colorOverride && o.material.color) o.material.color.set(colorOverride);
        if ("emissive" in o.material) {
          o.material.emissive = new THREE.Color("#ff8fbf");
          o.material.emissiveIntensity = 0.12;
        }
      }
    });
  }, [bow, targetHeight, extraScale, orientation, keepOriginalMaterials, colorOverride]);

  return <primitive object={bow} {...props} />;
}

/* report bow rect + camera-relative yaw + back/face state */
function BowScreenTracker({ bowRef, onRect }) {
  const { camera, size } = useThree();
  const tmpQ = new THREE.Quaternion();
  const worldPos = new THREE.Vector3();

  useFrame(() => {
    const g = bowRef.current;
    if (!g) return;

    // compute screen-space bbox
    const box = new THREE.Box3().setFromObject(g);
    if (!isFinite(box.min.x) || !isFinite(box.max.x)) return;

    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    corners.forEach((v) => {
      const p = v.clone().project(camera);
      const x = (p.x * 0.5 + 0.5) * size.width;
      const y = (1 - (p.y * 0.5 + 0.5)) * size.height;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    // orientation relative to camera
    g.getWorldPosition(worldPos);
    const toCam = camera.position.clone().sub(worldPos);
    const azimuth = Math.atan2(toCam.x, toCam.z); // yaw around Y axis

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(tmpQ));
    const backFacing = forward.dot(toCam.clone().normalize()) < 0;

    onRect({
      minX,
      maxX,
      minY,
      maxY,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      vw: size.width,
      vh: size.height,
      angleY: azimuth,
      backFacing,
    });
  });

  return null;
}

/* ---------------- Page ---------------- */
export default function Landing() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // refs for entrance animation
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const btnLearnRef = useRef(null);
  const btnStartRef = useRef(null);
  const heroRightRef = useRef(null);

  const bowGroupRef = useRef(null);

  // positions of left/right text blocks (computed from bow bbox)
  const [leftStyle, setLeftStyle] = useState({ top: "50%", right: "52%", transform: "translateY(-50%)" });
  const [rightStyle, setRightStyle] = useState({ top: "50%", left: "52%", transform: "translateY(-50%)" });

  // unified overlay that rotates/mirrors BOTH blocks as a single unit
  const [unitStyle, setUnitStyle] = useState({
    position: "absolute",
    inset: 0,
    transform: "rotateY(0rad)",
    transformStyle: "preserve-3d",
    backfaceVisibility: "visible",
    pointerEvents: "none",
    zIndex: 10,
  });

  const [backFacing, setBackFacing] = useState(false);

  // intro animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Verify all refs exist before animating
      const elements = [
        heroRightRef.current,
        titleRef.current, 
        textRef.current,
        btnLearnRef.current,
        btnStartRef.current
      ].filter(Boolean); // Remove null values
      
      // Only proceed if we have elements to animate
      if (elements.length === 0) return;
  
      gsap.set(elements, { opacity: 0, y: 18 });
  
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(heroRightRef.current || {}, { opacity: 1, y: 0, duration: 0.55 })
        .to(titleRef.current || {}, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to(textRef.current || {}, { opacity: 1, y: 0, duration: 0.45 }, "-=0.2")
        .to(
          [btnLearnRef.current || {}, btnStartRef.current || {}], 
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, 
          "-=0.22"
        );
    }, containerRef);
    
    return () => ctx.revert();
    }, []);
  // update positions + one-unit rotation/mirroring
  const onRect = ({ minX, maxX, cy, vw, angleY, backFacing }) => {
    const GAP = 10;

    setRightStyle({
      position: "absolute",
      top: `${cy}px`,
      left: `${maxX + GAP}px`,
      transform: "translateY(-50%)",
      textAlign: "left",
      maxWidth: "38vw",
    });

    const rightPx = Math.max(vw - minX + GAP, 0);
    setLeftStyle({
      position: "absolute",
      top: `${cy}px`,
      right: `${rightPx}px`,
      transform: "translateY(-50%)",
      textAlign: "right",
      maxWidth: "34vw",
    });

    setUnitStyle((s) => ({
      ...s,
      transform: `rotateY(${-angleY}rad) ${backFacing ? "scaleX(-1)" : ""}`,
    }));
    setBackFacing(backFacing);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
      style={{ perspective: "1200px" }}
    >
      {/* 3D layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0.25, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMappingExposure: 1.25 }}
        >
          <hemisphereLight skyColor={"#ffe3f0"} groundColor={"#ffffff"} intensity={0.6} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 5]} intensity={0.8} />
          <Environment preset="dawn" />

          {/* globe-like spin: rotate only while dragging; no pan/zoom/inertia */}
          <OrbitControls
            makeDefault
            enableRotate
            enablePan={false}
            enableZoom={false}
            enableDamping={false}
            target={[0, 0.2, -0.4]}
          />

          <Suspense fallback={
            <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#fff"}}>
              Loading…
            </div>
          }>

            <group ref={bowGroupRef} position={[0, 0.2, -0.4]}>
              <BowGLB path="/models/bow.glb" targetHeight={18} extraScale={1.38} orientation={[0, Math.PI / 2, 0]} />
            </group>

            <BowScreenTracker bowRef={bowGroupRef} onRect={onRect} />
          </Suspense>
        </Canvas>
      </div>

      {/* nav */}
      <header className="absolute top-6 left-0 right-0 flex items-center justify-between px-6 md:px-10 z-10">
        <div className="text-base md:text-lg font-semibold text-pink-400">Blush & Bloom</div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-300">
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
        </nav>
      </header>

      {/* ONE unified overlay that rotates/mirrors BOTH blocks together with the bow */}
      <div style={unitStyle}>
        {/* RIGHT block */}
        <div className="pointer-events-none" style={rightStyle}>
          {backFacing ? (
            // Back view: RIGHT shows the (mirrored via container) left content
            <div>
              <p
                
                className="text-[clamp(0.95rem,1.4vw,1.125rem)] text-gray-300 max-w-[34ch] ml-auto text-right"
              >
                Your personalized lifestyle tracker — habits, books, spending, and more.
              </p>
              <div className="mt-4 flex items-center gap-3 justify-end">
                
              </div>
            </div>
            
          ) : (
            // Front view: RIGHT = big title
            <h1
              ref={heroRightRef}
              className="text-[clamp(1.8rem,5.2vw,4.8rem)] font-extrabold tracking-tight text-white drop-shadow-lg leading-tight"
            >
              Blush & Bloom
            </h1>
          )}
        </div>

        {/* LEFT block */}
        <div style={leftStyle}>
          {backFacing ? (
            // Back view: LEFT = big title (mirrored via container)
            <h1
              ref={titleRef}
              className="text-[clamp(1.8rem,5.2vw,4.8rem)] font-extrabold tracking-tight text-white drop-shadow-lg leading-tight text-left"
            >
              Blush & Bloom
            </h1>
          ) : (
            // Front view: LEFT = tagline + buttons
            <>
              <p
                ref={textRef}
                className="text-[clamp(1.8rem,5.2vw,4.8rem)] font-extrabold tracking-tight text-white drop-shadow-lg leading-tight text-left"
              >
                Welcome to 
              </p>
              <div className="mt-4 flex items-center gap-3 justify-end">
              </div>
            </>
          )}
        </div>
      </div>
      <div
        style={{
        position: "absolute",
        right: 24,
        bottom: 28,
        zIndex: 20,
        pointerEvents: "auto",
        }}
      >
        <button
          className="px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-md hover:brightness-110 transition-all"
          onClick={() => navigate("/get-started")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

useGLTF.preload("/models/bow.glb");
