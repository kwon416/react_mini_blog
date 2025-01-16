import React, { useState, useEffect } from "react";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Design_1(props) {
  useEffect(() => {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth / 1.5, window.innerHeight / 1.5);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb1e1ff);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 2;
    camera.position.z = 22;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(80, 80);
    scene.add(gridHelper);

    let stats = new Stats();
    document.body.append(stats.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.7, 18);
    controls.update();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const loader = new GLTFLoader();

    loader.load(
      "models/design/baseball_stadium.glb",
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(20, 20, 20);
        scene.add(model);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    const animate = () => {
      stats.update();

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }, []);
  return <canvas id="c"></canvas>;
}

export default Design_1;
