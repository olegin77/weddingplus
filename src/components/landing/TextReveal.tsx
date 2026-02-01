import { motion, useInView } from "framer-motion";
import { useRef, memo, useMemo } from "react";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  gradient?: boolean;
}

export const TextReveal = memo(({ 
  text, 
  className = "", 
  delay = 0, 
  staggerDelay = 0.03,
  as: Component = "span",
  gradient = false,
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const words = useMemo(() => text.split(" "), [text]);
  
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay * 3,
        delayChildren: delay,
      },
    },
  };
  
  const wordVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
  
  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      rotateX: -90,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${gradient ? 'text-gradient-animated' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{ perspective: 1000 }}
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          variants={wordVariants}
          className="inline-block whitespace-nowrap mr-[0.25em]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {word.split("").map((letter, letterIndex) => (
            <motion.span
              key={letterIndex}
              variants={letterVariants}
              className="inline-block gpu-accelerated"
              style={{ transformStyle: "preserve-3d" }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </motion.div>
  );
});

TextReveal.displayName = "TextReveal";
