import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "../nav-items";
import { useImpersonation } from '@/hooks/useImpersonation';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export const AppWrapper: React.FC = () => {
  const { isImpersonating, impersonationSession, exitImpersonation } = useImpersonation();

  return (
    <BrowserRouter>
      {isImpersonating && impersonationSession && (
        <ImpersonationBanner
          targetUser={impersonationSession.targetUser}
          onExitImpersonation={exitImpersonation}
        />
      )}
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
  );
};