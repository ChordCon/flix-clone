import { useQuery } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { getMovies, IMovie, popMovies } from "../api";
import { makeImgPath } from "../utils";
import { useEffect, useState } from "react";
import { useNavigate, useMatch } from "react-router-dom";

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
  padding: 60px;
  flex-direction: column;
  justify-content: center;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center;
`;

const TextContent = styled.div`
  width: 40%;
  padding: 20px;
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
  grid-gap: 25vw;
  position: relative;
  top: -250px;
  margin-bottom: 20vw;
`;

const NowPlayingSlider = styled(motion.div)`
  position: relative;
  margin: 3vw;
`;
const PopSlider = styled(motion.div)`
  position: relative;
  margin: 3vw;
`;
const NowPlayingTitle = styled.div`
  margin-bottom: 10px;
  font-size: 30px;
`;
const PopPlayingTitle = styled(motion.div)`
  margin-bottom: 10px;
  font-size: 30px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  height: 25vw;
  background-image: url(${(props) => props.bgPhoto});
  background-position: center center;
  background-size: cover;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
  cursor: pointer;
`;

const Info = styled(motion.div)`
  padding: 10px;
  opacity: 0;
  position: absolute;
  bottom: 0;
  width: 100%;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 0);
`;
const MovieModal = styled(motion.div)`
  z-index: 100;
  position: fixed;
  width: 60vw;
  height: 90vh;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  background-color: black;
  border: 3px solid ${(props) => props.theme.white.darker};
  border-radius: 20px;
`;

const MovieModalImg = styled(motion.div)`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
  border-radius: 20px 20px 0 0;
`;
const MovieModalInfo = styled(motion.div)`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
`;
const MovieModalInfoTop = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;
const ModalInfoTopTitle = styled(motion.span)`
  font-weight: 500;
  font-size: 28px;
`;
const MovieModalInfoMid = styled(motion.div)``;
const MovieModalInfoBottom = styled(motion.div)`
  text-align: right;
  position: absolute;
  right: 20px;
  bottom: 20px;
`;

const GoLeft = styled.div`
  padding: 2px;
  position: absolute;
  left: -20px;
  height: 25vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px 0 0 10px;
`;
const GoRight = styled.div`
  padding: 2px;
  position: absolute;
  right: -20px;
  height: 25vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0 10px 10px 0;
