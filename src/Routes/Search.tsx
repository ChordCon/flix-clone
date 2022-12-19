import { useLocation } from "react-router";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  top: 100px;
  padding: 20px;
`;

const SearchName = styled.h1``;

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");

  return (
    <Wrapper>
      <SearchName>{keyword}에 대한 검색 결과입니다.</SearchName>
    </Wrapper>
  );
}
export default Search;
