import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
useFrame;
import room from "../../public/models/room.glb";
import { a } from "@react-spring/three";

const Room = (
  isRotating,
  setIsRotating,
  setCurrentStage,
  // roomPosition,
  props
) => {
  const roomRef = useRef();
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(room);
  // const { actions } = useAnimations(animations, roomRef);
  const roomPosition = [0.55, -0.1, 3];
  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;

  const handlePointerDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);

    // Guarda la posición del mouse cuando se presiona
    const clientX = event.clientX || event.touches?.[0]?.clientX;
    lastX.current = clientX;
  };

  // Handle pointer (mouse or touch) up event
  const handlePointerUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
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
    window.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchmove", handleTouchMove);

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  // This function is called on each frame update
  useFrame(() => {
    // If not rotating, apply damping to slow down the rotation (smoothly)
    if (!isRotating) {
      rotationSpeed.current *= dampingFactor;
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }
      roomRef.current.rotation.y += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on room's orientation
      const rotation = roomRef.current.rotation.y;

      /**
       * Normalize the rotation value to ensure it stays within the range [0, 2 * Math.PI].
       * The goal is to ensure that the rotation value remains within a specific range to
       * prevent potential issues with very large or negative rotation values.
       *  Here's a step-by-step explanation of what this code does:
       *  1. rotation % (2 * Math.PI) calculates the remainder of the rotation value when divided
       *     by 2 * Math.PI. This essentially wraps the rotation value around once it reaches a
       *     full circle (360 degrees) so that it stays within the range of 0 to 2 * Math.PI.
       *  2. (rotation % (2 * Math.PI)) + 2 * Math.PI adds 2 * Math.PI to the result from step 1.
       *     This is done to ensure that the value remains positive and within the range of
       *     0 to 2 * Math.PI even if it was negative after the modulo operation in step 1.
       *  3. Finally, ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) applies another
       *     modulo operation to the value obtained in step 2. This step guarantees that the value
       *     always stays within the range of 0 to 2 * Math.PI, which is equivalent to a full
       *     circle in radians.
       */
      const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      switch (true) {
        case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
          setCurrentStage(4);
          break;
        case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
          setCurrentStage(3);
          break;
      }
    }
  });

  useEffect(() => {
    if (roomRef.current) {
      // Cambiar el color de los altavoces
      const speakerR = roomRef.current.getObjectByName("Speaker-R");
      const speakerL = roomRef.current.getObjectByName("Speaker-L");
      const CPU = roomRef.current.getObjectByName("CPU");

      if (speakerR) {
        speakerR.material.color.set("#FFff"); // Cambia a rojo
      }
      if (CPU) {
        // child.children[0].material = new THREE.MeshPhysicalMaterial();
        CPU.material.roughness = 0;
        CPU.material.color.set(0x999999);
        CPU.material.ior = 3;
        CPU.material.transmission = 2;
        CPU.material.opacity = 0.8;
        CPU.material.depthWrite = false;
        CPU.material.depthTest = false;
        // CPU.material = new THREE.MeshPhysicalMaterial();
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
        speakerL.material.color.set("#FFFF"); // Cambia a verde
      }
    }
  }, [roomRef]);

  return (
    <a.group ref={roomRef} position={roomPosition} {...props}>
      <group name="Scene">
        <mesh
          name="Table"
          geometry={nodes.Table.geometry}
          material={materials.Table}
          position={[0.073, -0.099, 0.13]}
        />
        <mesh
          name="Stand"
          geometry={nodes.Stand.geometry}
          material={materials.Black}
          position={[-0.059, 0.054, 0.168]}
        >
          <mesh
            name="Monitor"
            geometry={nodes.Monitor.geometry}
            material={materials.Screen}
            position={[0.022, 0.182, 0]}
          />
          <mesh
            name="Pc"
            geometry={nodes.Pc.geometry}
            material={materials.Black}
            position={[0.022, 0.133, 0]}
          />
        </mesh>
        <mesh
          name="Speaker-R"
          geometry={nodes["Speaker-R"].geometry}
          material={materials.Black}
          position={[-0.136, 0.054, 0.026]}
          scale={[1, 1, 1.186]}
        />
        <mesh
          name="Speaker-L"
          geometry={nodes["Speaker-L"].geometry}
          material={materials.Black}
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
            material={materials.Soil}
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
          material={materials.Black}
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
          material={materials.Black}
          position={[0.084, 0.03, 0.237]}
        />
        <mesh
          name="Glass"
          castShadow
          geometry={nodes.Glass.geometry}
          material={materials.Glass}
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
            material={nodes.CPU_Glass.material}
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
            material={materials.Black}
            position={[-0.103, 0.061, -0.033]}
          />
          <mesh
            name="CPU_Part002"
            castShadow
            geometry={nodes.CPU_Part002.geometry}
            material={materials.Metal}
            position={[-0.116, 0.07, -0.011]}
          />
          <mesh
            name="CPU_Part003"
            castShadow
            geometry={nodes.CPU_Part003.geometry}
            material={materials["Top Metal"]}
            position={[-0.103, 0.079, -0.033]}
          />
          <mesh
            name="CPU_Part005"
            castShadow
            geometry={nodes.CPU_Part005.geometry}
            material={materials["Top Metal"]}
            position={[-0.097, 0.152, 0.03]}
          />
          <mesh
            name="CPU_Part"
            castShadow
            geometry={nodes.CPU_Part.geometry}
            material={materials.Black}
            position={[-0.074, -0.069, -0.022]}
          />
          <mesh
            name="Fan"
            castShadow
            geometry={nodes.Fan.geometry}
            material={materials.Black}
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
              castShadow
              geometry={nodes.CPU010.geometry}
              material={materials.Black}
              position={[0.009, 0, 0]}
            />
          </mesh>
          <mesh
            name="Fan001"
            castShadow
            geometry={nodes.Fan001.geometry}
            material={materials.Black}
            position={[0.183, 0.157, -0.009]}
          >
            <mesh
              name="CPU012"
              castShadow
              geometry={nodes.CPU012.geometry}
              material={materials.Black}
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
            material={materials.Black}
            position={[0.183, 0.053, -0.009]}
          >
            <mesh
              name="CPU015"
              castShadow
              geometry={nodes.CPU015.geometry}
              material={materials.Black}
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
            material={materials.Black}
            position={[0.183, -0.052, -0.009]}
          >
            <mesh
              name="CPU018"
              castShadow
              geometry={nodes.CPU018.geometry}
              material={materials.Black}
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
            material={materials.Black}
            position={[-0.05, 0.152, -0.025]}
          >
            <mesh
              name="CPU021"
              castShadow
              geometry={nodes.CPU021.geometry}
              material={materials.Black}
              position={[0.009, 0, 0]}
            />
            <mesh
              name="CPU022"
              castShadow
              geometry={nodes.CPU022.geometry}
              material={materials["Red Glow"]}
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
            material={materials.Coffe}
            position={[-0.005, 0.011, 0.004]}
          />
        </mesh>
        <mesh
          name="Book"
          castShadow
          geometry={nodes.Book.geometry}
          material={nodes.Book.material}
          position={[0.081, 0.025, 0.543]}
        >
          <mesh
            name="Book001"
            castShadow
            geometry={nodes.Book001.geometry}
            material={materials.Book}
            position={[0, 0.007, 0.082]}
          />
        </mesh>
        <mesh
          name="Wall"
          castShadow
          geometry={nodes.Wall.geometry}
          material={materials.Wall}
          position={[3.376, 1.53, 2.451]}
        />
        <mesh
          name="SwitchBoard"
          castShadow
          geometry={nodes.SwitchBoard.geometry}
          material={materials.Table}
          position={[-0.271, 0.544, -0.455]}
        >
          <mesh
            name="Switch"
            castShadow
            geometry={nodes.Switch.geometry}
            material={materials.Table}
            position={[0.003, 0, 0]}
          />
        </mesh>
      </group>
    </a.group>
  );
};

useGLTF.preload("/room.glb");

export default Room;
