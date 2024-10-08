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
    let rotation = [2, 4.7, 0];
    if (window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
    } else {
      screenScale = [1, 1, 1];
    }
    return [screenScale, screenPosition, rotation];
  };

  const [roomScale, roomPosition, roomRotation] = adjustRoomForScreenSize();

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
          <directionalLight position={[1, 10, 10]} intensity={-1.8} />
          <ambientLight intensity={0.5} />
          <pointLight
            position={[0.3, 2, 0.5]}
            intensity={0.5}
            distance={10}
            castShadow
          />
          <spotLight
            position={[0, 50, 30]}
            angle={0.15}
            penumbra={2}
            intensity={1}
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
