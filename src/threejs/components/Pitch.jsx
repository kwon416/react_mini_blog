import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import StrikeZoneSystem from "./baseball/StrikeZoneSystem";
import BaseballSystem from "./baseball/BaseballSystem";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function Pitch() {
  useEffect(() => {
    // 캔버스와 렌더러 초기화
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //set up the renderer with the default settings for threejs.org/editor - revision r153
    renderer.shadows = true;
    renderer.shadowType = 1;
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = 0;
    renderer.toneMappingExposure = 1;
    renderer.useLegacyLights = false;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0xffffff, 0);
    //make sure three/build/three.module.js is over r152 or this feature is not available.
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 씬, 카메라 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb1e1ff);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0.2, 0.5, 13.5);
    // camera.position.set(0, 0, -2);
    // 헬퍼 추가 (축, 그리드)
    scene.add(new THREE.AxesHelper(5), new THREE.GridHelper(80, 80));

    // 성능 모니터링
    const stats = new Stats();
    document.body.append(stats.domElement);

    // 피칭 러버(투수판) 생성
    const rubberWidth = 0.1524;
    const rubberHeight = 0.6096;
    const rubberOffset = 0.4572;
    const createPitchingRubber = () => {
      const geometry = new THREE.BoxGeometry(rubberHeight, 0.1, rubberWidth); // 가로, 높이, 세로
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const rubber = new THREE.Mesh(geometry, material);
      rubber.position.set(0, 0, rubberOffset); // 위치 설정
      return rubber;
    };
    scene.add(createPitchingRubber());

    // 스트라이크 존 및 베이스볼 시스템 추가
    const batterHeight = 1.828; // 타자 신장
    const rubberToHomeplate = 12.44; // 투수판에서 홈플레이트까지의 거리
    const strikeZoneSystem = new StrikeZoneSystem(
      batterHeight,
      rubberOffset,
      rubberToHomeplate
    );
    const baseballSystem = new BaseballSystem(rubberOffset, rubberToHomeplate);
    scene.add(strikeZoneSystem, baseballSystem);

    // 조명 설정
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 카메라 컨트롤
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.7, rubberOffset + rubberToHomeplate);
    controls.enableDamping = true; // Smooth movement
    controls.dampingFactor = 0.1;
    controls.update();

    // GUI
    const gui = new GUI();

    // Camera Folder
    const cameraFolder = gui.addFolder("Camera");
    const cameraPosition = { x: 0, y: 1, z: 5 };
    cameraFolder
      .add(cameraPosition, "x", -10, 10)
      .onChange((value) => (camera.position.x = value));
    cameraFolder
      .add(cameraPosition, "y", -10, 10)
      .onChange((value) => (camera.position.y = value));
    cameraFolder
      .add(cameraPosition, "z", -10, 10)
      .onChange((value) => (camera.position.z = value));
    cameraFolder
      .add(camera, "fov", 1, 120)
      .onChange(() => camera.updateProjectionMatrix());
    cameraFolder
      .add(camera, "zoom", 0.1, 3)
      .onChange(() => camera.updateProjectionMatrix());
    cameraFolder.open();

    // OrbitControls Folder
    const controlsFolder = gui.addFolder("OrbitControls");
    controlsFolder.add(controls, "enableDamping").name("Damping");
    controlsFolder
      .add(controls, "dampingFactor", 0.01, 1)
      .name("Damping Factor");
    controlsFolder.add(controls, "enableZoom").name("Enable Zoom");
    controlsFolder.add(controls, "minDistance", 0, 10).name("Min Distance");
    controlsFolder.add(controls, "maxDistance", 10, 50).name("Max Distance");
    controlsFolder.open();

    // 키보드 이벤트 처리
    const handleKeyDown = (event) => {
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
    };
    window.addEventListener("keydown", handleKeyDown);

    // 애니메이션 루프
    const animate = () => {
      stats.update();
      controls.update();
      strikeZoneSystem.update();
      baseballSystem.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 윈도우 리사이즈 핸들러
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 클린업
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      stats.domElement.remove();
      renderer.dispose();
      gui.destroy();
    };
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
