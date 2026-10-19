# Holiday

휴가 신청·현황 관리 웹 (React + TypeScript + Vite)

## 실행

```bash
npm install
npm run dev        # http://localhost:5173 (앱) · http://localhost:5173/showcase/ (컴포넌트 쇼케이스)
npm test           # 컴포넌트 테스트
npm run build      # 타입 검사 + 빌드 (dist/)
```

## 배포

- 프로덕션: https://holiday-kitsune.vercel.app (쇼케이스: `/showcase/`)
- `vercel.json`: 모든 주소를 앱(`index.html`)으로, `/showcase/*`는 쇼케이스로 보낸다 (새로고침·직접 진입 시 404 방지)
- GitHub `main`과 연결돼 있어 push하면 프로덕션에 자동 배포된다.
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

## 작업 기록: 누가 무엇을 했나

이 프로젝트는 프로덕트 디자이너(저장소 주인)가 디자인과 의사 결정을 맡고, AI 코딩 도구(Claude Code)가 구현을 맡아 함께 만들었다.

### 디자이너가 한 것

- **PRD 작성:** 휴가 신청·현황·결재 서비스의 문제 정의, 사용자(신청자·팀장), 기능 범위와 정책을 PRD로 정리했다.
- **화면과 컴포넌트 디자인 (Figma):** 휴가 현황·휴가 신청·알림 화면과 컴포넌트를 디자인하고 코드로 내보냈다 (`figma-pages/`, `figma-components/`). 결재 대기 화면은 기능 정의(`pending-approvals.html`)를 줬다.
- **디자인 시스템 방향:** Figma variables 내보내기 예시(`design-system/tokens.json`)를 주고, primary 색 `#0088FF`, 4px 배수 간격, primitive → semantic 두 단계 구조를 정했다.
- **UX 결정과 리뷰:** 모든 화면을 직접 확인하며 수정 방향을 정했다. 예: 잔여 휴가는 승인될 때 빠진다, 팀장 결재라 팀명·아바타는 뺀다, 겹치는 팀원은 "이름 외 n명"으로 보인다, 시트는 늘 최대 높이로 연다.
- **직접 고친 코드:** 사이트 역할 문구(`site.config.ts`), 사이드바 메뉴 아이콘·글자 크기(`NavItem`), 한국어 토스트 문구.
- **인프라:** GitHub 저장소 권한을 연결하고, Vercel 프로젝트와 GitHub를 연결했다.

### 디자이너가 요청한 것 (순서대로)

1. **디자인 토큰:** Figma variables(DTCG) 형식의 primitive·semantic 토큰. 글자(font-size, line-height 등), padding, radius까지 포함하고, 그 밖에 필요한 것도 알아서 추가하기.
2. **컴포넌트 리뷰:** Figma에서 내보낸 컴포넌트의 수정·개선점과 이유 (property 이름 포함).
3. **React 구현:** 리뷰를 반영한 컴포넌트와 폴더 구조. 쇼케이스로 먼저 확인받은 뒤 페이지를 만들고, 모바일·태블릿·데스크탑에 모두 대응하기. 신청·알림은 시트로 만들고, 모바일에서는 iOS bottom sheet로 열기.
4. **사이드바와 스크롤:** 접힌 사이드바는 마우스를 올리거나 클릭하면 펼치기. 스크롤바는 영역에 마우스가 올라갈 때만 보이고 폭을 차지하지 않게 하기.
5. **결재 대기 신청 화면:** 오늘 휴가자, 주간 간트, 승인·반려, 여러 건 처리.
6. **사이드바·페이지 정리:** 사이드바 폭 250px, 메뉴 정리, 페이지 제목 32px, 브레드크럼·설명 삭제.
7. **포트폴리오 기능:** 다국어(ko·en·ja)와 설정 화면, 포트폴리오 도구(소스 보기, GitHub, 쇼케이스), 번역 관리 도구.
8. **버그 수정과 다듬기:** 내 신청이 결재 목록에 안 나오던 문제, 간트 막대가 주를 넘던 문제, 휴가 종류별 잔여 표시, 선택된 아이콘을 채운 형태로.
9. **배포:** Vercel 배포와 GitHub 연결.
10. **화면 다듬기:** 로고 교체와 크기, 표 버튼 크기, 오늘 휴가자 카드 배치, 모바일 상단 바·메뉴, 신청 시트 여백.
11. **디자인 리뷰와 반영:** 디자인 리뷰를 돌리고 지적된 문제 고치기.

### AI가 한 것

- **토큰 파이프라인:** 생성기(`generate_tokens.py`)가 DTCG JSON을 만들고, 변환 스크립트(`build-tokens.mjs`)가 CSS 변수·글자 스타일 클래스·TS 상수로 바꾼다. 생성기는 이중 참조와 semantic의 직접 값을 막고, 글자 대비를 계산해 출력한다.
- **컴포넌트 리뷰 문서와 구현:** 리뷰 내용을 반영해 30여 개 컴포넌트와 쇼케이스(`/showcase/`)를 만들었다. 모든 컴포넌트는 semantic 토큰만 쓴다.
- **페이지 구현:** 휴가 현황, 신청 시트, 알림, 결재 대기, 설정. 반응형 레이아웃, 바텀 시트(끌어서 닫기, 뒤 화면 축소), 포커스 가두기, 스크린 리더 이름을 넣었다.
- **상태와 로직:** 휴가 일수 계산, 승인될 때 차감, 되돌리기, 알림 생성, 팀원 휴가와 내 신청 합치기, 간트 레인 배치, 주말을 건너뛴 복귀일, 기간 중복 검사.
- **다국어:** 타입으로 번역 누락을 막는 구조, `Intl` 기반 날짜·일수 포매터, 의사 번역.
- **포트폴리오 도구:** 컴포넌트 검사, 4px 그리드, 번역 관리(완성도, 화면 폭 비율, 내보내기).
- **품질 확인:** Vitest 테스트 63개, 헤드리스 브라우저로 각 화면 폭에서 크기·정렬·대비를 측정해 확인했다.
- **디자인 리뷰 반영:** 흰 글자를 얹는 primary·danger 채움과 간트 막대 색을 토큰에서 한 단계 진하게 바꿔 대비 4.5:1을 넘겼다. 결재 열을 표 오른쪽에 고정하고, 휴가 현황 검색 조건을 기본으로 접었다.
- **배포 설정:** `vercel.json`(SPA 라우팅, 쇼케이스 경로), 빌드에 커밋 해시 넣기, PR·커밋 관리.
