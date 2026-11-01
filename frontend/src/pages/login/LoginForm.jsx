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

const DEMO_USERS = [
  {
    username: "allen",
    pin: "1234",
    name: "Allen Caraan",
    role: "OWNER",
    avatar: null,
  },
];

export default function LoginForm({ active, onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
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

  const handlePinChange = (e) => {
    setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }

    if (pin.length !== 4) {
      toast.error("Your PIN must be 4 digits");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const match = DEMO_USERS.find(
        (u) => u.username === username.trim().toLowerCase() && u.pin === pin
      );

      setLoading(false);

      if (!match) {
        toast.error("Wrong username or PIN");
        setPin("");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }

      onLoggedIn(match);
    }, 700);
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
          <label htmlFor="login-pin">PIN</label>
          <button
            type="button"
            className="link"
            onClick={() =>
              toast.info("Please ask your manager to reset your PIN")
            }
          >
            Forgot PIN?
          </button>
        </div>

        <div className="input-box">
          <LockKeyhole size={20} />
          <input
            id="login-pin"
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            placeholder="Enter 4-digit PIN"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={handlePinChange}
          />

          <button
            type="button"
            className="eye"
            onClick={() => setShowPin((s) => !s)}
            aria-label={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
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