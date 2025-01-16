import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

function RenderingOptimization(props) {
  useEffect(() => {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 10;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2.5;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 4;
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    {
      const loader = new THREE.TextureLoader();
      const texture = loader.load(
        "https://threejs.org/manual/examples/resources/images/world.jpg",
        render
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.SphereGeometry(1, 64, 32);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      scene.add(new THREE.Mesh(geometry, material));
    }

    async function loadFile(url) {
      const req = await fetch(url);
      return req.text();
    }

    function parseData(text) {
      const data = [];
      const settings = { data };
      let max;
      let min;
      // split into lines
      text.split("\n").forEach((line) => {
        // split the line by whitespace
        const parts = line.trim().split(/\s+/);
        if (parts.length === 2) {
          // only 2 parts, must be a key/value pair
          settings[parts[0]] = parseFloat(parts[1]);
        } else if (parts.length > 2) {
          // more than 2 parts, must be data
          const values = parts.map((v) => {
            const value = parseFloat(v);
            if (value === settings.NODATA_value) {
              return undefined;
            }

            max = Math.max(max === undefined ? value : max, value);
            min = Math.min(min === undefined ? value : min, value);
            return value;
          });
          data.push(values);
        }
      });
      return Object.assign(settings, { min, max });
    }

    function addBoxes(file) {
      const { min, max, data } = file;
      const range = max - min;

      // these helpers will make it easy to position the boxes
      // We can rotate the lon helper on its Y axis to the longitude
      const lonHelper = new THREE.Object3D();
      scene.add(lonHelper);
      // We rotate the latHelper on its X axis to the latitude
      const latHelper = new THREE.Object3D();
      lonHelper.add(latHelper);
      // The position helper moves the object to the edge of the sphere
      const positionHelper = new THREE.Object3D();
      positionHelper.position.z = 1;
      latHelper.add(positionHelper);
      // 육면체의 중심을 옮겨 양의 Z축 방향으로 커지게 합니다.
      const originHelper = new THREE.Object3D();
      originHelper.position.z = 0.5;
      positionHelper.add(originHelper);

      const color = new THREE.Color();

      const lonFudge = Math.PI * 0.5;
      const latFudge = Math.PI * -0.135;
      const geometries = [];
      data.forEach((row, latNdx) => {
        row.forEach((value, lonNdx) => {
          if (value === undefined) {
            return;
          }

          const amount = (value - min) / range;
          const boxWidth = 1;
          const boxHeight = 1;
          const boxDepth = 1;
          const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

          // adjust the helpers to point to the latitude and longitude
          lonHelper.rotation.y =
            THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
          latHelper.rotation.x =
            THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

          // originHelper의 위치를 해당 geometry의 위치로 지정합니다.
          positionHelper.scale.set(
            0.005,
            0.005,
            THREE.MathUtils.lerp(0.01, 0.5, amount)
          );
          originHelper.updateWorldMatrix(true, false);
          geometry.applyMatrix4(originHelper.matrixWorld);

          // 색상값을 계산합니다.
          const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
          const saturation = 1;
          const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
          color.setHSL(hue, saturation, lightness);
          // RGB 색상값을 0부터 255까지의 배열로 변환합니다.
          const rgb = color.toArray().map((v) => v * 255);

          // 각 정점의 색을 배열로 저장합니다.
          const numVerts = geometry.getAttribute("position").count;
          const itemSize = 3; // r, g, b
          const colors = new Uint8Array(itemSize * numVerts);

          // 색상값을 각 정점에 지정할 색상으로 변환합니다.
          colors.forEach((v, ndx) => {
            colors[ndx] = rgb[ndx % 3];
          });

          const normalized = true;
          const colorAttrib = new THREE.BufferAttribute(
            colors,
            itemSize,
            normalized
          );
          geometry.setAttribute("color", colorAttrib);

          geometries.push(geometry);
        });
      });
      // 생성한 geometry를 전부 합칩니다.
      const mergedGeometry = BufferGeometryUtils.mergeGeometries(
        geometries,
        false
      );
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
      });

      const mesh = new THREE.Mesh(mergedGeometry, material);
      scene.add(mesh);
    }

    loadFile(
      "https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc"
    )
      .then(parseData)
      .then(addBoxes)
      .then(render);

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

    let renderRequested = false;

    function render() {
      renderRequested = undefined;

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      controls.update();
      renderer.render(scene, camera);
    }

    render();

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    }

    controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);
  }, []);
  return <canvas id="c"></canvas>;
}

export default RenderingOptimization;
