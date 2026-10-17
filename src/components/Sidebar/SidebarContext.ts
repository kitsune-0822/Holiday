import { createContext, useContext } from 'react';

/** 사이드바가 화면에 접혀 보이는지. NavItem·NavGroup이 prop 없이도 따라간다. */
export const SidebarCollapsedContext = createContext(false);

export function useSidebarCollapsed(override?: boolean) {
  const collapsed = useContext(SidebarCollapsedContext);
  return override ?? collapsed;
}
