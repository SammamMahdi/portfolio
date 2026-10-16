import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import NotFound from "./pages/NotFound";
import WorkDetail from "./pages/WorkDetail";
import { Toaster } from "@/components/ui/toaster";
import { TermProvider } from "@/components/term/TermContext";
import { Crt } from "@/components/term/Crt";
import { Shell } from "@/components/shell/Shell";

const Analytics = lazy(() => import("./pages/Analytics"));

function App() {
  return (
    <BrowserRouter>
      <TermProvider>
        <Toaster />
        <Crt />
        <Shell />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TermProvider>
    </BrowserRouter>
  );
}

export default App;
