import React, { useState } from "react";
import RotateCube from "./components/RotateCube";
import DrawLine from "./components/DrawLine";
import CreateText from "./components/CreateText";
import LoadModel from "./components/LoadModel";
import Box from "./components/Box";
import PrimitivesModel from "./components/PrimitivesModel";
import SceneGraph from "./components/SceneGraph";
import Tank from "./components/Tank";
import Lights from "./components/Lights";
import Camera from "./components/Camera";
import Shadows from "./components/Shadows";
import Fog from "./components/Fog";
import RenderTargets from "./components/RenderTargets";
import RenderingOptimization from "./components/RenderingOptimization";
import AnimationOptimization from "./components/AnimationOptimization";
import GLTFLoader from "./components/GLTFLoader";
import Baseball from "./components/Baseball";
import Pitch from "./components/Pitch";
import Design_1 from "./components/Design_1";

const ThreejsIndex = (props) => {
  const [currentPage, setCurrentPage] = useState("Pitch");

  const pages = [
    { id: "RotateCube", component: <RotateCube />, title: "Rotate Cube" },
    { id: "DrawLine", component: <DrawLine />, title: "Draw Line" },
    { id: "CreateText", component: <CreateText />, title: "Create Text" },
    { id: "LoadModel", component: <LoadModel />, title: "Load Model" },
    { id: "Box", component: <Box />, title: "Box" },
    {
      id: "PrimitivesModel",
      component: <PrimitivesModel />,
      title: "Primitives Model",
    },
    { id: "SceneGraph", component: <SceneGraph />, title: "Scene Graph" },
    { id: "Tank", component: <Tank />, title: "Tank" },
    { id: "Lights", component: <Lights />, title: "Lights" },
    { id: "Camera", component: <Camera />, title: "Camera" },
    { id: "Shadows", component: <Shadows />, title: "Shadows" },
    { id: "Fog", component: <Fog />, title: "Fog" },
    {
      id: "RenderTargets",
      component: <RenderTargets />,
      title: "Render Targets",
    },
    {
      id: "RenderingOptimization",
      component: <RenderingOptimization />,
      title: "Rendering Optimization",
    },
    {
      id: "AnimationOptimization",
      component: <AnimationOptimization />,
      title: "Animation Optimization",
    },
    {
      id: "GLTFLoader",
      component: <GLTFLoader />,
      title: "GLTF Loader",
    },
    { id: "Baseball", component: <Baseball />, title: "Baseball" },
    { id: "Pitch", component: <Pitch />, title: "Pitch" },
    { id: "Design_1", component: <Design_1 />, title: "Design_1" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Threejs</h1>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setCurrentPage(page.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === page.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {pages.find((page) => page.id === currentPage)?.component}
      </div>
    </div>
  );
};

export default ThreejsIndex;
