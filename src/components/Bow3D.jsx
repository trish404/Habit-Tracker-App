import * as THREE from "three";
import { useMemo } from "react";
import { Float } from "@react-three/drei";

/**
 * BloomTrack Bow — v3
 * Cute illustration style:
 *  - Heart-ish puffy loops (Bezier Shape -> shallow Extrude)
 *  - Pill knot (capsule)
 *  - Long, thin, tapered S-curve ribbon tails with V-notch
 * No Blender needed.
 */
export default function Bow3D({
  color = "#ff6ea8",
  roughness = 0.45,
  metalness = 0.0,
  position = [0, 0, 0],
  scale = 1,
  float = { speed: 1.05, rotationIntensity: 0.22, floatIntensity: 0.28 },

  // Loops
  loopWidth = 1.65,
  loopHeight = 1.15,
  loopDepth = 0.08,     // SHALLOW so it’s ribbon-y, not slabs
  innerPinch = 0.22,    // 0..~0.4 — how tight near the knot
  outerRound = 0.65,    // 0..1   — how bulged the outer edge is

  // Knot
  knotRadius = 0.28,
  knotLength = 0.26,

  // Tails
  tailWidth = 0.22,
  tailThickness = 0.035, // very thin
  tailLength = 2.4,
  tailSpread = 0.42,
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness,
        metalness,
        clearcoat: 0.3,
        clearcoatRoughness: 0.6,
        sheen: 0.45,
        sheenRoughness: 0.75,
      }),
    [color, roughness, metalness]
  );

  // ===== Loops (front face outline -> shallow extrude)
  const loopShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = loopWidth;
    const h = loopHeight;
    const p = Math.max(0.12, innerPinch) * w;
    const bulge = outerRound;

    // Start at inner pinch near knot (top half)
    s.moveTo(-p, h * 0.02);
    // Top crest
    s.bezierCurveTo(-p * 0.4, h * 0.45, -w * 0.35, h * 0.95 * bulge, -w * 0.05, h * 0.86);
    // Outer top → outer side
    s.bezierCurveTo(w * 0.18, h * 0.78, w * 0.3, h * 0.45, w * 0.35, h * 0.18);
    // Rounded outer bottom
    s.bezierCurveTo(w * 0.38, -h * 0.05, w * 0.28, -h * 0.28, w * 0.12, -h * 0.38);
    // Inner bottom return
    s.bezierCurveTo(-w * 0.1, -h * 0.42, -p * 0.4, -h * 0.18, -p, -h * 0.04);
    // Close back to pinch
    s.lineTo(-p, h * 0.02);
    return s;
  }, [loopWidth, loopHeight, innerPinch, outerRound]);

  const loopGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(loopShape, {
      depth: loopDepth,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
      curveSegments: 48,
      steps: 1,
    });
    g.center();
    return g;
  }, [loopShape, loopDepth]);

  // ===== Knot (pill/capsule)
  const knotGeo = useMemo(() => {
    if (THREE.CapsuleGeometry) return new THREE.CapsuleGeometry(knotRadius, knotLength, 6, 24);
    const g = new THREE.SphereGeometry(knotRadius, 32, 32);
    g.scale(1.45, 0.9, 1.0);
    return g;
  }, [knotRadius, knotLength]);

  // ===== Ribbon section (flat with V-notch)
  const ribbonSection = useMemo(() => {
    const w = tailWidth, v = Math.min(0.18, w * 0.8);
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, -v);
    sh.lineTo(0, -v * 1.65); // V notch tip
    sh.lineTo(-w / 2, -v);
    sh.lineTo(-w / 2, 0);
    return sh;
  }, [tailWidth]);

  // ===== S-curve paths for tails (long, elegant)
  const makeTailPath = (dir = 1) => {
    const y0 = -0.05;
    const L = tailLength;
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, y0, 0),
        new THREE.Vector3(0.12 * dir, y0 - L * 0.25, -0.02 * dir),
        new THREE.Vector3(-0.10 * dir, y0 - L * 0.55, 0.02 * dir),
        new THREE.Vector3(0.08 * dir, y0 - L * 0.82, -0.02 * dir),
        new THREE.Vector3(0, y0 - L, 0),
      ],
      false,
      "centripetal"
    );
  };

  const tailGeoL = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(ribbonSection, {
      steps: 140,
      depth: tailThickness,
      extrudePath: makeTailPath(-1),
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelSegments: 2,
      curveSegments: 24,
    });
    // Taper: scale vertices along path Y
    g.computeBoundingBox();
    const bb = g.boundingBox;
    const h = bb.max.y - bb.min.y || 1;
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = (pos.getY(i) - bb.min.y) / h; // 0..1
      const t = 0.85 - y * 0.45; // thinner towards the end
      pos.setX(i, (pos.getX(i) - 0) * t);
      pos.setZ(i, (pos.getZ(i) - 0) * t);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [ribbonSection, tailThickness, tailLength]);

  const tailGeoR = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(ribbonSection, {
      steps: 140,
      depth: tailThickness,
      extrudePath: makeTailPath(1),
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelSegments: 2,
      curveSegments: 24,
    });
    g.computeBoundingBox();
    const bb = g.boundingBox;
    const h = bb.max.y - bb.min.y || 1;
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = (pos.getY(i) - bb.min.y) / h;
      const t = 0.85 - y * 0.45;
      pos.setX(i, (pos.getX(i) - 0) * t);
      pos.setZ(i, (pos.getZ(i) - 0) * t);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [ribbonSection, tailThickness, tailLength]);

  return (
    <Float
      speed={float.speed}
      rotationIntensity={float.rotationIntensity}
      floatIntensity={float.floatIntensity}
      position={position}
      scale={scale}
    >
      {/* LEFT loop */}
      <mesh
        geometry={loopGeo}
        material={mat}
        position={[-0.94, 0.25, 0.02]}
        rotation={[0, 0.18, -0.05]}
      />
      {/* RIGHT loop (mirrored) */}
      <mesh
        geometry={loopGeo}
        material={mat}
        position={[0.94, 0.25, 0.02]}
        rotation={[0, -0.18, 0.05]}
        scale={[-1, 1, 1]}
      />

      {/* Pill knot (bigger) */}
      <mesh geometry={knotGeo} material={mat} position={[0, 0.18, 0.06]} />

      {/* Long, thin, wavy tails */}
      <mesh geometry={tailGeoL} material={mat} position={[-tailSpread, -0.05, 0]} />
      <mesh geometry={tailGeoR} material={mat} position={[tailSpread, -0.05, 0]} />
    </Float>
  );
}
