import React, { useEffect } from "react";
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

function DrawLine(props) {
  useEffect(() => {
    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector("#container").appendChild(renderer.domElement);

    // 카메라 생성
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      500
    );
    // 카메라 위치 설정
    camera.position.set(0, 0, 100);
    // 카메라가 바라보는 방향 설정
    camera.lookAt(0, 0, 0);

    // 선을 그릴 material 생성
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    // 꼭짓점 점의 좌표를 설정
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    // 선을 그릴 geometry 생성
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // 둘을 합쳐 line 생성
    const line = new THREE.Line(geometry, material);

    const scene = new THREE.Scene();
    scene.add(line);
    renderer.render(scene, camera);
  });

  return <div id="container"> </div>;
}

export default DrawLine;
