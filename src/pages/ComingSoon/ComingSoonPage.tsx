import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button, Text } from '@/components';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import styles from './ComingSoonPage.module.css';

/** 디자인이 아직 없는 메뉴와 없는 주소에 쓰는 화면 */
export function ComingSoonPage({ title, message = '아직 준비 중인 화면이에요.' }: { title: string; message?: string }) {
  useDocumentTitle(title);
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <Construction className={styles.icon} aria-hidden="true" />
      <h1 className="text-heading-lg">{title}</h1>
      <Text as="p" tone="secondary">
        {message}
      </Text>
      <Button hierarchy="secondary" onClick={() => navigate('/vacations')}>
        휴가 현황으로 가기
      </Button>
    </div>
  );
}
