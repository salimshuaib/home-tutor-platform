import { NavLink } from 'react-router-dom';

export default function Sidebar({ links, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-inner">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
