import * as React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";
import styled from "styled-components";
import { ITv, onTheAir, topRated } from "../api";
import { useQuery } from "react-query";
import { makeImgPath } from "../utils";
import { useMatch, useNavigate } from "react-router-dom";

const Wrap = styled.div`
  overflow-x: hidden;
  display: block;
`;

const Sliders = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  top: -500px;
  padding: 20px;
  margin: 0 2vw;
`;
const Slider = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  position: relative;
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
  background-position: center center;
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

const Box = styled(motion.div)<{ bgPhoto: string }>`
  margin: 10px;
  width: 100%;
  height: 25vw;
  background-image: url(${(props) => props.bgPhoto});
  background-position: center center;
  background-size: cover;
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

const GoLeft = styled.div`
  padding: 2px;
  position: absolute;
  left: 10px;
  height: 25vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px 0 0 10px;
  font-weight: bold;
  cursor: pointer;
`;
const GoRight = styled.div`
  padding: 2px;
  position: absolute;
  right: 10px;
  height: 25vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0 10px 10px 0;
  font-weight: bold;
  cursor: pointer;
`;
const TopTitle = styled.div`
  position: relative;
  margin: 15px;
  font-size: 4vw;
  top: -14vw;
`;

const variants = {
  enter: (direction: number) => {
    return {
      transition: {
        type: "tween",
      },
      x: direction > 0 ? window.innerWidth : -window.innerWidth,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      transition: {
        type: "tween",
      },
      zIndex: 0,
      x: direction < 0 ? window.innerWidth : -window.innerWidth,
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
    y: 40,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const swipeConfidenceThreshold = window.innerWidth;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

function Tv() {
  const { data: tvTopRated, isLoading: tvTopRatedLoding } = useQuery<ITv>(
    ["tv", "topRated"],
    topRated
  );
  const { data: onAir, isLoading: onAirLoding } = useQuery<ITv>(
    ["tv", "onAir"],
    onTheAir
  );
  console.log(tvTopRated);
  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, tvTopRated?.results.length!, page);

  const tvTopSliderItems = [
    tvTopRated?.results[index],
    tvTopRated?.results[index + 1],
    tvTopRated?.results[index + 2],
    tvTopRated?.results[index + 3],
    tvTopRated?.results[index + 4],
  ];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const navigate = useNavigate();
  const modarMatch = useMatch("/movies/:id");
  const onBoxClicked = (movieId: string) => {
    navigate(`/movies/${movieId}`);
  };

  const onOverlayClick = () => {
    navigate("/");
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
    <Wrap>
      <Banner
        bgPhoto={
          tvTopRated?.results[0].backdrop_path
            ? makeImgPath(tvTopRated?.results[0].backdrop_path)
            : makeImgPath(tvTopRated?.results[0].poster_path!)
        }
      >
        <TextContent>
          <Title>{tvTopRated?.results[0].name}</Title>
          {resize > 900 ? (
            <Overview>{tvTopRated?.results[0].overview}</Overview>
          ) : null}
        </TextContent>
      </Banner>
      <TopTitle>TopRated</TopTitle>
      <Sliders>
        <GoLeft onClick={() => paginate(5)}>{"<"}</GoLeft>
        <AnimatePresence initial={false} custom={direction}>
          <Slider
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "tween",
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
          >
            {tvTopSliderItems.map((tv) => (
              <Box
                layoutId={`${tv?.id}top`}
                onClick={() => onBoxClicked(`${tv?.id}top`)}
                variants={boxVariants}
                initial="nomal"
                whileHover="hover"
                key={tv?.id}
                bgPhoto={makeImgPath(tv?.poster_path!, "w500")}
              >
                <Info variants={infoVariants}>
                  <div>{tv?.name}</div>
                </Info>
              </Box>
            ))}
          </Slider>
        </AnimatePresence>
        <GoRight onClick={() => paginate(-5)}>{">"}</GoRight>
      </Sliders>
    </Wrap>
  );
}

export default Tv;
