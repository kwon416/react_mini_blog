import React, { useEffect } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

function PrimitivesModel(props) {
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);
    const fov = 40;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 120;

    const objects = [];
    const spread = 15;

    function addObject(x, y, obj) {
      obj.position.x = x * spread;
      obj.position.y = y * spread;

      scene.add(obj);
      objects.push(obj);
    }

    function createMaterial() {
      const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide, // 양면 렌더링, 속도에 영향을 줌
      });

      const hue = Math.random();
      const saturation = 1;
      const luminance = 0.5;
      material.color.setHSL(hue, saturation, luminance);

      return material;
    }

    function addSolidGeometry(x, y, geometry) {
      const mesh = new THREE.Mesh(geometry, createMaterial());
      addObject(x, y, mesh);
    }

    const width = 8;
    const height = 8;
    const depth = 8;
    // addSolidGeometry(-2, -2, new THREE.BoxGeometry(width, height, depth));

    const loader = new FontLoader();
    // promisify font loading
    function loadFont(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    async function doit() {
      const font = await loadFont(
        "fonts/helvetiker_regular.typeface.json"
      ); /* threejs.org: url */
      const geometry = new TextGeometry("three.js", {
        font: font,
        size: 3.0,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.3,
        bevelSegments: 5,
      });
      const mesh = new THREE.Mesh(geometry, createMaterial());
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

      const parent = new THREE.Object3D();
      parent.add(mesh);

      addObject(-1, -1, parent);
      const canvas = document.querySelector("#container");
      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    }
    doit();
  });

  return <canvas id="container"></canvas>;
}

export default PrimitivesModel;
