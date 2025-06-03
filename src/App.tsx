import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import NetworkHealthCheck from './components/debug/NetworkHealthCheck';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Tooltip.Provider>
        <div className="min-h-screen flex flex-col">
          <BrowserRouter>
            <Routes>
              {navItems.map(({ to, page }) => (
                <Route key={to} path={to} element={page} />
              ))}
            </Routes>
          </BrowserRouter>
        </div>
      </Tooltip.Provider>
      {/* Add network health check for debugging */}
      <NetworkHealthCheck />
    </QueryClientProvider>
  );
}

export default App;