`;

const rowVariants = {
  hidden: (movingDirection: boolean) => {
    return {
      x: movingDirection ? window.innerWidth + 5 : -window.innerWidth - 5,
    };
  },
  visible: { x: 0 },
  exit: (movingDirection: boolean) => {
    return {
      x: !movingDirection ? window.innerWidth + 5 : -window.innerWidth - 5,
    };
  },
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
    backgroundColor: "#2F2F2F",
    opacity: 1,
    marginTop: "25vw",
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.7 },
  exit: { opacity: 0 },
};

//슬라이드에 한번에 나올 아이템의 갯수
const offset = 6;

function Home() {
  const [movingDirection, setMovingDirection] = useState(false);
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
      setMovingDirection(true);
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

  const decreaseIndexNow = () => {
    if (now) {
      setMovingDirection(false);
      if (nowLeaving) {
        return;
      } else {
        setNowLeaving(true);
        let totalMoives = now?.results.length - 1;
        let maxIndex = Math.floor(totalMoives / offset) - 1;
        setNowIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
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
        setMovingDirection(true);
        setPopLeaving(true);
        let totalMoives = pop?.results.length - 1;
        let maxIndex = Math.floor(totalMoives / offset) - 1;
        setPopIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };

  const decreaseIndexPop = () => {
    if (pop) {
      if (popLeaving) {
        return;
      } else {
        setMovingDirection(false);
        setPopLeaving(true);
        let totalMoives = pop?.results.length - 1;
        let maxIndex = Math.floor(totalMoives / offset) - 1;
        setPopIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };

  const [resize, setResize] = useState(window.innerWidth);

  const handleResize = () => {
    setResize(window.innerWidth);
  };

  const navigate = useNavigate();
  const modarMatch = useMatch("/movies/:id");
  const onBoxClicked = (movieId: string) => {
    navigate(`/movies/${movieId}`);
  };

  const onOverlayClick = () => {
    navigate("/");
  };

  //슬라이더가 더 늘어 나면 수정필요.
  let modarMatchTrans = modarMatch?.params.id?.slice(0, -3);
  const clickedMovie = modarMatch?.params.id?.includes("now")
    ? modarMatchTrans &&
      now?.results.find((movie) => movie.id + "" === modarMatchTrans)
    : modarMatchTrans &&
      pop?.results.find((movie) => movie.id + "" === modarMatchTrans);
  let objClickedMovie = eval("(" + JSON.stringify(clickedMovie) + ")");
  console.log(objClickedMovie);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Wrapper>
      {nowLoding && popLoding ? (
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
              <NowPlayingTitle>Now Playing</NowPlayingTitle>
              <AnimatePresence
                initial={false}
                onExitComplete={() => setNowLeaving((prev) => !prev)}
                custom={movingDirection}
              >
                <GoLeft onClick={IncreaseIndexNow}>◁</GoLeft>
                <Row
                  custom={movingDirection}
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
                        layoutId={`${movie.id}now`}
                        onClick={() => onBoxClicked(`${movie.id}now`)}
                        variants={boxVariants}
                        initial="nomal"
                        whileHover="hover"
                        transition={{ type: "tween" }}
                        key={movie.id}
                        bgPhoto={makeImgPath(movie.poster_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <div>{movie.title}</div>
                        </Info>
                      </Box>
                    ))}
                </Row>
                <GoRight onClick={decreaseIndexNow}>▷</GoRight>
              </AnimatePresence>
            </NowPlayingSlider>

            <PopSlider>
              <AnimatePresence
                initial={false}
                onExitComplete={() => setPopLeaving((prev) => !prev)}
                custom={movingDirection}
              >
                <PopPlayingTitle>Pop Playing</PopPlayingTitle>
                <GoLeft onClick={IncreaseIndexPop}>◁</GoLeft>
                <Row
                  variants={rowVariants}
                  custom={movingDirection}
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
                        layoutId={`${movie.id}pop`}
                        onClick={() => onBoxClicked(`${movie.id}pop`)}
                        variants={boxVariants}
                        initial="nomal"
                        whileHover="hover"
                        transition={{ type: "tween" }}
                        key={movie.id}
                        bgPhoto={makeImgPath(movie.poster_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <div>{movie.title}</div>
                        </Info>
                      </Box>
                    ))}
                </Row>
                <GoRight onClick={decreaseIndexPop}>▷</GoRight>
              </AnimatePresence>
            </PopSlider>
          </Sliders>
          <AnimatePresence>
            {modarMatch ? (
              <>
                <Overlay
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={onOverlayClick}
                ></Overlay>
                <MovieModal layoutId={modarMatch.params.id}>
                  <MovieModalImg
                    style={{
                      backgroundImage: `url(${makeImgPath(
                        objClickedMovie.backdrop_path,
                        "w500"
                      )})`,
                    }}
                  ></MovieModalImg>
                  <MovieModalInfo>
                    <MovieModalInfoTop>
                      <ModalInfoTopTitle>
                        {objClickedMovie.title}
                      </ModalInfoTopTitle>
                      <span style={{ alignItems: "center", display: "flex" }}>
                        {objClickedMovie.adult ? "Adult 🔴" : "Adult 🟢"}
                      </span>
                    </MovieModalInfoTop>
                    <MovieModalInfoMid>
                      <p>{objClickedMovie.overview}</p>
                    </MovieModalInfoMid>
                    <MovieModalInfoBottom>
                      <div>Vote average : {objClickedMovie.vote_average}</div>
                      <div>Vote count : {objClickedMovie.vote_count}</div>
                      <div>Release date : {objClickedMovie.release_date}</div>
                    </MovieModalInfoBottom>
                  </MovieModalInfo>
                </MovieModal>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
