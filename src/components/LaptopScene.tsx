import { Environment, useGLTF, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { resumeFiles, stickers } from "../data/resume";
import type { ResumeRoute, SceneState } from "../types";

const AVATAR_TEXTURE = "./assets/avatar/long-jiao-avatar.webp";
const STICKER_TEXTURES = stickers.map((sticker) => sticker.image);
const STICKER_ARTWORK_ROTATION = Math.PI / 2;
const LID_SURFACE_TILT = 0.35;
const LID_SURFACE_SLOPE = Math.tan(LID_SURFACE_TILT);
const INNER_SURFACE_INTERCEPT = -0.0029;
const OUTER_SURFACE_INTERCEPT = 0.0245;
const COVER_MIN_Y = -0.096;
const COVER_MAX_Y = 0.096;
const COVER_MIN_Z = 0.042;
const COVER_MAX_Z = 0.166;
const FOCUS_CAMERA_ROLL = Math.PI;
const FOCUS_TARGET_WORLD_Y = -0.12;
const SKILLS_TARGET_WORLD_Y = -0.05;

function lidSurfaceX(z: number, surface: "inner" | "outer") {
  const intercept =
    surface === "inner"
      ? INNER_SURFACE_INTERCEPT
      : OUTER_SURFACE_INTERCEPT;
  return intercept + z * LID_SURFACE_SLOPE;
}

interface LaptopRig {
  root: THREE.Group;
  hinge: THREE.Group;
  avatar: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  stickerMeshes: Map<
    string,
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  >;
}

function createSurfacePlane(
  width: number,
  height: number,
  texture: THREE.Texture,
  materialOptions: Partial<THREE.MeshBasicMaterialParameters> = {},
) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.025,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    side: THREE.DoubleSide,
    toneMapped: false,
    ...materialOptions,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.rotation.y = -Math.PI / 2;
  return mesh;
}

