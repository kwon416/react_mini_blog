import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Shadows(props) {
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    const loader = new THREE.TextureLoader();
    const palneSize = 40;
    const texture = loader.load(
      "https://threejs.org/manual/examples/resources/images/checker.png"
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = palneSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(palneSize, palneSize);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    planeMat.color.setRGB(1.5, 1.5, 1.5);
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 10, 20);

    {
      const skyColor = 0xb1e1ff; // 하늘색
      const groundColor = 0xb97a20; // 오렌지 브라운
      const intensity = 2;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      scene.add(light);
    }

    {
      const color = 0xffffff;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 10, 5);
      light.target.position.set(-5, 0, 0);
      scene.add(light);
      scene.add(light.target);
    }

    const planeSize = 1;
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const shadowTexture = loader.load(
      "https://threejs.org/manual/examples/resources/images/roundshadow.png"
    );
    const sphereShadowBases = [];
    {
      const sphereRadius = 1;
      const sphereWidthDivisions = 32;
      const sphereHeightDivisions = 16;
      const sphereGeo = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthDivisions,
        sphereHeightDivisions
      );

      const planeSize = 1;
      const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);

      const numSpheres = 15;
      for (let i = 0; i < numSpheres; ++i) {
        // make a base for the shadow and the sphere.
        // so they move together.
        const base = new THREE.Object3D();
        scene.add(base);

        // add the shadow to the base
        // note: we make a new material for each sphere
        // so we can set that sphere's material transparency
        // separately.
        const shadowMat = new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true, // so we can see the ground
          depthWrite: false, // so we don't have to sort
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.y = 0.001; // so we're above the ground slightly
        shadowMesh.rotation.x = Math.PI * -0.5;
        const shadowSize = sphereRadius * 4;
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        base.add(shadowMesh);

        // add the sphere to the base
        const u = i / numSpheres;
        const sphereMat = new THREE.MeshPhongMaterial();
        sphereMat.color.setHSL(u, 1, 0.75);
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.set(0, sphereRadius + 2, 0);
        base.add(sphereMesh);

        // remember all 3 plus the y position
        sphereShadowBases.push({
          base,
          sphereMesh,
          shadowMesh,
          y: sphereMesh.position.y,
        });
      }
    }
    const canvas = document.getElementById("container");
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 카메라와 DOM 이벤트를 감지하도록 canvas를 OrbitControls에 전달
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update(); // OrbitControls이 새로운 시점을 바라보게 설정

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
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      time *= 0.001; // 초 단위로 변환

      sphereShadowBases.forEach((sphereShadowBase, ndx) => {
        const { base, sphereMesh, shadowMesh, y } = sphereShadowBase;

        // u는 구체의 반복문을 실행하면서 인덱스에 따라 0 이상, 1 이하로 지정됩니다
        const u = ndx / sphereShadowBases.length;

        /**
         * 컨테이너의 위치를 계산합니다. 구체와 그림자가
         * 컨테이너에 종속적이므로 위치가 같이 변합니다
         */
        const speed = time * 0.2;
        const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
        const radius = Math.sin(speed - ndx) * 10;
        base.position.set(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        );

        // yOff 값은 0 이상 1 이하입니다
        const yOff = Math.abs(Math.sin(time * 2 + ndx));
        // 구체를 위아래로 튕김
        sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
        // 구체가 위로 올라갈수록 그림자가 옅어짐
        shadowMesh.material.opacity = THREE.MathUtils.lerp(1, 0.25, yOff);
      });

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, []);
  return <canvas id="container"></canvas>;
}

export default Shadows;
