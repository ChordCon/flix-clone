import { useQuery } from "react-query";
import { getMovies, IMovie } from "../api";
import styled from "styled-components";
import { makeImgPath } from "../utils";
const Wrapper = styled.div`
  background: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center;
`;

const TextContent = styled.div`
  width: 40%;
  padding: 20px;
  border: none;
  border-radius: 70px;
  background: radial-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;
const Overview = styled.p`
  font-size: 20px;
`;

function Home() {
  const { data, isLoading } = useQuery<IMovie>(
    ["movies", "nowPlaying"],
    getMovies
  );
  console.log(data);
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner bgPhoto={makeImgPath(data?.results[0].backdrop_path || "")}>
            <TextContent>
              <Title>{data?.results[0].title}</Title>
              <Overview>{data?.results[0].overview}</Overview>
            </TextContent>
          </Banner>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
