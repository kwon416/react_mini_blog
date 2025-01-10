import React, { useEffect } from "react";
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function SceneGraph() {
  useEffect(() => {
    const gui = new GUI();
    const canvas = document.querySelector("#scene-graph");
    canvas.style.display = "block";
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 카메라 세팅
    const fov = 40;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 50, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    // 회전값을 업데이트할 객체들
    const objects = [];

    // 하나의 geometry로 모든 태양, 지구, 달을 생성
    const radius = 1;
    const widthSegments = 6;
    const heightSegments = 6;
    const sphereGeometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );

    // 태양계를 담을 객체 생성
    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);
    objects.push(solarSystem);

    // emissive 속성을 사용하여 빛을 내는 소재를 만듦 (태양)
    const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5); // 태양의 크기를 키움
    solarSystem.add(sunMesh);
    objects.push(sunMesh);

    const color = 0xffffff;
    // 광원의 세기를 설정
    const intensity = 500;
    // 한 방향에서 발산하는 광원 생성 (태양)
    const light = new THREE.PointLight(color, intensity);
    scene.add(light);

    // 지구 궤도를 그리기 위한 객체 생성
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 10;
    solarSystem.add(earthOrbit);
    objects.push(earthOrbit);

    // 지구 생성
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthOrbit.add(earthMesh);
    objects.push(earthMesh);

    // 달 궤도를 그리기 위한 객체 생성
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    earthOrbit.add(moonOrbit);

    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      emissive: 0x222222,
    });
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(0.5, 0.5, 0.5);
    moonOrbit.add(moonMesh);
    objects.push(moonMesh);

    function makeAxisGrid(node, label, units) {
      const helper = new AxisGridHelper(node, units);
      gui.add(helper, "visible").name(label);
    }

    makeAxisGrid(solarSystem, "solarSystem", 25);
    makeAxisGrid(sunMesh, "sunMesh");
    makeAxisGrid(earthOrbit, "earthOrbit");
    makeAxisGrid(earthMesh, "earthMesh");
    makeAxisGrid(moonMesh, "moonMesh");

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

    function render(time) {
      time *= 0.001;

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      objects.forEach((obj) => {
        obj.rotation.y = time;
      });

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    return () => {
      gui.destroy();
    };
  });

  return <canvas id="scene-graph"></canvas>;
}

/*
 * 축과 격자를 동시에 켜고 끕니다
 * lil-gui가 체크박스를 만들게 하려면 boolean 타입의
 * 속성을 지정해줘야 하므로, `visible` 속성에
 * getter와 setter를 지정해 lil-gui가 이 속성을
 * 바라보도록 합니다
 */
class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2; // 격자 다음에 렌더링
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}

export default SceneGraph;
