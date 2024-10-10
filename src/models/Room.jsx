import { FontLoader } from "three/addons/loaders/FontLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import * as THREE from "three";
import { useRef, useEffect, useState } from "react";
// import {} from "react-spring";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import room from "../../public/models/room.glb";
import { a } from "@react-spring/three";
import videoR from "../../public/textures/arcane1.mp4";
// import videoL from "../../public/textures/arcane2.mp4";
// import unione from "../assets/fonts/unione.json";
// import helvatica from "../assets/fonts/helvatica.json";
// import { DirectionalLight, AmbientLight } from "three";

const Room = (
  isRotating,
  setIsRotating,
  setCurrentStage,
  // roomPosition,
  props
) => {
  const roomRef = useRef();
  const videoRef = useRef(null);
  const { gl, viewport } = useThree();
  const { nodes, materials, animations } = useGLTF(room);
  // const { actions } = useAnimations(animations, roomRef);
  const roomPosition = [-0.01, -0.6, 3.6];
  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;
  const switchRef = useRef();

  // Estado del tema

  const { scene } = useThree();
  const titleRef = useRef();
  const subtitleRef = useRef();

  const fanRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!animations) return;

    const clipNames = [
      "fan_rotation",
      "fan_rotation.001",
      "fan_rotation.002",
      "fan_rotation.003",
      "fan_rotation.004",
    ];

    const mixers = [];
    const clock = new THREE.Clock();

    clipNames.forEach((clipName, index) => {
      const clip = THREE.AnimationClip.findByName(animations, clipName);
      if (clip && fanRefs[index].current) {
        const mixer = new THREE.AnimationMixer(fanRefs[index].current);
        mixers.push(mixer);

        const action = mixer.clipAction(clip);
        action.play();

        // Debugging animation state
        console.log(`Playing animation: ${clipName}`, action);
      }
    });

    const animate = () => {
      const delta = clock.getDelta();
      mixers.forEach((mixer) => mixer.update(delta));
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mixers.forEach((mixer) => {
        mixer.stopAllAction();
        mixer.uncacheRoot(mixer.getRoot());
      });
    };
  }, [animations, fanRefs]);

  useEffect(() => {
    const loader = new FontLoader();

    loader.load("fonts/unione.json", (font) => {
      const textMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
      ];

      const titleGeo = new TextGeometry("Keven Reyes", {
        font: font,
        size: 0.1, // Aumenta el tamaño
        height: 0.01,
      });

      const titleMesh = new THREE.Mesh(titleGeo, textMaterials);
      titleMesh.rotation.y = Math.PI * 0.5;
      titleMesh.position.set(-0.35, 0.73, 0.5); // Ajusta las posiciones

      if (titleRef.current) {
        titleRef.current.add(titleMesh);
      }
    });

    loader.load("fonts/helvatica.json", (font) => {
      const textMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
      ];

      const subTitleGeo = new TextGeometry(
        "Electronic Engineer / Software Developer",
        {
          font: font,
          size: 0.04, // Aumenta el tamaño
          height: 0,
        }
      );

      const subtitleMesh = new THREE.Mesh(subTitleGeo, textMaterials);
      subtitleMesh.rotation.y = Math.PI * 0.5;
      subtitleMesh.position.set(-0.2, 0.42, 0.51); // Ajusta las posiciones

      if (subtitleRef.current) {
        subtitleRef.current.add(subtitleMesh);
      }
    });
  }, [scene]);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoR; // Asegúrate de que videoR esté definido
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.encoding = THREE.sRGBEncoding;

    if (videoRef.current) {
      videoRef.current.material = new THREE.MeshBasicMaterial({
        map: videoTexture,
      });
      video.play();
    }

    return () => {
      video.pause();
      video.src = "";
    };
  }, [videoR]);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);

    // Guarda la posición del mouse cuando se presiona
    const clientX = event.clientX || event.touches?.[0]?.clientX;
    lastX.current = clientX;
  };

  // Handle pointer (mouse or touch) up event
  const handlePointerUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);
  };

  // Handle pointer (mouse or touch) move event
  const handlePointerMove = (event) => {
    if (isRotating) return; // Solo rota si el mouse está presionado
    event.stopPropagation();
    event.preventDefault();

    // Obtiene la posición actual del mouse
    const clientX = event.clientX || event.touches?.[0]?.clientX;
    const delta = (clientX - lastX.current) / viewport.width;

    // Rota el objeto en función del movimiento del mouse
    roomRef.current.rotation.y += delta * 0.01 * Math.PI;

    // Actualiza la posición del mouse para la siguiente iteración
    lastX.current = clientX;

    // Actualiza la velocidad de rotación
    rotationSpeed.current = delta * 0.01 * Math.PI;
  };

  // Handle keydown events
  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      if (!isRotating) setIsRotating(true);

      roomRef.current.rotation.y += 0.005 * Math.PI;
      rotationSpeed.current = 0.007;
    } else if (event.key === "ArrowRight") {
      if (!isRotating) setIsRotating(true);

      roomRef.current.rotation.y -= 0.005 * Math.PI;
      rotationSpeed.current = -0.007;
    }
  };

  // Handle keyup events
  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setIsRotating(false);
    }
  };

  // Touch events for mobile devices
  const handleTouchStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    lastX.current = clientX;
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(false);
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isRotating) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = (clientX - lastX.current) / viewport.width;

      roomRef.current.rotation.y += delta * 0.01 * Math.PI;
      lastX.current = clientX;
      rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  };

  useEffect(() => {
    // Add event listeners for pointer and keyboard events
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchmove", handleTouchMove);

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  useEffect(() => {
    if (roomRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
      );

      // Cambiar el color de los altavoces
      const speakerR = roomRef.current.getObjectByName("Speaker-R");
      const speakerL = roomRef.current.getObjectByName("Speaker-L");
      const CPU = roomRef.current.getObjectByName("CPU");

      if (speakerR) {
        speakerR.material.color.set("#FFff"); // Cambia a rojo
      }
      if (CPU) {
        CPU.material[0] = new THREE.MeshPhysicalMaterial();
        CPU.material[0].roughness = 0;
        CPU.material[0].color.set(0x999999);
        CPU.material[0].ior = 3;
        CPU.material[0].transmission = 2;
        CPU.material[0].opacity = 0.8;
        CPU.material[0].depthWrite = false;
        CPU.material[0].depthTest = false;
        CPU.material[0] = new THREE.MeshPhysicalMaterial();
        CPU.material.roughness = 0;
        CPU.material.color.set(0x999999);
        CPU.material.ior = 3;
        CPU.material.transmission = 1;
        CPU.material.opacity = 0.8;
        CPU.material.depthWrite = false;
        CPU.material.depthTest = false;
        CPU.material.color.set("#FFFF"); // Cambia a verde
      }
      if (speakerL) {
        speakerL.material.color.set("#1111"); // Cambia a verde
      }

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const roomLight = new THREE.PointLight(0xffffff, 2.5, 10);
      roomLight.position.set(0.3, 2, 0.5);
      roomLight.castShadow = true;
      roomLight.shadow.radius = 5;
      roomLight.shadow.mapSize.width = 2048;
      roomLight.shadow.mapSize.height = 2048;
      roomLight.shadow.camera.far = 2.5;
      // roomLight.shadow.camera.fov = 100;
      roomLight.shadow.bias = -0.002;
      scene.add(roomLight);
      // add light for pc fans
      const fanLight1 = new THREE.PointLight(0xff0000, 30, 0.2);
      const fanLight2 = new THREE.PointLight(0x00ff00, 30, 0.12);
      const fanLight3 = new THREE.PointLight(0x00ff00, 30, 0.2);
      const fanLight4 = new THREE.PointLight(0x00ff00, 30, 0.2);
      const fanLight5 = new THREE.PointLight(0x00ff00, 30, 0.05);
      fanLight1.position.set(0, 0.29, -0.29);
      fanLight2.position.set(-0.15, 0.29, -0.29);
      fanLight3.position.set(0.21, 0.29, -0.29);
      fanLight4.position.set(0.21, 0.19, -0.29);
      fanLight5.position.set(0.21, 0.08, -0.29);
      scene.add(fanLight1);
      scene.add(fanLight2);
      scene.add(fanLight3);
      scene.add(fanLight4);
      scene.add(fanLight5);
      // add point light for text on wall
      const pointLight1 = new THREE.PointLight(0xff0000, 0, 1.1);
      const pointLight2 = new THREE.PointLight(0xff0000, 0, 1.1);
      const pointLight3 = new THREE.PointLight(0xff0000, 0, 1.1);
      const pointLight4 = new THREE.PointLight(0xff0000, 0, 1.1);
      pointLight1.position.set(-0.2, 0.6, 0.24);
      pointLight2.position.set(-0.2, 0.6, 0.42);
      pointLight3.position.set(-0.2, 0.6, 0.01);
      pointLight4.position.set(-0.2, 0.6, -0.14);
      scene.add(pointLight1);
      scene.add(pointLight2);
      scene.add(pointLight3);
      scene.add(pointLight4);
    }
  }, [roomRef]);

  return (
    <a.group ref={roomRef} position={roomPosition} {...props}>
      <group name="Scene">
        <mesh
          name="Table"
          ref={titleRef}
          geometry={nodes.Table.geometry}
          material={materials.Table}
          position={[0.073, -0.099, 0.13]}
        />
        <mesh
          name="Stand"
          ref={subtitleRef}
          geometry={nodes.Stand.geometry}
          material={materials.Black}
          position={[-0.059, 0.054, 0.168]}
        >
          <mesh
            ref={videoRef}
            name="Monitor"
            geometry={nodes.Monitor.geometry}
            material={materials.Screen}
            position={[0.022, 0.182, 0]}
          />
          <mesh
            name="Pc"
            geometry={nodes.Pc.geometry}
            material={materials.Glass}
            position={[0.022, 0.133, 0]}
          />
        </mesh>
        <mesh
          name="Speaker-R"
          geometry={nodes["Speaker-R"].geometry}
          material={materials.Coffe}
          position={[-0.136, 0.054, 0.026]}
          scale={[1, 1, 1.186]}
        />
        <mesh
          name="Speaker-L"
          geometry={nodes["Speaker-L"].geometry}
          material={materials.Coffe}
          position={[-0.136, 0.054, 0.312]}
          scale={[1, 1, 1.186]}
        />
        <mesh
          name="Rubik_Cube"
          geometry={nodes.Rubik_Cube.geometry}
          material={materials["Rubik Cube"]}
          position={[0.005, 0.035, -0.118]}
          rotation={[0, 0.584, 0]}
          scale={1.055}
        />
        <mesh
          name="Plant_Pot"
          geometry={nodes.Plant_Pot.geometry}
          material={materials.Pot}
          position={[0.069, -0.404, -0.696]}
        >
          <mesh
            name="Plant"
            geometry={nodes.Plant.geometry}
            material={materials.Leaf}
            position={[0.004, 0.046, 0]}
            scale={0.825}
          />
          <mesh
            name="Pot_Soil"
            geometry={nodes.Pot_Soil.geometry}
            material={materials.Soil}
            position={[0, 0.032, 0]}
            scale={1.09}
          />
        </mesh>
        <group name="Pencil" position={[-0.206, 0.115, 0.527]}>
          <mesh
            name="Cylinder005"
            geometry={nodes.Cylinder005.geometry}
            material={materials.Soil}
          />
          <mesh
            name="Cylinder005_1"
            geometry={nodes.Cylinder005_1.geometry}
            material={materials.Pink}
          />
        </group>
        <group name="Pencil001" position={[-0.193, 0.144, 0.48]}>
          <mesh
            name="Cylinder003"
            geometry={nodes.Cylinder003.geometry}
            material={materials.Black}
          />
          <mesh
            name="Cylinder003_1"
            geometry={nodes.Cylinder003_1.geometry}
            material={materials.Pot}
          />
        </group>
        <mesh
          name="Mouse"
          castShadow
          geometry={nodes.Mouse.geometry}
          material={materials.Coffe}
          position={[0.095, 0.025, -0.031]}
        />
        <mesh
          name="Mobile"
          castShadow
          geometry={nodes.Mobile.geometry}
          material={materials["Mobile Cover"]}
          position={[0.2, 0.02, 0.181]}
        >
          <mesh
            name="Mobile_Screen"
            castShadow
            geometry={nodes.Mobile_Screen.geometry}
            material={materials["Material.001"]}
            position={[0, 0.001, 0]}
          />
        </mesh>
        <mesh
          name="Keyboard"
          castShadow
          geometry={nodes.Keyboard.geometry}
          material={materials.Coffe}
          position={[0.084, 0.03, 0.237]}
        />
        <mesh
          name="Glass"
          castShadow
          geometry={nodes.Glass.geometry}
          material={materials.Black}
          position={[-0.193, 0.048, 0.508]}
        />
        <mesh
          name="CPU"
          castShadow
          geometry={nodes.CPU.geometry}
          material={materials.Black}
          position={[0.015, 0.13, -0.281]}
        >
          <mesh
            name="CPU_Glass"
            castShadow
            geometry={nodes.CPU_Glass.geometry}
            material={materials.Black}
            position={[0.206, 0.069, -0.007]}
          />
          <mesh
            name="CPU_Glass001"
            castShadow
            geometry={nodes.CPU_Glass001.geometry}
            material={nodes.CPU_Glass001.material}
            position={[-0.015, 0.07, 0.065]}
          />
          <mesh
            name="CPU_Part001"
            castShadow
            geometry={nodes.CPU_Part001.geometry}
            material={materials.Coffe}
            position={[-0.103, 0.061, -0.033]}
          />
          <mesh
            name="CPU_Part002"
            castShadow
            geometry={nodes.CPU_Part002.geometry}
            material={materials.Screen}
            position={[-0.116, 0.07, -0.011]}
          />
          <mesh
            name="CPU_Part003"
            castShadow
            geometry={nodes.CPU_Part003.geometry}
            material={materials.Coffe}
            position={[-0.103, 0.079, -0.033]}
          />
          <mesh
            name="CPU_Part005"
            castShadow
            geometry={nodes.CPU_Part005.geometry}
            material={materials.Glass}
            position={[-0.097, 0.152, 0.03]}
          />
          <mesh
            name="CPU_Part"
            castShadow
            geometry={nodes.CPU_Part.geometry}
            material={materials.Screen}
            position={[-0.074, -0.069, -0.022]}
          />
          <mesh
            name="Fan"
            // ref={fanRefs[0]}
            castShadow
            geometry={nodes.Fan.geometry}
            material={materials.Glass}
            position={[-0.203, 0.171, -0.009]}
          >
            <mesh
              name="CPU009"
              castShadow
              geometry={nodes.CPU009.geometry}
              material={materials.Light}
              position={[0.011, 0, 0]}
            />
            <mesh
              name="CPU010"
              ref={fanRefs[4]}
              castShadow
              geometry={nodes.CPU010.geometry}
              material={materials["Red Glow"]}
              position={[0.009, 0, 0]}
            />
          </mesh>
          <mesh
            name="Fan001"
            castShadow
            geometry={nodes.Fan001.geometry}
            material={materials.Glass}
            position={[0.183, 0.157, -0.009]}
          >
            <mesh
              name="CPU012"
              ref={fanRefs[3]}
              castShadow
              geometry={nodes.CPU012.geometry}
              material={materials["Red Glow"]}
              position={[0.009, 0, 0]}
            />
            <mesh
              name="CPU013"
              castShadow
              geometry={nodes.CPU013.geometry}
              material={materials.Light}
              position={[0.009, 0, 0]}
            />
          </mesh>
          <mesh
            name="Fan002"
            castShadow
            geometry={nodes.Fan002.geometry}
            material={materials.Glass}
            position={[0.183, 0.053, -0.009]}
          >
            <mesh
              name="CPU015"
              ref={fanRefs[2]}
              castShadow
              geometry={nodes.CPU015.geometry}
              material={materials["Red Glow"]}
              position={[0.009, 0, 0]}
            />
            <mesh
              name="CPU016"
              castShadow
              geometry={nodes.CPU016.geometry}
              material={materials.Light}
              position={[0.009, 0, 0]}
            />
          </mesh>
          <mesh
            name="Fan003"
            castShadow
            geometry={nodes.Fan003.geometry}
            material={materials.Glass}
            position={[0.183, -0.052, -0.009]}
          >
            <mesh
              name="CPU018"
              ref={fanRefs[0]}
              castShadow
              geometry={nodes.CPU018.geometry}
              material={materials["Red Glow"]}
              position={[0.009, 0, 0]}
            />
            <mesh
              name="CPU019"
              castShadow
              geometry={nodes.CPU019.geometry}
              material={materials.Light}
              position={[0.009, 0, 0]}
            />
          </mesh>
          <mesh
            name="Fan004"
            castShadow
            geometry={nodes.Fan004.geometry}
            material={materials.Glass}
            position={[-0.05, 0.152, -0.025]}
          >
            <mesh
              name="CPU021"
              ref={fanRefs[1]}
              castShadow
              geometry={nodes.CPU021.geometry}
              material={materials["Red Glow"]}
              position={[0.009, 0, 0]}
            />
            <mesh
              name="CPU022"
              castShadow
              geometry={nodes.CPU022.geometry}
              material={materials.Light}
              position={[0.012, 0, 0]}
            />
          </mesh>
        </mesh>
        <mesh
          name="Coffe"
          castShadow
          geometry={nodes.Coffe.geometry}
          material={materials["Glass.001"]}
          position={[0.204, 0.044, -0.102]}
        >
          <mesh
            name="Coffe_Liquid"
            castShadow
            geometry={nodes.Coffe_Liquid.geometry}
            material={materials.Black}
            position={[-0.005, 0.011, 0.004]}
          />
        </mesh>
        <mesh
          name="Book"
          // ref={titleRef}
          castShadow
          geometry={nodes.Book.geometry}
          material={nodes.Book.material}
          position={[0.081, 0.025, 0.543]}
        >
          <mesh
            name="Book001"
            castShadow
            geometry={nodes.Book001.geometry}
            material={materials.Black}
            position={[0, 0.007, 0.082]}
          />
        </mesh>
        <mesh
          name="Wall"
          castShadow
          geometry={nodes.Wall.geometry}
          material={materials.Screen}
          position={[3.376, 1.53, 2.451]}
        />

        <mesh
          name="SwitchBoard"
          castShadow
          geometry={nodes.SwitchBoard.geometry}
          material={materials.Black}
          position={[-0.271, 0.544, -0.455]}
        >
          <mesh
            name="Switch"
            castShadow
            geometry={nodes.Switch.geometry}
            material={materials.Pink}
            position={[0.003, 0, 0]}
          />
        </mesh>
      </group>
    </a.group>
  );
};

useGLTF.preload("/room.glb");

export default Room;
