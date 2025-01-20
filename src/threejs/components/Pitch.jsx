import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import StrikeZoneSystem from "./baseball/StrikeZoneSystem";
import BaseballSystem from "./baseball/BaseballSystem";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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

    // 헬퍼 추가 (축, 그리드)
    scene.add(new THREE.AxesHelper(5), new THREE.GridHelper(80, 80));

    // 성능 모니터링
    const stats = new Stats();
    document.body.append(stats.domElement);

    // 야구장 생성
    const loader = new GLTFLoader();
    loader.load(
      "./models/design/1.glb",
      (gltf) => {
        const model = gltf.scene;
        model.position.y = -0.2;
        scene.add(model);
      },
      undefined,
      (error) => console.error("Error loading baseball field:", error)
    );

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

    // 스트라이크 존 모델

    // loader.load(
    //   "./models/design/strike_zone.glb",
    //   (gltf) => {
    //     const model = gltf.scene;
    //     model.scale.set(0.9, 0.9, 0.9);
    //     model.position.set(0.15, 0, 19.73);
    //     scene.add(model);
    //   },
    //   undefined,
    //   (error) => console.error("Error loading baseball field:", error)
    // );

    // 스트라이크 존 및 베이스볼 시스템 추가
    const batterHeight = 1.828; // 타자 신장
    const rubberToHomeplate = 18.44; // 투수판에서 홈플레이트까지의 거리 (규격:18.44m)
    const strikeZoneSystem = new StrikeZoneSystem(
      batterHeight,
      rubberOffset,
      rubberToHomeplate
    );

    const baseballSystem = new BaseballSystem(
      rubberOffset,
      rubberToHomeplate,
      strikeZoneSystem.homePlate.position
    );
    scene.add(strikeZoneSystem, baseballSystem);

    // 조명 설정
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 카메라 컨트롤
    const controls = new OrbitControls(camera, renderer.domElement);
    const orbitInitialPosition = new THREE.Vector3(
      0,
      0.7,
      rubberOffset + rubberToHomeplate
    );
    controls.target.copy(orbitInitialPosition);
    // controls.target.copy(strikeZoneSystem.homePlate.position);
    controls.enableDamping = true; // Smooth movement
    controls.dampingFactor = 0.1;
    controls.update();
    const cameraInitialPosition = new THREE.Vector3(
      0,
      1.3,
      rubberOffset + rubberToHomeplate + 1
    );
    camera.position.copy(cameraInitialPosition);

    // 샘플 데이터를 fetch
    fetch("./data/sampleData.json")
      .then((response) => response.json())
      .then((data) => {
        baseballSystem.setPitchData(data, strikeZoneSystem.homePlate.position);
      })
      .catch((error) => console.error("Error loading pitch data:", error));

    // GUI
    const gui = new GUI();

    // Camera Folder
    const cameraFolder = gui.addFolder("Camera");
    cameraFolder
      .add(camera.position, "x", -3, 3)
      .onChange((value) => (camera.position.x = value));
    cameraFolder
      .add(camera.position, "y", -1, 4)
      .onChange((value) => (camera.position.y = value));
    cameraFolder
      .add(camera.position, "z", -20, 25)
      .onChange((value) => (camera.position.z = value));
    cameraFolder
      .add(camera, "fov", 1, 120)
      .onChange(() => camera.updateProjectionMatrix());
    cameraFolder
      .add(camera, "zoom", 0.1, 3)
      .onChange(() => camera.updateProjectionMatrix());
    cameraFolder
      .add(
        {
          cameraInitialPosition: () => {
            camera.position.copy(cameraInitialPosition);
            camera.lookAt(strikeZoneSystem.homePlate.position);
            controls.target.copy(orbitInitialPosition);
          },
        },
        "cameraInitialPosition"
      )
      .name("Initial Position");
    cameraFolder
      .add(
        {
          ballStartPosition: () => {
            camera.position.copy(baseballSystem.state.initialPosition);
            camera.position.z -= 1;
            camera.lookAt(strikeZoneSystem.homePlate.position);
            controls.target.copy(orbitInitialPosition);
          },
        },
        "ballStartPosition"
      )
      .name("ball Start Position");
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
        case " ":
          baseballSystem.startPitch();
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
        <p>Space: Pitch</p>
        <p>R: Reset</p>
      </div>
    </>
  );
}

export default Pitch;
