import { BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertItem, Sheet, Text } from '@/components';
import { relativeTime } from '@/features/vacation/calc';
import { useVacation } from '@/features/vacation/VacationContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useRouteSheet } from '../sheetRoute';
import styles from './AlertsSheet.module.css';

export function AlertsSheet() {
  useDocumentTitle('알림');
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
    <Sheet {...sheet} title="알림">
      {alerts.length === 0 ? (
        <div className={styles.empty}>
          <BellOff className={styles.emptyIcon} aria-hidden="true" />
          <Text tone="secondary">새 알림이 없어요.</Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {alerts.map((a) => (
            <li key={a.id} className={readBefore.has(a.id) ? styles.read : undefined}>
              <AlertItem tone={a.tone} title={a.title} message={a.message} time={relativeTime(a.createdAt)} dateTime={a.createdAt} />
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
