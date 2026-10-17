import { useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup, Chip, Sheet, TextArea } from '@/components';
import { useI18n } from '@/i18n';
import styles from './ApprovalsPage.module.css';

interface RejectSheetProps {
  /** 반려할 신청자 이름들. 비어 있으면 닫힌다. */
  names: string[];
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** 반려 사유 입력. 사유는 신청자에게 알림으로 전달된다. */
export function RejectSheet({ names, onClose, onConfirm }: RejectSheetProps) {
  const { m } = useI18n();
  const t = m.approvals.rejectSheet;
  const open = names.length > 0;
  const last = useRef(names);
  if (open) last.current = names;
  const shown = last.current;
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setReason('');
      setError(undefined);
    }
  }, [open]);

  const addPreset = (text: string) => {
    setReason((r) => (r.trim() ? `${r.trim()} ${text}` : text));
    setError(undefined);
  };

  const confirm = () => {
    if (!reason.trim()) {
      setError(t.error);
      return;
    }
    onConfirm(reason.trim());
  };

  const description =
    shown.length > 1 ? t.many(shown[0], shown.length - 1) : t.one(shown[0] ?? '');

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t.title}
      description={description}
      footer={
        <ButtonGroup>
          <Button hierarchy="tertiary" onClick={onClose}>
            {m.common.cancel}
          </Button>
          <Button tone="danger" onClick={confirm}>
            {t.confirm}
          </Button>
        </ButtonGroup>
      }
    >
      <div className={styles.reject}>
        <div className={styles.presets} role="group" aria-label={t.presetsGroup}>
          {t.presets.map((p) => (
            <Chip key={p} isSelected={reason.includes(p)} onClick={() => addPreset(p)} disabled={reason.includes(p)}>
              {p}
            </Chip>
          ))}
        </div>
        <TextArea
          label={t.label}
          required
          rows={3}
          placeholder={t.placeholder}
          value={reason}
          error={error}
          onChange={(e) => {
            setReason(e.target.value);
            setError(undefined);
          }}
        />
      </div>
    </Sheet>
  );
}
