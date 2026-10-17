/**
 * 채운(fill) 아이콘. lucide(ISC)의 선 아이콘과 같은 도형을 채우고,
 * 안쪽 표시(체크·X 등)는 흰색 선으로 파낸다. 선택된 메뉴, 알림 아이콘에 쓴다.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const KNOCKOUT = 'var(--semantic-color-icon-inverse)';

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CalendarCheckFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2v3M16 2v3" />
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
      <path d="M3 9h18" stroke={KNOCKOUT} />
      <path d="m9 15 2 2 4-4" stroke={KNOCKOUT} />
    </Svg>
  );
}

export function ClipboardCheckFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="currentColor" />
      <rect width="8" height="4" x="8" y="2" rx="1" fill="currentColor" stroke={KNOCKOUT} strokeWidth={1.5} />
      <path d="m9 14 2 2 4-4" stroke={KNOCKOUT} />
    </Svg>
  );
}

export function SettingsFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="3" fill={KNOCKOUT} stroke="none" />
    </Svg>
  );
}

export function BellFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        fill="currentColor"
      />
    </Svg>
  );
}

export function CircleCheckFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m16 9-5.5 5.5L8 12" stroke={KNOCKOUT} />
    </Svg>
  );
}

export function CircleXFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m15 9-6 6M9 9l6 6" stroke={KNOCKOUT} />
    </Svg>
  );
}

export function InfoFilled(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 16v-4M12 8h.01" stroke={KNOCKOUT} />
    </Svg>
  );
}
