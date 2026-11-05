import { motion } from "motion/react";
import { MousePointerClick } from "lucide-react";
import BrewLogo from "./BrewLogo";

export default function LoginCover({ active, onContinue }) {
  return (
    <motion.div
      className="login-cover"
      role="button"
      tabIndex={0}
      aria-label="Click to continue"
      inert={!active}
      onClick={onContinue}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onContinue();
        }
      }}
      animate={{
        opacity: active ? 1 : 0,
        pointerEvents: active ? "auto" : "none",
      }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="brand"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <BrewLogo size={72} className="logo" />
        <span className="name">Brew Desk</span>
      </motion.div>

      <motion.p
        className="hint"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
      >
        <MousePointerClick size={18} />
        Click anywhere to continue
      </motion.p>
    </motion.div>
  );
}