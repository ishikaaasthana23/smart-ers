function Header({ title, subtitle }) {
  return (
    <header className="header">

      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-status">
        <span className="status-dot"></span>
        LIVE SYSTEM
      </div>

    </header>
  );
}

export default Header;