function LaptopModel({
  sceneState,
  reducedMotion,
  onReady,
}: {
  sceneState: SceneState;
  reducedMotion: boolean;
  onReady: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF("./assets/models/laptop.glb") as unknown as {
    scene: THREE.Group;
  };
  const loadedTextures = useTexture([
    AVATAR_TEXTURE,
    ...STICKER_TEXTURES,
  ]) as THREE.Texture[];
  const avatarTexture = loadedTextures[0];
  const stickerTextures = loadedTextures.slice(1);

  const rig = useMemo<LaptopRig>(() => {
    [avatarTexture, ...stickerTextures].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    });
    avatarTexture.center.set(0.5, 0.5);
    avatarTexture.rotation = -Math.PI / 2;
    avatarTexture.needsUpdate = true;
    stickerTextures.forEach((texture) => {
      texture.center.set(0.5, 0.5);
      texture.rotation = STICKER_ARTWORK_ROTATION;
      texture.needsUpdate = true;
    });

    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        const sourceMaterial = object.material as THREE.MeshStandardMaterial;
        if (sourceMaterial?.clone) {
          const material = sourceMaterial.clone();
          material.roughness = 0.5;
          material.metalness = 0.38;
          object.material = material;
        }
      }
    });

    const lid = clone.getObjectByName("Box072");
    const lidParent = lid?.parent;
    if (!lid || !lidParent) {
      throw new Error("Laptop lid mesh was not found in the GLTF.");
    }

    const hinge = new THREE.Group();
    hinge.name = "LaptopLidHinge";
    hinge.position.set(0.055, 0, -0.0914);
    const originalPosition = lid.position.clone();
    lidParent.add(hinge);
    hinge.add(lid);
    lid.position.copy(originalPosition.sub(hinge.position));

    const screenCenterZ = 0.105;
    const screenBacking = new THREE.Mesh(
      new THREE.PlaneGeometry(0.154, 0.21),
      new THREE.MeshBasicMaterial({
        color: "#020304",
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    screenBacking.name = "LaptopScreenBacking";
    screenBacking.position.set(
      lidSurfaceX(screenCenterZ, "inner") - 0.00035,
      0,
      screenCenterZ,
    );
    screenBacking.rotation.y = -Math.PI / 2 + LID_SURFACE_TILT;
    hinge.add(screenBacking);

    const avatar = createSurfacePlane(0.142, 0.196, avatarTexture, {
      opacity: 0,
    });
    avatar.name = "LaptopAvatarScreen";
    avatar.position.set(
      lidSurfaceX(screenCenterZ, "inner") - 0.00075,
      0,
      screenCenterZ,
    );
    avatar.rotation.y = -Math.PI / 2 + LID_SURFACE_TILT;
    avatar.renderOrder = 3;
    hinge.add(avatar);

    const stickerMeshes = new Map<
      string,
      THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    >();
    stickers.forEach((sticker, index) => {
      const centerX = sticker.x + sticker.width / 2;
      const centerY = sticker.y + sticker.width / 2;
      const normalizedX = THREE.MathUtils.clamp((centerX - 15) / 78, 0, 1);
      const normalizedY = THREE.MathUtils.clamp((centerY - 14) / 78, 0, 1);
      const width = (sticker.width / 100) * 0.135;
      const halfWidth = width / 2;
      const mappedY = THREE.MathUtils.lerp(
        COVER_MAX_Y,
        COVER_MIN_Y,
        normalizedX,
      );
      const mappedZ = THREE.MathUtils.lerp(
        COVER_MAX_Z,
        COVER_MIN_Z,
        normalizedY,
      );
      const surfaceY = THREE.MathUtils.clamp(
        mappedY,
        COVER_MIN_Y + halfWidth,
        COVER_MAX_Y - halfWidth,
      );
      const surfaceZ = THREE.MathUtils.clamp(
        mappedZ,
        COVER_MIN_Z + halfWidth,
        COVER_MAX_Z - halfWidth,
      );
      const mesh = createSurfacePlane(width, width, stickerTextures[index], {
        opacity: 0,
      });
      mesh.name = `LaptopSticker-${sticker.id}`;
      mesh.position.set(
        lidSurfaceX(surfaceZ, "outer") + 0.00045,
        surfaceY,
        surfaceZ,
      );
      mesh.rotation.x = THREE.MathUtils.degToRad(sticker.rotation);
      mesh.rotation.y = Math.PI / 2 + LID_SURFACE_TILT;
      mesh.renderOrder = 4;
      mesh.userData.baseScale = 1;
      hinge.add(mesh);
      stickerMeshes.set(sticker.id, mesh);
    });

    return { root: clone, hinge, avatar, stickerMeshes };
  }, [gltf.scene, loadedTextures]);

  const closed = sceneState !== "none" && sceneState !== "summary";
  const selectedFile =
    sceneState !== "none" ? resumeFiles[sceneState as ResumeRoute] : null;
  const focusedSticker = selectedFile?.stickerId ?? null;
  const focusDescriptor = focusedSticker
    ? stickers.find((sticker) => sticker.id === focusedSticker)
    : null;
  const focusWorldPosition = useMemo(() => new THREE.Vector3(), []);
  const skillsWorldBox = useMemo(() => new THREE.Box3(), []);
  const skillsWorldCenter = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const rate = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.2);

    const focusCenterX = focusDescriptor
      ? focusDescriptor.x + focusDescriptor.width / 2
      : 50;
    const focusCenterY = focusDescriptor
      ? focusDescriptor.y + focusDescriptor.width / 2
      : 50;
    const targetRotation = closed
      ? new THREE.Euler(0.25, 1.5, -Math.PI / 2)
      : new THREE.Euler(0.25, 1.5, 0);
    const targetPosition = closed
      ? focusDescriptor
        ? new THREE.Vector3(
            group.position.x,
            group.position.y,
            -0.063 -
              (focusCenterX - 54) * 0.0012 +
              (focusCenterY - 53) * 0.0012,
          )
        : new THREE.Vector3(group.position.x, group.position.y, -0.086)
      : new THREE.Vector3(0, -0.48, 0);
    const targetScale = focusDescriptor ? 7.2 : closed ? 5.6 : 5.9;

    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      closed ? FOCUS_CAMERA_ROLL : 0,
      rate,
    );
    camera.updateMatrixWorld();
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      targetRotation.x,
      rate,
    );
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      targetRotation.y,
      rate,
    );
    group.rotation.z = THREE.MathUtils.lerp(
      group.rotation.z,
      targetRotation.z,
      rate,
    );
    group.position.lerp(targetPosition, rate);
    const scale = THREE.MathUtils.lerp(group.scale.x, targetScale, rate);
    group.scale.setScalar(scale);

    rig.hinge.rotation.y = THREE.MathUtils.lerp(
      rig.hinge.rotation.y,
      closed ? Math.PI / 2 : 0,
      rate,
    );

    if (focusedSticker) {
      const focusMesh = rig.stickerMeshes.get(focusedSticker);
      if (focusMesh) {
        group.updateMatrixWorld(true);
        focusMesh.getWorldPosition(focusWorldPosition);
        group.position.x += -focusWorldPosition.x * rate;
        group.position.y +=
          (FOCUS_TARGET_WORLD_Y - focusWorldPosition.y) * rate;
      }
    } else if (sceneState === "skills") {
      group.updateMatrixWorld(true);
      skillsWorldBox.setFromObject(rig.hinge).getCenter(skillsWorldCenter);
      group.position.x += -skillsWorldCenter.x * rate;
      group.position.y +=
        (SKILLS_TARGET_WORLD_Y - skillsWorldCenter.y) * rate;
    }

    rig.avatar.material.opacity = THREE.MathUtils.lerp(
      rig.avatar.material.opacity,
      sceneState === "summary" ? 1 : 0,
      rate,
    );
    rig.avatar.material.visible = rig.avatar.material.opacity > 0.01;

    rig.stickerMeshes.forEach((mesh, id) => {
      const isMatch = !focusedSticker || focusedSticker === id;
      const targetOpacity = closed ? (isMatch ? 1 : 0.12) : 0;
      const targetStickerScale = focusedSticker === id ? 1.08 : 1;
      mesh.material.opacity = THREE.MathUtils.lerp(
        mesh.material.opacity,
        targetOpacity,
        rate,
      );
      mesh.material.visible = mesh.material.opacity > 0.01;
      const stickerScale = THREE.MathUtils.lerp(
        mesh.scale.x,
        targetStickerScale,
        rate,
      );
      mesh.scale.setScalar(stickerScale);
    });
  });

  return (
    <group ref={groupRef} scale={6.2} position={[0, -0.34, 0]}>
      <primitive object={rig.root} />
    </group>
  );
}

export function LaptopScene({
  sceneState,
  reducedMotion,
  active,
  onReady,
}: {
  sceneState: SceneState;
  reducedMotion: boolean;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 3.6], fov: 35 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <ambientLight intensity={1.45} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.2}
        color="#dbe8ff"
        castShadow
      />
      <pointLight position={[-3, 1, 2]} intensity={1.3} color="#7cefff" />
      <pointLight position={[2, -1, 2]} intensity={0.7} color="#8b7cff" />
      <Suspense fallback={null}>
        <LaptopModel
          sceneState={sceneState}
          reducedMotion={reducedMotion}
          onReady={onReady}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("./assets/models/laptop.glb");
useTexture.preload([AVATAR_TEXTURE, ...STICKER_TEXTURES]);
