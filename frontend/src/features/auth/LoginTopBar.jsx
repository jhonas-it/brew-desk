import BrewLogo from "./BrewLogo";

export default function LoginTopBar() {
  return (
    <header className="login-topbar">
      <div className="brand">
        <BrewLogo size={40} className="logo" />
        <span className="name">Brew Desk</span>
      </div>
      <span className="version">POS v1.0</span>
    </header>
  );
}