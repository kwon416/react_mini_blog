import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function Baseball(props) {
  useEffect(() => {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb1e1ff);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(30, 30);
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(-30, 20, 20);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();

    let stats = new Stats();
    document.body.append(stats.domElement);

    // 궤적을 위한 재료와 점들
    const maxPoints = 500; // 최대 점 개수
    const positions = new Float32Array(maxPoints * 3); // 3은 x, y, z 좌표
    const trajectoryGeometry = new THREE.BufferGeometry();
    trajectoryGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    trajectoryGeometry.setDrawRange(0, 0); // 초기에는 점 없음

    const trajectoryMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 3,
    });

    const trajectoryLine = new THREE.Line(
      trajectoryGeometry,
      trajectoryMaterial
    );
    scene.add(trajectoryLine);

    let pointCount = 0; // 현재 점의 개수를 추적

    // 야구공과 홈베이스의 참조를 저장할 변수
    let baseball;
    let homeBaseMesh;

    // 홈 베이스 생성 함수
    function createHomeBase() {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(4, 0);
      shape.lineTo(4, -3);
      shape.lineTo(2, -5);
      shape.lineTo(0, -3);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        steps: 1,
        depth: 4,
        bevelEnabled: false,
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const transparentMaterial = new THREE.MeshStandardMaterial({
        color: 0xff5733,
        transparent: true,
        opacity: 0.3,
      });

      homeBaseMesh = new THREE.Mesh(geometry, transparentMaterial);
      homeBaseMesh.rotation.x = Math.PI / 2;
      homeBaseMesh.rotation.z = -Math.PI / 2;
      homeBaseMesh.scale.set(0.15, 0.15, 0.15);
      homeBaseMesh.position.set(-3.3, 2, 0.3);

      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.scale.copy(homeBaseMesh.scale);
      edges.rotation.copy(homeBaseMesh.rotation);
      edges.position.copy(homeBaseMesh.position);

      scene.add(homeBaseMesh);
      scene.add(edges);
    }

    // 야구장 로드
    const loader = new GLTFLoader();
    loader.load(
      "models/baseball_field/scene.gltf",
      function (gltf) {
        const model = gltf.scene;
        model.position.set(6, 1, 2.3);
        model.scale.set(0.01, 0.01, 0.01);
        scene.add(model);

        createHomeBase();
        loadBaseball();
      },
      undefined,
      function (e) {
        console.error(e);
      }
    );

    // 야구공 로드 함수
    function loadBaseball() {
      loader.load("models/baseball/scene.gltf", (gltf) => {
        baseball = gltf.scene;
        baseball.scale.set(0.001, 0.001, 0.001);
        baseball.position.set(0, 2, 0);
        scene.add(baseball);

        animate();
      });
    }

    // 궤적 업데이트 함수
    function updateTrajectory() {
      if (baseball && pointCount < maxPoints) {
        const positionAttribute = trajectoryGeometry.getAttribute("position");

        // 현재 공의 위치를 저장
        positionAttribute.array[pointCount * 3] = baseball.position.x;
        positionAttribute.array[pointCount * 3 + 1] = baseball.position.y;
        positionAttribute.array[pointCount * 3 + 2] = baseball.position.z;

        pointCount++;

        // 그릴 점의 개수 업데이트
        trajectoryGeometry.setDrawRange(0, pointCount);
        positionAttribute.needsUpdate = true;
      }
    }

    // 공 이동 함수
    function moveBaseball() {
      if (baseball && homeBaseMesh) {
        if (baseball.position.x > homeBaseMesh.position.x) {
          // 공의 초기 위치와 목표 위치
          const startX = 0;
          const endX = homeBaseMesh.position.x;

          // 현재 진행률 계산 (0에서 1 사이)
          const progress = 1 - (baseball.position.x - endX) / (startX - endX);

          // 포물선 높이 계산
          const height = Math.sin(progress * Math.PI) * 0.3;

          baseball.position.x -= 0.05;
          baseball.position.y = 2 + height;

          updateTrajectory();
        }
      }
    }

    // 애니메이션 함수
    function animate() {
      moveBaseball();
      controls.update();
      stats.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    // 리사이즈 핸들러
    function handleResize() {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (stats.domElement && stats.domElement.parentNode) {
        stats.domElement.parentNode.removeChild(stats.domElement);
      }
    };
  }, []);

  return <canvas id="c"></canvas>;
}

export default Baseball;
