import React, { useEffect } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

import styled from "styled-components";

const Info = styled.div`
  /* position: absolute;
  top: 10px;
  width: 100%;
  text-align: center;
  z-index: 100;
  display: block; */
`;

function CreateText(props) {
  useEffect(() => {
    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector("#container").appendChild(renderer.domElement);

    // 카메라 생성
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      1,
      1500
    );
    camera.position.set(0, 500, 1000);
    // 카메라가 바라보는 방향 설정
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(cameraTarget);

    // SCENE

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0x000000, 250, 1400);

    // LIGHTS

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 4.5, 0, 0);
    pointLight.color.setHSL(Math.random(), 1, 0.5);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);

    const text = "Description";

    let fontLoader = new FontLoader();
    fontLoader.load("fonts/helvetiker_regular.typeface.json", (font) => {
      const parameters = {
        font: font,
        size: 70,
        depth: 20,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
      };

      let geometry = new TextGeometry(text, parameters);

      const materials = [
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
      ];

      geometry.computeBoundingBox();
      let xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      geometry.translate(xMid, 0, 0);

      const textMesh = new THREE.Mesh(geometry, materials);
      scene.add(textMesh);
      renderer.render(scene, camera);
    });
  });

  return <Info id="container">Description</Info>;
}

export default CreateText;
