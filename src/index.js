import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ThreejsIndex from "./threejs/ThreejsIndex";
import { Helmet } from "react-helmet";
import { Canvas } from "@react-three/fiber";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Helmet>
      <title>Three.js 연습</title>
      <meta
        name="viewport"
        content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
      ></meta>
    </Helmet>
    <ThreejsIndex />
    {/* <App /> */}
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
