import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRobot } from "./components/AnimatedRobot";
function App() {
  return (
    <>
      <Toaster />
      <AnimatedRobot />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
