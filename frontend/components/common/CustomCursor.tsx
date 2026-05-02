"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.getAttribute("data-cursor")
      ) {
        setIsHovering(true);
        const text = target.getAttribute("data-cursor-text");
        if (text) setCursorText(text);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
      setCursorText("");
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="custom-cursor flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter text-black"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        left: -6,
        top: -6,
      }}
      animate={{
        width: isHovering ? (cursorText ? 80 : 64) : 12,
        height: isHovering ? (cursorText ? 80 : 64) : 12,
        backgroundColor: isHovering ? "#ffffff" : "#ffffff",
        mixBlendMode: cursorText ? "normal" : "difference",
      }}
    >
      {cursorText && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          {cursorText}
        </motion.span>
      )}
    </motion.div>
  );
}
