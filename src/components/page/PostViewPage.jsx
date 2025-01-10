import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Button from "../ui/Buttons";
import TextInput from "../ui/TextInput";
import CommentList from "../list/CommentList";
import data from "../../data.json";

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

const PostContainer = styled.div`
  padding: 8px 16px;
  border: 1px solid grey;
  border-radius: 8px;
`;

const TitleText = styled.p`
  font-size: 28px;
  font-weight: bold;
`;

const ContentText = styled.p`
  font-size: 20px;
  line-height: 32px;
  white-space: pre-wrap;
`;

const CommentLable = styled.p`
  font-size: 16px;
  font-weight: bold;
`;

function PostViewPage(props) {
  const navigate = useNavigate();
  const { postId } = useParams();

  const post = data.find((item) => item.id === Number(postId));

  const [comment, setComment] = useState("");

  return (
    <Wrapper>
      <Container>
        <Button
          title="뒤로 가기"
          onClick={() => {
            navigate("/");
          }}
        />
        <PostContainer>
          <TitleText>{post.title}</TitleText>
          <ContentText>{post.content}</ContentText>
        </PostContainer>
        <CommentLable>댓글</CommentLable>
        <CommentList comments={post.comments} />
        <TextInput
          height={40}
          label="댓글"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          title="댓글 작성하기"
          onClick={() => {
            navigate("/");
          }}
        />
      </Container>
    </Wrapper>
  );
}

export default PostViewPage;
