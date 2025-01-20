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
    // renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb1e1ff);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 2;
    camera.position.z = 10;

    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    // const gridHelper = new THREE.GridHelper(80, 80);
    // scene.add(gridHelper);

    // 헬퍼 추가 (축, 그리드)
    scene.add(new THREE.AxesHelper(5), new THREE.GridHelper(80, 80));
    let stats = new Stats();

    document.body.append(stats.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 25);
    // controls.target.set(0, 1, 10);
    controls.update();

    // 환경광
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // 태양광
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 100, -100); // 빛의 위치
    scene.add(directionalLight);
    const helper = new THREE.DirectionalLightHelper(directionalLight);
    scene.add(helper);

    // 포인트 라이트
    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // 색상, 강도, 거리
    pointLight.position.set(0, 10, 30);
    scene.add(pointLight);
    const helper2 = new THREE.PointLightHelper(pointLight);
    scene.add(helper2);

    const loader = new GLTFLoader();

    // 야구장 모델 로딩
    loader.load(
      "models/design/baseballstadium.glb",
      function (gltf) {
        const model = gltf.scene;

        scene.add(model);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // 야구공 모델 로딩
    loader.load(
      "models/design/ball.glb",
      function (gltf) {
        const model = gltf.scene;
        // model.scale.set(20, 20, 20);
        model.position.set(0, 2, 2);
        scene.add(model);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // 스트라이크 존 모델 로딩
    loader.load(
      "models/design/strike_zone.glb",
      function (gltf) {
        const model = gltf.scene;

        // model.position.set(0, 0.2, 18);
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
