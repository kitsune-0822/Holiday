import { Sparkles } from 'lucide-react';
import { Button, Card, Checkbox, KeyValueList, PageHeader, SegmentedControl, Text } from '@/components';
import { useTweaks } from '@/features/tweaks/TweaksContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { localeList, locales, useI18n, type Locale } from '@/i18n';
import { addDaysISO, todayISO } from '@/lib/date';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { m, f, locale, setLocale } = useI18n();
  const { buttonVisible, setButtonVisible, setOpen } = useTweaks();
  const t = m.settings;
  useDocumentTitle(t.title);
  const today = todayISO();

  return (
    <div className={styles.page}>
      <PageHeader title={t.title} />

      <Card title={t.language} description={t.languageHelp}>
        <div className={styles.section}>
          <SegmentedControl<Locale>
            label={t.language}
            value={locale}
            onChange={setLocale}
            options={localeList.map((l) => ({ value: l, label: <span lang={l}>{locales[l].meta.languageName}</span> }))}
          />
          <div className={styles.preview} aria-live="polite">
            <Text as="h3" variant="label-md" tone="tertiary">
              {t.preview}
            </Text>
            <KeyValueList
              items={[
                { label: m.status.columns.requestedAt, value: f.longDate(today) },
                { label: m.status.columns.startDate, value: f.dateSpan(addDaysISO(today, 2), addDaysISO(today, 4)) },
                { label: m.status.balance, value: f.days(13.25) },
                { label: m.alerts.title, value: f.relative(new Date(Date.now() - 3 * 3600 * 1000).toISOString()) },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title={t.tweaks} description={t.tweaksHelp}>
        <div className={styles.row}>
          <Checkbox label={t.showTweaks} checked={buttonVisible} onChange={setButtonVisible} />
          <Button hierarchy="secondary" size="sm" icon={<Sparkles />} onClick={() => setOpen(true)}>
            {t.openTweaks}
          </Button>
        </div>
      </Card>
    </div>
  );
}
