import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../ui/Buttons";
import TextInput from "../ui/TextInput";

const Wrapper = styled.div`
  padding: 16px;
  width: calc(100% - 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 720px;

  & > * {
    :not(:last-child) {
      margin-bottom: 16px;
    }
  }
`;

function PostWritePage(props) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <Wrapper>
      <Container>
        <TextInput
          label="제목"
          height={20}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextInput
          label="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
        />
        <Button
          title="글 작성하기"
          onClick={() => {
            navigate("/");
          }}
        />
      </Container>
    </Wrapper>
  );
}

export default PostWritePage;
