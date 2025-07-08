
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {navItems.map((item, index) => {
            // Handle nested routes (portal and admin)
            if (item.children) {
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
