import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import SideDrawer from "./SideDrawer";

function MobileLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const pageClass = pathname === "/notifications" ? "notifications-page" : "";

  return (
    <div className={`app-shell home-page mobile-route ${pageClass}`}>
      <Header
        onMenuClick={() => setDrawerOpen(true)}
        onNotificationsClick={() => navigate("/notifications")}
        onSearchClick={() => navigate("/dashboard")}
      />

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className={pathname === "/notifications" ? "page-content notifications-page-content" : "page-content"}>
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

export default MobileLayout;
