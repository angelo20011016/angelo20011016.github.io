"use client";

import { TypeAnimation } from 'react-type-animation';

interface TypewriterTitleProps {
  sequence: (string | number)[];
  className?: string;
  wrapper?: "span" | "div" | "h1" | "h2" | "p";
}

export const TypewriterTitle = ({ sequence, className, wrapper = "span" }: TypewriterTitleProps) => {
  return (
    <TypeAnimation
      sequence={sequence}
      wrapper={wrapper}
      speed={50}
      className={className}
      repeat={Infinity}
      cursor={true}
    />
  );
};
