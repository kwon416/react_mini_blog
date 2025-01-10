import React, { useEffect } from "react";
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import Stats from "three/examples/jsm/libs/stats.module";

function RotateCube(props) {
  useEffect(() => {
    let stats = new Stats();
    document.body.append(stats.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const canvas = document.querySelector("#container");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // document.querySelector("#container").appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
    // const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // 광원 없이 색만 표현
    const material = new THREE.MeshPhongMaterial({ color: 0x4488aa });
    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // const AL = new THREE.AmbientLight(0xffffff, 1); // 빛 광역 반사
    // scene.add(AL);

    // 광원 추가
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    camera.position.z = 3;

    function makeInstance(geometry, color, x) {
      const material = new THREE.MeshPhongMaterial({ color });

      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      cube.position.x = x;

      return cube;
    }

    const cubes = [
      makeInstance(geometry, 0x44aa88, 0),
      makeInstance(geometry, 0x8844aa, -2),
      makeInstance(geometry, 0xaa8844, 2),
    ];

    function animate() {
      requestAnimationFrame(animate);

      const time = 0.01;

      // cube.rotation.x += 0.01; // 회전 값은 라디안 사용
      // cube.rotation.y += 0.01; // 360도는 2 * Math.PI 라디안, 대략 0.01은 0.5도 정도,

      cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * 0.1;
        const rot = time * speed;
        cube.rotation.x += rot;
        cube.rotation.y += rot;
      });

      renderer.render(scene, camera);
      stats.update();
    }

    if (WebGL.isWebGL2Available()) {
      // Initiate function or other initializations here
      animate();
    } else {
      const warning = WebGL.getWebGL2ErrorMessage();
      document.getElementById("container").appendChild(warning);
    }
  }, []);

  return (
    <canvas id="container" style={{ display: "block" }}>
      {" "}
    </canvas>
  );
}

export default RotateCube;
