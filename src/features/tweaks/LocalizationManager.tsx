import { Download, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Button, Checkbox, Chip, Meter, ScrollArea, Select, Sheet, Tag, Text, TextField } from '@/components';
import { localeList, locales, useI18n, type Locale } from '@/i18n';
import { cx } from '@/lib/cx';
import { buildRows, coverage, download, isTranslated, lengthRatio, LONG_RATIO, toCsv, toJson, type L10nRow } from './l10n';
import { useTweaks } from './TweaksContext';
import styles from './Tweaks.module.css';

type Filter = 'all' | 'same' | 'long' | 'dynamic';
const filters: Filter[] = ['all', 'same', 'long', 'dynamic'];

const matchesFilter = (r: L10nRow, f: Filter) => {
  const others = localeList.filter((l) => l !== 'ko');
  if (f === 'same') return others.some((l) => !isTranslated(r, l));
  if (f === 'long') return others.some((l) => lengthRatio(r, l) >= LONG_RATIO);
  if (f === 'dynamic') return r.dynamic;
  return true;
};

/** 번역 관리: 모든 메시지를 언어별로 나란히 보고, 빠진 번역·길이 위험을 찾고, 내보낸다. */
export function LocalizationManager() {
  const { l10nOpen, setL10nOpen } = useTweaks();
  const { m, locale, setLocale, pseudo, setPseudo } = useI18n();
  const t = m.tweaks.l10n;
  const rows = useMemo(buildRows, []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const searchId = useId();

  const shown = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    const text = [r.key, ...Object.values(r.values)].join(' ').toLowerCase();
    return (!q || text.includes(q)) && matchesFilter(r, filter);
  });

  return (
    <Sheet open={l10nOpen} onClose={() => setL10nOpen(false)} size="wide" title={t.title} description={t.description(rows.length, localeList.length)}>
      <div className={styles.l10n} data-tweaks="">
        <div className={styles.coverageGrid}>
          {localeList.map((l) => {
            const c = coverage(rows, l);
            return (
              <div key={l} className={styles.coverageCard}>
                <div className={styles.coverageHead}>
                  <Text variant="title-md">{locales[l].meta.languageName}</Text>
                  {l === 'ko' ? <Tag>{t.source}</Tag> : l === locale ? <Tag tone="primary">{t.current}</Tag> : null}
                </div>
                <Meter max={c.total} label={t.coverage(c.percent)} segments={[{ value: c.done, tone: 'strong' }]} />
                <Text variant="body-md" tone="secondary">
                  {t.coverage(c.percent)} · {c.done}/{c.total}
                </Text>
              </div>
            );
          })}
        </div>

        <div className={styles.l10nTools}>
          <Select
            label={m.tweaks.language}
            hideLabel
            size="sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            options={localeList.map((l) => ({ value: l, label: locales[l].meta.languageName }))}
          />
          <Checkbox label={t.pseudo} checked={pseudo} onChange={setPseudo} />
          <div className={styles.l10nExport}>
            <Button hierarchy="tertiary" size="sm" icon={<Download />} onClick={() => download('messages.json', toJson(rows), 'application/json')}>
              {t.exportJson}
            </Button>
            <Button hierarchy="tertiary" size="sm" icon={<Download />} onClick={() => download('messages.csv', toCsv(rows), 'text/csv;charset=utf-8')}>
              {t.exportCsv}
            </Button>
          </div>
        </div>
        <Text as="p" variant="body-md" tone="tertiary">
          {t.pseudoHelp}
        </Text>

        <div className={styles.l10nFilters}>
          <TextField
            id={searchId}
            type="search"
            label={t.search}
            hideLabel
            size="sm"
            placeholder={t.search}
            leadingIcon={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div role="group" aria-label={t.filterGroup} className={styles.chips}>
            {filters.map((f) => (
              <Chip key={f} isSelected={filter === f} onClick={() => setFilter(f)}>
                {t.filters[f]}
              </Chip>
            ))}
          </div>
          <Text variant="body-md" tone="tertiary" aria-live="polite">
            {t.shown(shown.length, rows.length)}
          </Text>
        </div>

        {shown.length === 0 ? (
          <p className={cx(styles.l10nEmpty, 'text-body-md')}>{t.empty}</p>
        ) : (
          <ScrollArea axis="x" viewportProps={{ tabIndex: 0, role: 'region', 'aria-label': t.title }}>
            <table className={cx(styles.l10nTable, 'text-body-md')}>
              <thead>
                <tr>
                  <th scope="col">{t.key}</th>
                  {localeList.map((l) => (
                    <th key={l} scope="col">
                      {locales[l].meta.languageName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.key}>
                    <th scope="row">
                      <code>{r.key}</code>
                      {r.dynamic && <Tag className={styles.rowTag}>{t.dynamicTag}</Tag>}
                    </th>
                    {localeList.map((l) => {
                      const ratio = lengthRatio(r, l);
                      const same = !isTranslated(r, l);
                      return (
                        <td key={l} lang={l} className={cx(same && styles.cellWarn)}>
                          {r.values[l]}
                          {same && <Tag tone="warning" className={styles.rowTag}>{t.sameTag}</Tag>}
                          {l !== 'ko' && ratio >= LONG_RATIO && (
                            <Tag tone="danger" className={styles.rowTag}>
                              {t.longTag(ratio.toFixed(1))}
                            </Tag>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </div>
    </Sheet>
  );
}
