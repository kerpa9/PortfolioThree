import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { HomeInfo, Loader } from "../components";
import Room from "../models/Room";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as THREE from "three";

const Home = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [isRotating, setIsRotating] = useState(false);
  const [titleText, setTitleText] = useState(null);
  const [subtitleText, setSubtitleText] = useState(null);
  const sceneRef = useRef();

  const adjustRoomForScreenSize = () => {
    let screenScale = null;
    let screenPosition = [0, -6.5, -43];
    let rotation = [0.1, 4.7, 0];
    if (window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
    } else {
      screenScale = [1, 1, 1];
    }
    return [screenScale, screenPosition, rotation];
  };

  const [roomScale, roomPosition, roomRotation] = adjustRoomForScreenSize();

  const loadIntroText = () => {
    const loader = new FontLoader();

    loader.load("fonts/unione.json", (font) => {
      const textMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
      ];
      const titleGeo = new TextGeometry("Keven Reyes", {
        font: font,
        size: 0.08,
        height: 0.01,
      });
      const titleMesh = new THREE.Mesh(titleGeo, textMaterials);
      titleMesh.rotation.y = Math.PI * 0.5;
      titleMesh.position.set(-0.27, 0.55, 0.5);
      setTitleText(titleMesh);
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
          size: 0.018,
          height: 0.01,
        }
      );
      const subtitleMesh = new THREE.Mesh(subTitleGeo, textMaterials);
      subtitleMesh.rotation.y = Math.PI * 0.5;
      subtitleMesh.position.set(-0.255, 0.5, 0.5);
      setSubtitleText(subtitleMesh);
    });
  };
  useEffect(() => {
    loadIntroText();
  }, []);
  return (
    <section className="w-full h-screen relative">
      <div className="absolute top-28 left-0 right-0 z-10 flex items-center justify-center">
        {currentStage && <HomeInfo currentStage={currentStage} />}
      </div>

      <Canvas
        className={`w-full h-screen bg-transparent ${
          isRotating ? "cursor-grabbing" : "cursor-grab"
        }`}
        camera={{ near: 0.2, far: 1000 }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 10]} intensity={-1} />
          <ambientLight intensity={0.5} />

          <pointLight
            position={[0.3, 2, 0.5]} // Usando la posición de roomLight
            intensity={2.5} // Usando la intensidad de roomLight
            distance={10} // Añadido para mantener la distancia, como en roomLight
            castShadow={true} // Asegúrate de que castShadow esté habilitado si es necesario
          />
          <spotLight
            position={[0, 50, 10]} // Mantenida la posición original
            angle={0.15} // Mantenido el ángulo original
            penumbra={1} // Mantenido el penumbra original
            intensity={2} // Mantenida la intensidad original
          />
          <hemisphereLight
            skyColor="#b1e1ff"
            groundColor="#000000"
            intensity={1}
          />

          <Room
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            position={roomPosition}
            rotation={roomRotation}
            scale={roomScale}
          />
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Home;
