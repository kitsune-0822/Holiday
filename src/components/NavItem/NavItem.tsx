import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { useI18n } from "@/i18n";
import { cx } from "@/lib/cx";
import { CountBadge } from "../CountBadge/CountBadge";
import { Dot } from "../Dot/Dot";
import { useSidebarCollapsed } from "../Sidebar/SidebarContext";
import styles from "./NavItem.module.css";

type NavItemOwnProps<T extends ElementType> = {
  /** 렌더할 요소. 라우터 링크를 쓰려면 `as={NavLink}`와 `to`를 넘긴다. 기본은 button. */
  as?: T;
  icon: ReactNode;
  label: string;
  /**
   * 알림 개수. Figma의 `hasNotifications`를 대체한다.
   * 펼친 상태에서는 숫자, 접힌 상태에서는 점으로 같은 값을 보여준다.
   */
  count?: number;
  /** 링크가 아닌 경우의 선택 상태. NavLink는 aria-current로 자동 처리된다. */
  selected?: boolean;
  disabled?: boolean;
  tone?: "default" | "danger";
  /** 접힌 상태. 라벨은 숨기되 스크린 리더와 툴팁으로 남긴다. 비우면 Sidebar를 따른다. */
  collapsed?: boolean;
  className?: string;
};

export type NavItemProps<T extends ElementType> = NavItemOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof NavItemOwnProps<T>>;

export function NavItem<T extends ElementType = "button">({
  as,
  icon,
  label,
  count = 0,
  selected,
  disabled = false,
  tone = "default",
  collapsed: collapsedProp,
  className,
  ...rest
}: NavItemProps<T>) {
  const collapsed = useSidebarCollapsed(collapsedProp);
  const { m } = useI18n();
  const Component: ElementType = as ?? "button";
  const isButton = Component === "button";
  const hasCount = count > 0;

  return (
    <Component
      data-component="NavItem"
      className={cx(
        styles.item,
        styles[tone],
        collapsed && styles.collapsed,
        selected && styles.selected,
        className,
      )}
      title={collapsed ? label : undefined}
      aria-current={selected ? "page" : undefined}
      {...(isButton
        ? { type: "button", disabled }
        : disabled
          ? {
              "aria-disabled": true,
              tabIndex: -1,
              onClick: (e: Event) => e.preventDefault(),
            }
          : {})}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
        {collapsed && hasCount && (
          <Dot className={styles.dot} tone="danger" size="md" />
        )}
      </span>
      <span
        className={cx(
          collapsed ? "visually-hidden" : styles.label,
          "text-body-md",
        )}
      >
        {label}
        {collapsed && hasCount && m.components.navNew(count)}
      </span>
      {!collapsed && <CountBadge count={count} />}
    </Component>
  );
}
