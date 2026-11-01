import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Toaster, toast } from "sonner";
import { User } from "lucide-react";
import foodPhoto from "../../assets/login-bg.jpg";
import BrewLogo from "./BrewLogo";
import LoginTopBar from "./LoginTopBar";
import LoginCover from "./LoginCover";
import LoginForm from "./LoginForm";
import WelcomeScreen from "./WelcomeScreen";
import "./login.css";

const DEMO_USERS = [
  {
    username: "allen",
    pin: "1234",
    name: "Allen Caraan",
    role: "OWNER",
    avatar: null,
  },
];

const WELCOME_HOLD_MS = 2800;
const LEAVE_MS = 450;

const photoVariants = {
  cover: {
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    borderRadius: 0,
    opacity: 1,
  },
  login: {
    left: 12,
    top: 12,
    width: "calc(50% - 24px)",
    height: "calc(100% - 24px)",
    borderRadius: 28,
    opacity: 1,
  },
  welcome: {
    left: 12,
    top: 12,
    width: "calc(50% - 24px)",
    height: "calc(100% - 24px)",
    borderRadius: 28,
    opacity: 0,
  },
  leaving: {
    left: 12,
    top: 12,
    width: "calc(50% - 24px)",
    height: "calc(100% - 24px)",
    borderRadius: 28,
    opacity: 0,
  },
};

const photoTransition = {
  duration: 1,
  ease: [0.65, 0, 0.35, 1],
};

export default function Login({ onLoginSuccess }) {
  const [stage, setStage] = useState("cover");
  const [user, setUser] = useState(null);
  const doneRef = useRef(onLoginSuccess);

  useEffect(() => {
    doneRef.current = onLoginSuccess;
  }, [onLoginSuccess]);

  useEffect(() => {
    if (stage !== "welcome") return;

    const timer = setTimeout(() => setStage("leaving"), WELCOME_HOLD_MS);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "leaving") return;

    const timer = setTimeout(() => doneRef.current?.(user), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [stage, user]);

  const goToLogin = () => {
    if (stage === "cover") setStage("login");
  };

  const handleLoggedIn = (matchedUser) => {
    toast.dismiss();
    setUser(matchedUser);
    setStage("welcome");
  };

  return (
    <motion.div
      className="login-page"
      data-stage={stage}
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === "leaving" ? 0 : 1 }}
      transition={{ duration: stage === "leaving" ? 0.45 : 0.5 }}
    >
      <Toaster richColors position="top-right" />

      <motion.div
        className="login-photo"
        style={{ backgroundImage: `url(${foodPhoto})` }}
        variants={photoVariants}
        initial="cover"
        animate={stage}
        transition={photoTransition}
      />

      <LoginCover active={stage === "cover"} onContinue={goToLogin} />

      <motion.section
        className="login-panel"
        inert={stage !== "login"}
        initial={{ opacity: 0, x: "40%" }}
        animate={{
          opacity: stage === "login" ? 1 : 0,
          x: stage === "login" ? 0 : stage === "cover" ? "40%" : 0,
          pointerEvents: stage === "login" ? "auto" : "none",
        }}
        transition={{
          opacity: {
            duration: stage === "login" ? 0.7 : 0.45,
            delay: stage === "login" ? 0.35 : 0,
          },
          x: {
            duration: 1,
            ease: [0.65, 0, 0.35, 1],
            delay: stage === "login" ? 0.3 : 0,
          },
        }}
      >
        <LoginTopBar />
        <div className="center">
          <LoginForm active={stage === "login"} onLoggedIn={handleLoggedIn} />
        </div>
      </motion.section>

      <WelcomeScreen
        user={user}
        visible={stage === "welcome" || stage === "leaving"}
      />
    </motion.div>
  );
}
