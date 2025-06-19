
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";

const queryClient = new QueryClient();

const App = () => {
  // Find the nested portal route
  const portalRoute = navItems.find(item => item.to === "/:franchiseeSlug/portal");
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {navItems.map((item, index) => {
            // Handle the special nested portal route
            if (item.to === "/:franchiseeSlug/portal" && item.children) {
              return (
                <Route
                  key={index}
                  path={item.to}
                  element={item.page}
                >
                  {item.children.map((child, childIndex) => {
                    if (child.index) {
                      return (
                        <Route
                          key={childIndex}
                          index
                          element={child.page}
                        />
                      );
                    }
                    return (
                      <Route
                        key={childIndex}
                        path={child.to}
                        element={child.page}
                      />
                    );
                  })}
                </Route>
              );
            }
            
            // Handle regular routes
            return (
              <Route
                key={index}
                path={item.to}
                element={item.page}
              />
            );
          })}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
