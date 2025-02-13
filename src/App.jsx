import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useRef, useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/three";

function Heart() {
  const { scene } = useGLTF("/heart.glb");
  const heartRef = useRef();
  const [scale, setScale] = useState(window.innerWidth < 768 ? 0.45 : 0.7);
  
  useEffect(() => {
    const handleResize = () => setScale(window.innerWidth < 768 ? 0.45 : 0.7);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scaleSpring } = useSpring({
    scaleSpring: scale + 0.05,
    from: { scaleSpring: scale },
    config: { mass: 1, tension: 200, friction: 10 },
    loop: { reverse: true },
  });

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    scene.rotation.y += 0.005;
    heartRef.current.position.x = mouse.x * 5;
    heartRef.current.position.y = -mouse.y * 5;
  });

  return <animated.primitive object={scene} scale={scaleSpring} ref={heartRef} />;
}

function FloatingHearts() {
  const heartRefs = useRef([]);
  useFrame(({ clock }) => {
    heartRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.position.y += 0.02;
        if (ref.position.y > 3) ref.position.y = -3;
      }
    });
  });
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[Math.random() * 6 - 3, Math.random() * 6 - 3, -5]} ref={(el) => (heartRefs.current[i] = el)}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      ))}
    </>
  );
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const audio = document.getElementById("bg-music");
    isPlaying ? audio.play() : audio.pause();
  }, [isPlaying]);

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundImage: "url(/collage.jpg)", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
      <div style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(1.5px)" }}></div>
      <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", color: "white", fontSize: "20px", fontFamily: "Playfair Display", backgroundColor:"black", padding: "15px", zIndex: 10 }}>
        Everything is better with you. ❤️ <br />Everything has been better since you. 💘
      </div>
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10, padding: "10px", background: "#dd2e44", borderRadius: "10px", border: "none", cursor: "pointer" }}>
        {isPlaying ? "Pause Music 🎵" : "Play Music 🎶"}
      </button>
      <Canvas camera={{ position: [0, 0, 200], fov: 50 }}>
        <ambientLight intensity={1.3} color={"#ff69b4"} />
        <directionalLight position={[0, 1000, 500]} intensity={1.2} castShadow color={"#ff8c94"} />
        <FloatingHearts />
        <Heart />
        <OrbitControls enableZoom={false} />
        <EffectComposer>
          <Bloom intensity={1.8} luminanceThreshold={0.15} luminanceSmoothing={0.6} blendFunction={BlendFunction.ADD} />
        </EffectComposer>
      </Canvas>
      <audio id="bg-music" autoPlay loop>
        <source src="/romantic-music.mp3" type="audio/mp3" />
      </audio>
    </div>
  );
}
