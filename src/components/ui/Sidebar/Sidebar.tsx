import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-gray-100 p-4">
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/report">Report Issue</Link></li>
        <li><Link to="/status">My Reports</Link></li>
        <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;