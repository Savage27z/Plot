"use client";

import { motion } from "framer-motion";

export default function Toast({ message }: { message: string }) {
  return (
    <motion.div
      className="absolute left-1/2 top-8 z-50 -translate-x-1/2"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="border border-bone/20 bg-char/90 px-6 py-3 font-serif italic text-bone text-lg backdrop-blur-sm">
        {message}
      </div>
    </motion.div>
  );
}
