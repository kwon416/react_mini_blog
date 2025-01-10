import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ColorGUIHelper from "../utils/ColorGUIHelper";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

function Lights(props) {
  useEffect(() => {
    const canvas = document.getElementById("container");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    // 카메라와 DOM 이벤트를 감지하도록 canvas를 OrbitControls에 전달
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update(); // OrbitControls이 새로운 시점을 바라보게 설정

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    // 텍스처를 불러오고 반복 래핑
    const planeSize = 40; // 평면의 크기

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://threejs.org/manual/examples/resources/images/checker.png"
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    // 평면 지오메트리를 생성하고 텍스처를 적용
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    // 평면은 기본적으로 XY 축을 기준으로 하기 때문에 XZ 평면으로 회전
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);

    {
      const cubeSize = 4;
      const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
      const mesh = new THREE.Mesh(cubeGeo, cubeMat);
      mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
      scene.add(mesh);
    }
    {
      const sphereRadius = 3;
      const sphereWidthDivisions = 32;
      const sphereHeightDivisions = 16;
      const sphereGeo = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthDivisions,
        sphereHeightDivisions
      );
      const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
      scene.add(mesh);
    }

    // 자연광 생성
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);

    const helper = new THREE.DirectionalLightHelper(light);
    scene.add(helper);

    function makeXYZGUI(gui, vector3, name, onChangeFn) {
      const folder = gui.addFolder(name);
      folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
      folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
      folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
      folder.open();
    }

    function updateLight() {
      light.target.updateMatrixWorld();
      helper.update();
    }
    updateLight();

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
    gui.add(light, "intensity", 0, 5, 0.01);
    gui.add(light.target.position, "x", -10, 10);
    gui.add(light.target.position, "z", -10, 10);
    gui.add(light.target.position, "y", 0, 10);

    makeXYZGUI(gui, light.position, "position", updateLight);
    makeXYZGUI(gui, light.target.position, "target", updateLight);

    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }

      return needResize;
    }

    function render() {
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    return () => {
      gui.destroy();
    };
  }, []);
  return <canvas id="container"></canvas>;
}

export default Lights;
