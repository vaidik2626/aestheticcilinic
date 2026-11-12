"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { useLenis } from "@/hooks/use-lenis";
import { whatsappFor } from "@/lib/whatsapp";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-accent"
    />
  );
}

function useScrolledPast(px: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > px);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [px]);
  return past;
}

export function FloatingActions({ whatsappPhone }: { whatsappPhone: string }) {
  const lenis = useLenis();
  const pathname = usePathname();
  const showTop = useScrolledPast(900);
  const hideOnBooking = pathname.startsWith("/reservar");

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            type="button"
            onClick={toTop}
            aria-label="Volver arriba"
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex size-12 items-center justify-center rounded-full border hairline bg-background/90 text-ink backdrop-blur"
          >
            <ArrowUp size={17} strokeWidth={1.4} />
          </motion.button>
        )}
      </AnimatePresence>
      {!hideOnBooking && (
        <motion.a
          href={whatsappFor("general", whatsappPhone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="group pointer-events-auto flex h-14 items-center gap-0 rounded-full bg-primary-dark pl-[1.1rem] pr-[1.1rem] text-background shadow-[0_18px_40px_-18px_rgba(60,48,42,0.7)]"
        >
          <WhatsappIcon size={20} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-700 ease-expo group-hover:ml-3 group-hover:max-w-40">
            Escríbenos
          </span>
        </motion.a>
      )}
    </div>
  );
}
