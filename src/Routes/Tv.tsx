import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";
import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Slider = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Buttons = styled.div`
  top: calc(50% - 20px);
  position: absolute;
  background: white;
  border-radius: 30px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
  z-index: 2;
`;

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? window.innerWidth : -window.innerWidth,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? window.innerWidth : -window.innerWidth,
      opacity: 0,
    };
  },
};
const images = [1, 2, 3];
const swipeConfidenceThreshold = window.innerWidth;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

function Tv() {
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = wrap(0, images.length, page);
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };
  return (
    <Wrap>
      <AnimatePresence initial={false} custom={direction}>
        <Slider
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
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
          {images[imageIndex]}
        </Slider>
      </AnimatePresence>
      <Buttons style={{ left: "10px" }} onClick={() => paginate(1)}>
        {"<"}
      </Buttons>
      <Buttons style={{ right: "10px" }} onClick={() => paginate(-1)}>
        {">"}
      </Buttons>
    </Wrap>
  );
}

export default Tv;
