import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: "▣" },
    { name: "Incidents", path: "/incidents", icon: "🚨" },
    { name: "Resources", path: "/resources", icon: "🚑" },
    { name: "City Map", path: "/city-map", icon: "🗺" },
    { name: "Dispatch Engine", path: "/dispatch", icon: "⚙" },
    { name: "Priority Queue", path: "/priority", icon: "📊" },
    { name: "Mathematics", path: "/mathematics", icon: "∑" },
    { name: "Communication", path: "/communication", icon: "📡" },
    { name: "Reports", path: "/reports", icon: "📋" },
    
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">⚡</div>

        <div>
          <h2>SMART-ERS</h2>
          <span>Emergency Response</span>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="system-status">
        <span className="status-dot"></span>

        <div>
          <strong>System Online</strong>
          <small>All services operational</small>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;