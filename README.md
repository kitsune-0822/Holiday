# Holiday_Shiftee

휴가 신청·현황 관리 웹 (React + TypeScript + Vite)

## 실행

```bash
npm install
npm run dev        # http://localhost:5173 (앱) · http://localhost:5173/showcase/ (컴포넌트 쇼케이스)
npm test           # 컴포넌트 테스트
npm run build      # 타입 검사 + 빌드 (dist/)
```

## 디자인 토큰

```
design-system/
  design-tokens.json          Figma variables(DTCG) 형식. 토큰의 원본
  scripts/generate_tokens.py  design-tokens.json 생성기 (python3로 실행)
  tokens.json                 Figma 내보내기 형식 참고용 예시
scripts/build-tokens.mjs      design-tokens.json → src/styles/ (npm run tokens, dev·build 때 자동 실행)
```

- CSS 변수 이름은 토큰 경로와 같다: `semantic.color.text.primary` → `--semantic-color-text-primary`
- 컴포넌트는 `--semantic-*`만 쓴다. `--primitive-*`는 semantic이 참조하는 원재료다.
- 텍스트 스타일: `.text-<그룹>-<크기>` 클래스 또는 `<Text variant="heading-md">`
- 브레이크포인트: 모바일 `< 768` · 태블릿 `768–1279` · 데스크탑 `≥ 1280` (`src/styles/tokens.ts`)

## 화면

| 주소 | 화면 | 비고 |
|---|---|---|
| `/vacations` | 휴가 현황 | 요약 카드, 검색 조건, 신청 내역 표(모바일은 카드) |
| `/vacation-request` | 휴가 신청 | 시트. 모바일은 iOS bottom sheet |
| `/alerts` | 알림 | 시트. 주소로 바로 들어오면 휴가 현황 위에 열린다 |
| `/approvals`, `/settings` | 준비 중 | 디자인이 아직 없음 |

## 폴더 구조

```
src/
  app/            앱 진입점, 라우팅, 전역 Provider
  components/     디자인 시스템 컴포넌트 (컴포넌트마다 폴더: Comp.tsx + Comp.module.css)
    index.ts      모든 컴포넌트 export
  layouts/        AppShell: 데스크탑 사이드바 · 태블릿 접힌 사이드바 · 모바일 상단 바 + 드로어
  pages/          VacationStatus(/vacations) · VacationRequest(/vacation-request, 시트) · Alerts(/alerts, 시트) · ComingSoon
  features/       휴가 도메인: 타입, 일수 계산(calc.ts), 신청·알림 상태(VacationContext)
  data/           목업 데이터 (서버 연동 전)
  hooks/          useMediaQuery, useFocusTrap
  lib/            작은 유틸 (cx, date)
  styles/         global.css + 자동 생성 tokens.css · typography.css · tokens.ts
  showcase/       컴포넌트 쇼케이스 (/showcase/)
  test/           테스트 설정
showcase/index.html   쇼케이스 HTML 진입점
figma-components/     Figma에서 내보낸 컴포넌트 코드 (참고용)
figma-pages/          Figma에서 내보낸 페이지 코드 (참고용, 데스크탑만)
```
