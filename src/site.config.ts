/**
 * 포트폴리오 정보. 트윅(포트폴리오 도구) 패널에 보인다.
 * 이름·역할·링크를 여기서 고치면 된다.
 */
export const site = {
  author: {
    name: 'Yoonho Park',
    role: 'UX Engineer',
  },
  repo: {
    url: 'https://github.com/kitsune-0822/Holiday_Shiftee',
    branch: 'main',
  },
  /** 비워 두면 패널에서 숨긴다 */
  figmaUrl: '',
  showcasePath: '/showcase/',
};

export const sourceUrl = (path: string) => `${site.repo.url}/blob/${site.repo.branch}/${path}`;

/** 화면 주소 → 그 화면을 그리는 파일 */
export const routeSources: Record<string, string> = {
  '/vacations': 'src/pages/VacationStatus/VacationStatusPage.tsx',
  '/vacation-request': 'src/pages/VacationRequest/VacationRequestSheet.tsx',
  '/alerts': 'src/pages/Alerts/AlertsSheet.tsx',
  '/approvals': 'src/pages/Approvals/ApprovalsPage.tsx',
  '/settings': 'src/pages/Settings/SettingsPage.tsx',
};

/** 한 파일에 같이 들어 있는 하위 컴포넌트 → 파일이 있는 폴더 이름 */
const componentFolders: Record<string, string> = {
  CheckboxGroup: 'Checkbox',
  FilterRow: 'FilterGrid',
  FilterField: 'FilterGrid',
  FilterTextInput: 'FilterGrid',
  FilterDateRange: 'FilterGrid',
  StatGroup: 'Stat',
  NavGroupItem: 'NavGroup',
};

export function componentSource(name: string): string {
  const folder = componentFolders[name] ?? name;
  return `src/components/${folder}/${folder}.tsx`;
}
