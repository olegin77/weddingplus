declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    decay?: number;
    startVelocity?: number;
    zIndex?: number;
  }

  function confetti(options?: Options): Promise<void>;
  
  export default confetti;
}