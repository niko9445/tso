import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import "./DashboardStyle.css";

function Dashboard() {
  return (
    <>
      <Sidebar />
      <div className="dashboard-container">
        <div className="dashboard-main">
          <div className="dashboard-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;