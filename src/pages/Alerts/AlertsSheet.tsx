import { BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertItem, Sheet, Text } from '@/components';
import { useVacation } from '@/features/vacation/VacationContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useI18n } from '@/i18n';
import { useRouteSheet } from '../sheetRoute';
import styles from './AlertsSheet.module.css';

export function AlertsSheet() {
  const { m, f } = useI18n();
  useDocumentTitle(m.alerts.title);
  const { alerts, markAlertsRead } = useVacation();
  const sheet = useRouteSheet();
  // 시트를 연 순간 이미 읽었던 알림만 흐리게 보여준다 (보는 중에 바뀌지 않게)
  const [readBefore] = useState(() => new Set(alerts.filter((a) => a.read).map((a) => a.id)));

  // 알림을 열어 본 것으로 처리한다 (메뉴의 숫자가 사라진다)
  useEffect(() => {
    const t = window.setTimeout(markAlertsRead, 600);
    return () => window.clearTimeout(t);
  }, [markAlertsRead]);

  return (
    <Sheet {...sheet} title={m.alerts.title}>
      {alerts.length === 0 ? (
        <div className={styles.empty}>
          <BellOff className={styles.emptyIcon} aria-hidden="true" />
          <Text tone="secondary">{m.alerts.empty}</Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {alerts.map((a) => (
            <li key={a.id} className={readBefore.has(a.id) ? styles.read : undefined}>
              <AlertItem
                tone={a.decision === 'approved' ? 'success' : 'danger'}
                title={m.alerts[a.decision](f.dateSpan(a.startDate, a.endDate), m.vacation.types[a.type])}
                message={a.message}
                time={f.relative(a.createdAt)}
                dateTime={a.createdAt}
              />
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
