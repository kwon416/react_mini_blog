import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/addons/libs/stats.module.js";

import React, { useEffect } from "react";

import * as THREE from "three";

function LoadModel(props) {
  useEffect(() => {
    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 고해상도 모니터 설정
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1); //2만되어도 충분하기 때문에 이렇게 함
    document.querySelector("#container").appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3dd);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    // xyz 축
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 격자 추가
    // size: 20, divisions: 20 으로 설정하면 (1, 1) 크기 격자
    const gridHelper = new THREE.GridHelper(30, 30);
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(-60, 60, 0);
    // camera.lookAt(0, 100, 60);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    let stats = new Stats();
    document.body.append(stats.domElement);

    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath("");

    const loader = new GLTFLoader();
    // loader.setDRACOLoader(dracoLoader);
    loader.load(
      "models/baseball_field/scene.gltf",
      function (gltf) {
        const model = gltf.scene;
        model.position.set(6, 1, 2.3);
        model.scale.set(0.01, 0.01, 0.01);
        scene.add(model);

        // const mixer = new THREE.AnimationMixer(model);
        // mixer.clipAction(gltf.animations[0]).play();

        renderer.setAnimationLoop(() => {
          // const clock = new THREE.Clock();
          // const delta = clock.getDelta();

          // mixer.update(delta);

          controls.update();

          stats.update();

          renderer.render(scene, camera);
        });
      },
      undefined,
      function (e) {
        console.error(e);
      }
    );

    //이벤트 감지해서 동적 화면 변경 대응
    function setSize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix(); //카메라의 변화가 있을 때 실행해줘야 하는 메서드
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.render(scene, camera);
    }
    window.addEventListener("resize", setSize);

    const gui = new GUI();
    // 컨트롤러를 추가한다.
    // object(객체) : 컨트롤러가 제어할 객체입니다. Material을 넣어준다.
    // property(프로퍼티, 속성) : 객체에서 제어할 속성 이름입니다.
    // $1(최소 값, 선택 값) : 숫자 컨트롤러의 최소 값이거나 드롭다운에서 선택 가능한 값입니다.
    // max(최대 값) : 숫자 컨트롤러의 최대 값입니다.
    // step(스탭, 간격) : 숫자 컨트롤러의 간격 값입니다.
    // gui.add(object, property, [$1], [max], [step]);
    gui.add(camera.position, "x", -100, 100, 0.1);
    gui.add(camera.position, "y", -100, 100, 0.1);
    gui.add(camera.position, "z", -100, 100, 0.1);

    return () => {
      window.removeEventListener("resize", setSize);
      gui.destroy();
    };
  });

  return <div id="container"></div>;
}
export default LoadModel;
