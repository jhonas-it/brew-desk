import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  User,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { loginUser } from "./login.service.js";

export default function LoginForm({ active, onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const usernameRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(
      () => usernameRef.current?.focus({ preventScroll: true }),
      900
    );

    return () => clearTimeout(timer);
  }, [active]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const matchedUser = await loginUser(username, password);

      toast.dismiss();
      onLoggedIn(matchedUser);
    } catch (error) {
      toast.error(error.message || "Login failed");
      setPassword("");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="login-form"
      onSubmit={handleSubmit}
      noValidate
      animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1>Welcome Back!</h1>
      <p className="subtitle">
        Verify your credentials to unlock terminal
      </p>

      <div className="field">
        <label htmlFor="login-username">Username</label>
        <div className="input-box">
          <User size={20} />
          <input
            id="login-username"
            ref={usernameRef}
            type="text"
            placeholder="Enter Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <div className="label-row">
          <label htmlFor="login-password">Password</label>
          <button
            type="button"
            className="link"
            onClick={() =>
              toast.info("Please ask your manager to reset your password")
            }
          >
            Forgot Password?
          </button>
        </div>

        <div className="input-box">
          <LockKeyhole size={20} />

          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="eye"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button type="submit" className="submit" disabled={loading}>
        {loading ? (
          "Verifying…"
        ) : (
          <>
            Unlock POS Terminal <ArrowRight size={20} />
          </>
        )}
      </button>

      <div className="footer">
        <button
          type="button"
          onClick={() =>
            toast.info("Manager override isn't available yet")
          }
        >
          <ShieldCheck size={16} />
          Manager Override
        </button>
      </div>
    </motion.form>
  );
}