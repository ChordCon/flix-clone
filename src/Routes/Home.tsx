import { useQuery } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { getMovies, IMovie } from "../api";
import { makeImgPath } from "../utils";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  background: black;
  overflow-x: hidden;
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
  font-size: 5.3vw;
  margin-bottom: 20px;
`;
const Overview = styled.p`
  font-size: 1.3vw;
`;

const Slider = styled(motion.div)`
  position: relative;
  top: -120px;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  height: 200px;
  background-image: url(${(props) => props.bgPhoto});
  background-position: center center;
  background-size: cover;
`;

const rowVariants = {
  hidden: { x: window.innerWidth - 10 },
  visible: { x: 0 },
  exit: { x: -window.innerWidth + 10 },
};

//슬라이드에 한번에 나올 아이템의 갯수
const offset = 6;

function Home() {
  const { data, isLoading } = useQuery<IMovie>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const IncreaseIndex = () => {
    if (data) {
      if (leaving) {
        return;
      } else {
        setLeaving(true);
        let totalMoives = data?.results.length - 1;
        let maxIndex = Math.floor(totalMoives / offset) - 1;
        setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };

  const [resize, setResize] = useState(window.innerWidth);

  const handleResize = () => {
    setResize(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            onClick={IncreaseIndex}
            bgPhoto={makeImgPath(data?.results[0].backdrop_path || "")}
          >
            <TextContent>
              <Title>{data?.results[0].title}</Title>
              {resize > 900 ? (
                <Overview>{data?.results[0].overview}</Overview>
              ) : null}
            </TextContent>
          </Banner>
          <Slider>
            <AnimatePresence
              initial={false}
              onExitComplete={() => setLeaving((prev) => !prev)}
            >
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      key={movie.id}
                      bgPhoto={makeImgPath(movie.backdrop_path, "w500")}
                    />
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
