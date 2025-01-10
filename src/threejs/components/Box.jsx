import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function Box() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Box geometry
    const size = 4;
    const boxGeometry = new THREE.BoxGeometry(size, size, size, 2, 2, 2);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    scene.add(line);

    // Animation
    function animate() {
      line.rotation.x += 0.01;
      line.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      // Clean up Three.js resources
      scene.remove(line);
      edges.dispose();
      boxGeometry.dispose();
      renderer.dispose();
    };
  }, []); // Empty dependency array since we only want to run this once

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

export default Box;
