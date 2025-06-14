
import { RouteObject } from 'react-router-dom';

interface NavItem {
  title: string;
  to: string;
  icon: React.ReactNode;
  page: React.ReactNode;
  index?: boolean;
  children?: NavItem[];
}

export function createNestedRoutes(navItems: NavItem[]): RouteObject[] {
  return navItems.map((item) => {
    const route: Partial<RouteObject> = {
      path: item.to,
      element: item.page,
    };

    if (item.index) {
      route.index = true;
      // Remove the path when it's an index route
      delete route.path;
    }

    if (item.children) {
      route.children = createNestedRoutes(item.children);
    }

    return route as RouteObject;
  });
}
