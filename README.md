# Holiday_Shiftee

휴가 신청·현황 관리 웹 (React + TypeScript + Vite)

## 실행

```bash
npm install
npm run dev        # http://localhost:5173 (앱) · http://localhost:5173/showcase/ (컴포넌트 쇼케이스)
npm test           # 컴포넌트 테스트
npm run build      # 타입 검사 + 빌드 (dist/)
```

## 배포

- 프로덕션: https://holiday-shiftee.vercel.app (쇼케이스: `/showcase/`)
- `vercel.json`: 모든 주소를 앱(`index.html`)으로, `/showcase/*`는 쇼케이스로 보낸다 (새로고침·직접 진입 시 404 방지)
- 수동 배포: `vercel build --prod && vercel deploy --prebuilt --prod` (로컬 빌드라 커밋 해시가 패널에 표시된다)

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
| `/approvals` | 결재 대기 신청 | 오늘·이번 주 휴가자, 승인·반려(여러 건 선택, 되돌리기), 상세·반려 시트, CSV 내보내기 |
| `/settings` | 설정 | 언어(한국어·English·日本語), 포트폴리오 도구 버튼 표시 |

## 다국어 (i18n)

- 지원 언어: 한국어(원본) · English · 日本語. 설정 화면이나 포트폴리오 도구에서 바꾸고, 브라우저에 저장된다.
- 메시지: `src/i18n/messages/{ko,en,ja}.ts`. 다른 언어는 `Messages`(ko의 모양) 타입을 따라야 해서 **빠진 번역은 빌드가 막는다**.
- 숫자·이름에 따라 바뀌는 문장은 함수로 둔다 (`days: (v) => v === 1 ? '1 day' : ...`) — 어순과 복수형을 언어마다 다르게 쓰기 위해서.
- 날짜·상대 시간은 `Intl`로 언어 규칙을 따른다: `const { m, f } = useI18n(); f.days(2.5); f.longDate(iso)`
- 사용자가 쓴 글(사유, 이름, 결재 메시지)은 번역하지 않는다.
- 날짜 입력칸(`<input type="date">`)의 자리표시자는 브라우저·OS 언어를 따른다.

## 포트폴리오 도구 (트윅)

오른쪽 아래 버튼 또는 `?` 키. 설정에서 버튼을 숨길 수 있다.

- 바로가기: 지금 보고 있는 페이지의 소스(GitHub), 컴포넌트 쇼케이스, 저장소, 디자인 토큰, README
- 컴포넌트 검사: 마우스를 올리면 컴포넌트 이름, ⌥(Alt)+클릭하면 그 컴포넌트 소스
- 4px 그리드 겹쳐 보기
- 번역 관리: 세 언어 나란히 비교, 언어별 완성도, 원문과 같은 값·화면 폭 2배 이상 늘어난 값 찾기, 의사 번역 모드, JSON·CSV 내보내기
- 이름·역할·저장소·Figma 링크는 `src/site.config.ts`에서 바꾼다.

## 폴더 구조

```
src/
  app/            앱 진입점, 라우팅, 전역 Provider
  components/     디자인 시스템 컴포넌트 (컴포넌트마다 폴더: Comp.tsx + Comp.module.css)
    index.ts      모든 컴포넌트 export
  layouts/        AppShell: 데스크탑 사이드바 · 태블릿 접힌 사이드바 · 모바일 상단 바 + 드로어
  pages/          VacationStatus(/vacations) · VacationRequest(/vacation-request, 시트) · Alerts(/alerts, 시트) · ComingSoon
  features/       vacation: 일수 계산·신청·알림 상태 / approvals: 결재 로직·상태 / tweaks: 포트폴리오 도구
  i18n/           언어 Provider, 메시지(ko·en·ja), 의사 번역
  data/           목업 데이터 (서버 연동 전, 팀 휴가는 오늘 기준으로 생성)
  hooks/          useMediaQuery, useFocusTrap
  lib/            작은 유틸 (cx, date)
  styles/         global.css + 자동 생성 tokens.css · typography.css · tokens.ts
  showcase/       컴포넌트 쇼케이스 (/showcase/)
  test/           테스트 설정
showcase/index.html   쇼케이스 HTML 진입점
figma-components/     Figma에서 내보낸 컴포넌트 코드 (참고용)
figma-pages/          Figma에서 내보낸 페이지 코드 (참고용, 데스크탑만)
```
