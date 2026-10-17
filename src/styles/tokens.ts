/* 자동 생성 파일입니다. 직접 고치지 말고 `npm run tokens`를 실행하세요. */
export const typographyVariants = [
  "display-lg",
  "display-md",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "title-xl",
  "title-lg",
  "title-md",
  "title-sm",
  "body-lg",
  "body-list",
  "body-md",
  "body-sm",
  "numeric-lg",
  "label-lg",
  "label-md",
  "label-sm",
  "caption-md",
  "caption-sm",
  "code-md",
  "code-sm"
] as const;

export type TypographyVariant = (typeof typographyVariants)[number];

/** 이 너비 이상이면 해당 레이아웃. 모바일은 tablet 미만. */
export const breakpoints = {"tablet":768,"desktop":1280} as const;
