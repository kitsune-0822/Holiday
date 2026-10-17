import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button, Text } from '@/components';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useI18n } from '@/i18n';
import styles from './ComingSoonPage.module.css';

/** 디자인이 아직 없는 메뉴와 없는 주소에 쓰는 화면 */
/** variant='notFound'면 없는 주소 안내 */
export function ComingSoonPage({ title, variant = 'soon' }: { title?: string; variant?: 'soon' | 'notFound' }) {
  const { m } = useI18n();
  const c = m.comingSoon;
  const heading = variant === 'notFound' ? c.notFound : (title ?? '');
  const message = variant === 'notFound' ? c.notFoundMessage : c.message;
  useDocumentTitle(heading);
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <Construction className={styles.icon} aria-hidden="true" />
      <h1 className="text-heading-xl">{heading}</h1>
      <Text as="p" tone="secondary">
        {message}
      </Text>
      <Button hierarchy="secondary" onClick={() => navigate('/vacations')}>
        {c.goHome}
      </Button>
    </div>
  );
}
