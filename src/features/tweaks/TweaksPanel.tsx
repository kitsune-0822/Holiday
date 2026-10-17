import { BookOpen, Code2, ExternalLink, FileCode, FolderGit2, Languages, Palette, PenTool, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { Avatar, Checkbox, IconButton, ScrollArea, Select, Text } from '@/components';
import { localeList, locales, useI18n, type Locale } from '@/i18n';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import type { SheetLocationState } from '@/layouts/AppShell/useNavigationModel';
import { routeSources, site, sourceUrl } from '@/site.config';
import { projectStats } from './stats';
import { useTweaks } from './TweaksContext';
import styles from './Tweaks.module.css';

/**
 * 포트폴리오 도구. 오른쪽 아래 버튼(또는 '?' 키)으로 연다.
 * 모달이 아니라서 열어 둔 채로 화면을 계속 쓸 수 있다 (검사 모드와 함께 쓰기 위해).
 */
export function TweaksPanel() {
  const { buttonVisible, open, setOpen, inspect, setInspect, grid, setGrid, setL10nOpen } = useTweaks();
  const { m, locale, setLocale } = useI18n();
  const t = m.tweaks;
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  // 시트로 열린 화면이면 그 시트의 소스를 보여준다
  const path = location.pathname;
  const pageFile = routeSources[path] ?? routeSources[(location.state as SheetLocationState | null)?.background?.pathname ?? ''];

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !inspect) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, inspect, setOpen]);

  if (!buttonVisible && !open) return null;

  return createPortal(
    <div data-tweaks="" className={styles.root}>
      {open && (
        <div ref={panelRef} className={styles.panel} role="dialog" aria-label={t.title} tabIndex={-1}>
          <header className={styles.panelHead}>
            <Text as="h2" variant="title-lg">
              {t.title}
            </Text>
            <IconButton variant="ghost" size="xs" label={m.common.close} icon={<X />} onClick={() => setOpen(false)} />
          </header>
          <ScrollArea className={styles.panelScroll}>
            <div className={styles.panelBody}>
              <section className={styles.profile}>
                <Avatar name={site.author.name} size="lg" colorKey="author" />
                <div>
                  <Text as="p" variant="title-md">
                    {site.author.name}
                  </Text>
                  <Text as="p" variant="body-md" tone="secondary">
                    {t.roleLine(site.author.role)}
                  </Text>
                </div>
              </section>
              <Text as="p" variant="body-md" tone="secondary">
                {t.pitch}
              </Text>

              <section className={styles.group} aria-label={t.links}>
                <Text as="h3" variant="label-md" tone="tertiary">
                  {t.links}
                </Text>
                <ul className={styles.links}>
                  {pageFile && <LinkRow href={sourceUrl(pageFile)} icon={<FileCode />} label={t.pageSource} hint={pageFile.split('/').pop()} external={t.external} />}
                  <LinkRow href={site.showcasePath} icon={<Palette />} label={t.showcase} hint="/showcase" external={t.external} />
                  <LinkRow href={site.repo.url} icon={<FolderGit2 />} label={t.repo} hint={site.repo.url.replace('https://github.com/', '')} external={t.external} />
                  <LinkRow href={sourceUrl('design-system/design-tokens.json')} icon={<Code2 />} label={t.tokens} hint={`${projectStats.tokens}`} external={t.external} />
                  <LinkRow href={sourceUrl('README.md')} icon={<BookOpen />} label={t.readme} external={t.external} />
                  {site.figmaUrl && <LinkRow href={site.figmaUrl} icon={<PenTool />} label={t.figma} external={t.external} />}
                </ul>
              </section>

              <section className={styles.group} aria-label={t.tools}>
                <Text as="h3" variant="label-md" tone="tertiary">
                  {t.tools}
                </Text>
                <Select
                  label={t.language}
                  size="sm"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  options={localeList.map((l) => ({ value: l, label: locales[l].meta.languageName }))}
                />
                <button type="button" className={cx(styles.toolRow, 'text-body-md')} onClick={() => setL10nOpen(true)}>
                  <Languages aria-hidden="true" />
                  {t.l10n.open}
                </button>
                {canHover ? (
                  <div className={styles.toggle}>
                    <Checkbox label={t.inspect} checked={inspect} onChange={setInspect} />
                    <Text as="p" variant="caption-md" tone="tertiary">
                      {t.inspectHelp}
                    </Text>
                  </div>
                ) : (
                  <Text as="p" variant="caption-md" tone="tertiary">
                    {t.inspectTouch}
                  </Text>
                )}
                <Checkbox label={t.grid} checked={grid} onChange={setGrid} />
              </section>

              <section className={styles.group} aria-label={t.stats}>
                <Text as="h3" variant="label-md" tone="tertiary">
                  {t.stats}
                </Text>
                <dl className={styles.stats}>
                  <Stat label={t.statComponents} value={projectStats.components} />
                  <Stat label={t.statTokens} value={projectStats.tokens} />
                  <Stat label={t.statTextStyles} value={projectStats.textStyles} />
                  <Stat label={t.statLocales} value={projectStats.locales} />
                </dl>
              </section>

              <Text as="p" variant="caption-md" tone="tertiary" className={styles.footer}>
                {t.build(__APP_COMMIT__, __APP_BUILD_DATE__)} · {t.shortcut}
              </Text>
            </div>
          </ScrollArea>
        </div>
      )}
      {buttonVisible && (
        <button
          ref={triggerRef}
          type="button"
          className={cx(styles.fab, open && styles.fabActive)}
          aria-expanded={open}
          aria-label={t.open}
          title={`${t.open} (?)`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
        </button>
      )}
    </div>,
    document.body,
  );
}

function LinkRow({ href, icon, label, hint, external }: { href: string; icon: ReactNode; label: string; hint?: string; external: string }) {
  return (
    <li>
      <a className={cx(styles.linkRow, 'text-body-md')} href={href} target="_blank" rel="noopener noreferrer">
        <span className={styles.linkIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.linkText}>
          {label}
          {hint && <span className={cx(styles.linkHint, 'text-caption-md')}>{hint}</span>}
        </span>
        <ExternalLink className={styles.linkExternal} aria-hidden="true" />
        <span className="visually-hidden">({external})</span>
      </a>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-caption-md">{label}</dt>
      <dd className="text-title-lg">{value}</dd>
    </div>
  );
}
