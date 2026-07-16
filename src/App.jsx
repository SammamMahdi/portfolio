import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import WorkDetail from "./pages/WorkDetail";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRobot } from "./components/AnimatedRobot";

function AppContent() {
  const location = useLocation();
  const hideRobot =
    location.pathname.startsWith("/analytics") ||
    location.pathname.startsWith("/notfound") ||
    location.pathname.startsWith("/work");
  return (
    <>
      <Toaster />
      {!hideRobot && <AnimatedRobot />}
      <Routes>
        <Route index element={<Home />} />
        <Route path="/work/:slug" element={<WorkDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
