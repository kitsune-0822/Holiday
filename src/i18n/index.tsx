import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './messages/en';
import { ja } from './messages/ja';
import { ko, type Messages } from './messages/ko';
import { pseudoMessages } from './pseudo';

export type { Messages };

export const locales = { ko, en, ja } as const;
export type Locale = keyof typeof locales;
export const localeList = Object.keys(locales) as Locale[];

const STORAGE_KEY = 'holiday.locale';

function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && v in locales;
}

/** 저장된 값 → 브라우저 언어 → 한국어 순으로 정한다 */
function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // 저장소를 쓸 수 없는 환경
  }
  const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'ko';
  return isLocale(browser) ? browser : 'ko';
}

/** 날짜·숫자를 지금 언어 규칙으로 쓰는 도우미 */
export interface Formatters {
  /** 13.25 → '13.25일' / '13.25 days' */
  days: (v: number) => string;
  /** '10/20(화)' / 'Tue, 10/20' */
  monthDay: (iso: string) => string;
  /** 문장 속 날짜·기간: '10월 19일(월) ~ 10월 23일(금)' / 'Mon, Oct 19 – Fri, Oct 23' */
  dateSpan: (from: string, to: string) => string;
  /** '2026년 10월 18일 일요일' / 'Sunday, October 18, 2026' */
  longDate: (iso: string) => string;
  weekday: (iso: string) => string;
  /** '3시간 전' / '3 hours ago' */
  relative: (iso: string, now?: Date) => string;
}

export interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** 의사 번역 모드 (레이아웃 점검용 개발 도구) */
  pseudo: boolean;
  setPseudo: (on: boolean) => void;
  m: Messages;
  f: Formatters;
}

const parse = (iso: string) => {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(y, mo - 1, d);
};

export function createFormatters(m: Messages): Formatters {
  const rtf = new Intl.RelativeTimeFormat(m.meta.intl, { numeric: 'auto' });
  const long = new Intl.DateTimeFormat(m.meta.intl, { dateStyle: 'full' });
  const weekday = (iso: string) => m.date.weekdays[parse(iso).getDay()];
  return {
    days: m.common.days,
    weekday,
    monthDay: (iso) => {
      const d = parse(iso);
      return m.date.monthDay(d.getMonth() + 1, d.getDate(), weekday(iso));
    },
    dateSpan: (from, to) => {
      const one = (iso: string) => {
        const d = parse(iso);
        return m.date.monthDayLong(d.getMonth() + 1, d.getDate(), weekday(iso));
      };
      return from === to ? one(from) : m.date.rangeLong(one(from), one(to));
    },
    longDate: (iso) => long.format(parse(iso)),
    relative: (iso, now = new Date()) => {
      const sec = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
      const abs = Math.abs(sec);
      if (abs < 60) return m.date.justNow;
      if (abs < 3600) return rtf.format(Math.round(sec / 60), 'minute');
      if (abs < 86400) return rtf.format(Math.round(sec / 3600), 'hour');
      if (abs < 86400 * 30) return rtf.format(Math.round(sec / 86400), 'day');
      return new Date(iso).toLocaleDateString(m.meta.intl);
    },
  };
}

const koI18n: I18n = { locale: 'ko', setLocale: () => {}, pseudo: false, setPseudo: () => {}, m: ko, f: createFormatters(ko) };

/** Provider 밖(단독 컴포넌트 테스트 등)에서는 한국어로 동작한다 */
const I18nContext = createContext<I18n>(koI18n);

export function I18nProvider({ children, defaultLocale }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => defaultLocale ?? initialLocale());
  const [pseudo, setPseudo] = useState(false);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // 이번 방문 동안만 유지
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => {
    const m = pseudo ? pseudoMessages(locales[locale]) : locales[locale];
    return { locale, setLocale, pseudo, setPseudo, m, f: createFormatters(m) };
  }, [locale, setLocale, pseudo]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
