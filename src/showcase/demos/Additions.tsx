import { CalendarClock, Download, Search } from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  Button,
  Callout,
  Meter,
  PageHeader,
  Select,
  Tag,
  TextField,
  useToast,
} from "@/components";
import { Demo, DemoGrid, PropMap, Section } from "../ui";

export function Additions() {
  const toast = useToast();
  const [dept, setDept] = useState("");
  return (
    <>
      <Section
        id="page-header"
        title="PageHeader"
        description="모든 페이지 제목은 32px(heading-xl)입니다."
      >
        <Demo label="eyebrow · description · actions" wide>
          <div style={{ width: "100%" }}>
            <PageHeader
              eyebrow="관리자 메뉴 › 결재"
              title="결재 대기 신청"
              description={
                <>
                  처리할 신청 <strong>8건</strong> 중 <strong>2건</strong>은 2일
                  안에 시작해요.
                </>
              }
              actions={
                <Button hierarchy="tertiary" size="sm" icon={<Download />}>
                  엑셀 내보내기
                </Button>
              }
            />
          </div>
        </Demo>
      </Section>

      <Section id="avatar-tag" title="Avatar · Tag">
        <DemoGrid>
          <Demo label="Avatar size (색은 id로 고정)">
            <Avatar name="김민준" size="sm" />
            <Avatar name="이서연" size="md" />
            <Avatar name="박지호" size="lg" />
            <Avatar name="최유나" size="xl" />
          </Demo>
          <Demo label="Tag tone">
            <Tag tone="primary">연차</Tag>
            <Tag>오전 반차</Tag>
            <Tag tone="danger">병가</Tag>
            <Tag tone="success">대휴</Tag>
            <Tag tone="warning" icon={<CalendarClock />}>
              내일 시작
            </Tag>
          </Demo>
        </DemoGrid>
      </Section>

      <Section id="meter-callout" title="Meter · Callout">
        <DemoGrid>
          <Demo label="Meter: 15일 중 6일 사용 + 이번 신청 3일">
            <div style={{ width: "min(100%, 280px)" }}>
              <Meter
                max={15}
                label="15일 중 6일 사용, 이번 신청 3일"
                segments={[
                  { value: 6, tone: "strong" },
                  { value: 3, tone: "light" },
                ]}
              />
            </div>
          </Demo>
          <Demo label="Callout tone" wide>
            <div
              style={{
                display: "grid",
                gap: "var(--semantic-spacing-2xs)",
                width: "min(100%, 480px)",
              }}
            >
              <Callout tone="info">
                결재 대기 중인 3.5일은 승인되면 빠져요.
              </Callout>
              <Callout tone="warning">
                승인하면 이 기간에 개발팀에서 3명이 자리를 비워요.
              </Callout>
              <Callout tone="danger">연차가 2일 부족해요.</Callout>
            </div>
          </Demo>
        </DemoGrid>
      </Section>

      <Section
        id="toolbar-fields"
        title="Select · 검색 · 위험 버튼 · 되돌리기 토스트"
      >
        <DemoGrid>
          <Demo label="size sm, 라벨 숨김(hideLabel)" wide>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--semantic-spacing-2xs)",
              }}
            >
              <Select
                label="부서"
                hideLabel
                size="sm"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                options={[
                  { value: "", label: "전체 부서" },
                  { value: "dev", label: "개발팀" },
                  { value: "cs", label: "CS팀" },
                ]}
              />
              <TextField
                type="search"
                label="검색"
                hideLabel
                size="sm"
                placeholder="이름 또는 사유 검색"
                leadingIcon={<Search />}
              />
            </div>
          </Demo>
          <Demo label="tone=danger">
            <Button tone="danger">반려하기</Button>
            <Button hierarchy="tertiary" tone="danger">
              반려
            </Button>
          </Demo>
          <Demo label="Toast action">
            <Button
              hierarchy="secondary"
              onClick={() =>
                toast({
                  message: "김민준님 신청을 승인했어요.",
                  action: {
                    label: "되돌리기",
                    onClick: () => toast({ message: "되돌렸어요." }),
                  },
                })
              }
            >
              토스트 띄우기
            </Button>
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ["(없음)", "Button tone='danger'", "반려처럼 되돌리기 어려운 행동"],
            [
              "(없음)",
              "TextField·Select size='sm', hideLabel, leadingIcon",
              "툴바용 작은 입력",
            ],
            [
              "(없음)",
              "DataTable selection · onRowClick · columns[].mobile",
              "여러 건 선택, 행 눌러 상세 보기",
            ],
            ["(없음)", "Sheet 겹쳐 열기", "Esc는 맨 위 시트만 닫는다"],
          ]}
        />
      </Section>
    </>
  );
}
