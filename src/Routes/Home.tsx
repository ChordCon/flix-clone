import { useQuery } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { getMovies, IMovie, popMovies } from "../api";
import { makeImgPath } from "../utils";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
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

const Sliders = styled.div`
  display: grid;
  gap: 200px;
  grid-template-rows: repeat(2, 1fr); //슬라이드가 추가되면 수정
  position: relative;
  top: -220px;
  margin-left: 50px;
  margin-right: 10px;
`;

const NowPlayingSlider = styled(motion.div)`
  margin-bottom: 50px;
`;
const PopSlider = styled(motion.div)`
  margin-bottom: 50px;
`;
const NowPlayingTitle = styled.div`
  font-size: 30px;
  margin: 0 0 20px 0;
`;
const PopPlayingTitle = styled.div`
  font-size: 30px;
  margin: 0 0 20px 0;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(5, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  height: 200px;
  background-image: url(${(props) => props.bgPhoto});
  background-position: center center;
  background-size: cover;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const rowVariants = {
  hidden: { x: window.innerWidth - 10 },
  visible: { x: 0 },
  exit: { x: -window.innerWidth + 10 },
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -30,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

//슬라이드에 한번에 나올 아이템의 갯수
const offset = 5;

function Home() {
  const { data: now, isLoading: nowLoding } = useQuery<IMovie>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const { data: pop, isLoading: popLoding } = useQuery<IMovie>(
    ["movies", "pop"],
    popMovies
  );
  const [nowIndex, setNowIndex] = useState(0);
  const [nowLeaving, setNowLeaving] = useState(false);
  const IncreaseIndexNow = () => {
    if (now) {
      if (nowLeaving) {
        return;
      } else {
        setNowLeaving(true);
        let totalMoives = now?.results.length - 1;
        let maxIndex = Math.floor(totalMoives / offset) - 1;
        setNowIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };

  const [popIndex, setPopIndex] = useState(0);
  const [popLeaving, setPopLeaving] = useState(false);
  const IncreaseIndexPop = () => {
    if (pop) {
      if (popLeaving) {
        return;
      } else {
        setPopLeaving(true);
        let totalMoives = pop?.results.length - 1;
        let maxIndex = Math.floor(totalMoives / offset) - 1;
        setPopIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
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
      {nowLoding ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner bgPhoto={makeImgPath(now?.results[0].backdrop_path || "")}>
            <TextContent>
              <Title>{now?.results[0].title}</Title>
              {resize > 900 ? (
                <Overview>{now?.results[0].overview}</Overview>
              ) : null}
            </TextContent>
          </Banner>
          <Sliders>
            <NowPlayingSlider>
              <NowPlayingTitle onClick={IncreaseIndexNow}>
                Now Playing
              </NowPlayingTitle>
              <AnimatePresence
                initial={false}
                onExitComplete={() => setNowLeaving((prev) => !prev)}
              >
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={nowIndex}
                >
                  {now?.results
                    .slice(1)
                    .slice(offset * nowIndex, offset * nowIndex + offset)
                    .map((movie) => (
                      <Box
                        variants={boxVariants}
                        initial="nomal"
                        whileHover="hover"
                        transition={{ type: "tween" }}
                        key={movie.id}
                        bgPhoto={makeImgPath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <div>{movie.title}</div>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </NowPlayingSlider>
            <PopSlider>
              <PopPlayingTitle onClick={IncreaseIndexPop}>
                Pop Playing
              </PopPlayingTitle>
              <AnimatePresence
                initial={false}
                onExitComplete={() => setPopLeaving((prev) => !prev)}
              >
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={popIndex}
                >
                  {pop?.results
                    .slice(1)
                    .slice(offset * popIndex, offset * popIndex + offset)
                    .map((movie) => (
                      <Box
                        variants={boxVariants}
                        initial="nomal"
                        whileHover="hover"
                        transition={{ type: "tween" }}
                        key={movie.id}
                        bgPhoto={makeImgPath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <div>{movie.title}</div>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </PopSlider>
          </Sliders>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
