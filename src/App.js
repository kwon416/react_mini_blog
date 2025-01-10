import React from "react";
import styled from "styled-components";
// Pages
import MainPage from "./components/page/MainPage";
import PostWritePage from "./components/page/PostWritePage";
import PostViewPage from "./components/page/PostViewPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const MainTitleText = styled.p`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

function App() {
  return (
    <BrowserRouter>
      <MainTitleText>마루의 미니 블로그</MainTitleText>
      <Routes>
        <Route index element={<MainPage />} />
        <Route path="/post-write" element={<PostWritePage />} />
        <Route path="/post/:postId" element={<PostViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
