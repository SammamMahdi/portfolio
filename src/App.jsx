import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRobot } from "./components/AnimatedRobot";
import { Analytics } from "@vercel/analytics/next"
function App() {
  return (
    <>
      <Toaster />
      <AnimatedRobot />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
}

export default App;
