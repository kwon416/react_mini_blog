import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import StrikeZoneSystem from "./baseball/StrikeZoneSystem";
import BaseballSystem from "./baseball/BaseballSystem";

function Pitch() {
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
      100
    );
    camera.position.y = 2;
    camera.position.z = 22;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(80, 80);
    scene.add(gridHelper);

    let stats = new Stats();
    document.body.append(stats.domElement);

    // 피칭 러버 생성
    const rubberWidth = 0.1524;
    const rubberHeight = 0.6096;
    const rubberGeometry = new THREE.BoxGeometry(
      rubberHeight,
      0.1,
      rubberWidth
    );
    const rubberMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const rubber = new THREE.Mesh(rubberGeometry, rubberMaterial);
    const rubberOffset = 0.4572;
    rubber.position.set(0, 0, rubberOffset);
    scene.add(rubber);

    // 스트라이크 존 시스템 추가
    const batterHeight = 1.828; // 타자 신장
    const rubberToHomeplate = 12.44; // 투수판에서 홈플레이트까지의 거리
    const strikeZoneSystem = new StrikeZoneSystem(
      batterHeight,
      rubberOffset,
      rubberToHomeplate
    );
    scene.add(strikeZoneSystem);

    // 베이스볼 시스템 추가
    const baseballSystem = new BaseballSystem(rubberOffset, rubberToHomeplate);
    scene.add(baseballSystem);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.7, rubberOffset + rubberToHomeplate);
    controls.update();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // 키보드 이벤트 처리
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "1":
          baseballSystem.startPitch("fastball");
          break;
        case "2":
          baseballSystem.startPitch("curveball");
          break;
        case "3":
          baseballSystem.startPitch("slider");
          break;
        case "4":
          baseballSystem.startPitch("changeup");
          break;
        case "r":
          baseballSystem.resetBall();
          break;
        default:
          break;
      }
    });

    const animate = () => {
      stats.update();
      strikeZoneSystem.update();
      baseballSystem.update();
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

  return (
    <>
      <canvas id="c"></canvas>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <p>Controls:</p>
        <p>1: Fastball</p>
        <p>2: Curveball</p>
        <p>3: Slider</p>
        <p>4: Changeup</p>
        <p>R: Reset</p>
      </div>
    </>
  );
}

export default Pitch;
