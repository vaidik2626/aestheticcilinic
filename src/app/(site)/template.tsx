"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Transición entre páginas. Solo opacidad: una transformación en este
 * contenedor rompería los elementos fijados por ScrollTrigger.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
