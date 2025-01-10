import React, { useState } from "react";
import RotateCube from "./components/RotateCube";
import DrawLine from "./components/DrawLine";
import CreateText from "./components/CreateText";
import LoadModel from "./components/LoadModel";
import Box from "./components/Box";
import PrimitivesModel from "./components/PrimitivesModel";
import SceneGraph from "./components/SceneGraph";
import Tank from "./components/Tank";

const ThreejsIndex = () => {
  const [currentPage, setCurrentPage] = useState("RotateCube");

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
