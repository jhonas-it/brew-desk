import { motion } from "motion/react";
import { User } from "lucide-react";
import LoginTopBar from "./LoginTopBar";

export default function WelcomeScreen({ user, visible }) {
  return (
    <motion.div
      className="login-welcome"
      aria-hidden={!visible}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{
        duration: visible ? 0.6 : 0.3,
        delay: visible ? 0.5 : 0,
      }}
    >
      <LoginTopBar />

      {user && (
        <main className="body">
          <h1>Welcome Back!</h1>
          <p className="tagline">
            A system for your
            <strong>Cafe</strong>
          </p>

          <div className="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <User size={56} strokeWidth={1.5} />
            )}
          </div>

          <h2 className="user-name">{user.name}</h2>
          <span className="role">{user.role}</span>
        </main>
      )}
    </motion.div>
  );
}