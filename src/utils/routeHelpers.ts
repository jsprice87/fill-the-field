
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
    const route: RouteObject = {
      path: item.to,
      element: item.page,
    };

    if (item.index) {
      route.index = true;
      delete route.path;
    }

    if (item.children) {
      route.children = createNestedRoutes(item.children);
    }

    return route;
  });
}
