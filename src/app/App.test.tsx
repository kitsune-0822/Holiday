import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

beforeEach(() => {
  window.history.pushState({}, "", "/");
  // 날짜 검증이 오늘 기준이라 고정한다 (2026-10-16 금)
  vi.useFakeTimers({
    now: new Date("2026-10-16T10:00:00+09:00"),
    shouldAdvanceTime: true,
  });
  return () => vi.useRealTimers();
});

describe("휴가 신청 흐름", () => {
  it("신청하면 시트가 닫히고 내역에 대기로 추가된다. 잔여 휴가는 승인 전까지 그대로다", async () => {
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "휴가 현황", level: 1 }),
    ).toBeInTheDocument();
    const balance = () => within(document.getElementById("balance")!);
    expect(balance().getByText("13.25일")).toBeInTheDocument();

    await userEvent.click(
      screen.getAllByRole("button", { name: "휴가 신청하기" })[0],
    );
    const dialog = await screen.findByRole("dialog", { name: "휴가 신청하기" });
    expect(window.location.pathname).toBe("/vacation-request");

    // 빈 채로 신청하면 오류
    await userEvent.click(
      within(dialog).getByRole("button", { name: "신청하기" }),
    );
    expect(
      within(dialog).getByText("휴가 시작일을 골라 주세요."),
    ).toBeInTheDocument();

    // 2026-11-02(월) ~ 11-04(수) = 3일
    fireEvent.change(within(dialog).getByLabelText(/휴가 시작일/), {
      target: { value: "2026-11-02" },
    });
    fireEvent.change(within(dialog).getByLabelText(/휴가 종료일/), {
      target: { value: "2026-11-04" },
    });
    expect(within(dialog).getByText("10.25일")).toBeInTheDocument(); // 승인 후 잔여
    await userEvent.click(
      within(dialog).getByRole("button", { name: "3일 신청하기" }),
    );

    expect(
      await screen.findByText(
        "연차 3일을 신청했어요.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    // 닫힌 뒤 뒤로가기(history.back)는 비동기로 끝난다
    await waitFor(() => expect(window.location.pathname).toBe("/vacations"));
    expect(balance().getByText("13.25일")).toBeInTheDocument();
    expect(
      balance().getByText("결재 대기 중인 3.5일은 승인되면 빠져요"),
    ).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "휴가 신청 내역" });
    expect(within(table).getByText("2026-11-02")).toBeInTheDocument();
  });

  it("반차는 시간대가 필요하고 종료일이 시작일을 따른다", async () => {
    window.history.pushState({}, "", "/vacation-request");
    render(<App />);
    const dialog = await screen.findByRole("dialog", { name: "휴가 신청하기" });
    await userEvent.click(within(dialog).getByText("반차"));
    fireEvent.change(within(dialog).getByLabelText(/휴가 시작일/), {
      target: { value: "2026-11-02" },
    });
    expect(within(dialog).getByLabelText(/휴가 종료일/)).toBeDisabled();
    expect(within(dialog).getByLabelText(/휴가 종료일/)).toHaveValue(
      "2026-11-02",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "0.5일 신청하기" }),
    );
    expect(
      within(dialog).getByText("시간대를 골라 주세요."),
    ).toBeInTheDocument();
  });

  it("주소로 바로 들어오면 휴가 현황 위에 알림 시트가 열린다", async () => {
    window.history.pushState({}, "", "/alerts");
    render(<App />);
    expect(
      await screen.findByRole("dialog", { name: "알림" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "휴가 현황",
        level: 1,
        hidden: true,
      }),
    ).toBeInTheDocument();
  });
});

describe("결재 대기 일수를 넘는 신청", () => {
  it("대기 중인 일수까지 합쳐 잔여를 넘으면 막는다", async () => {
    window.history.pushState({}, "", "/vacation-request");
    render(<App />);
    const dialog = await screen.findByRole("dialog", { name: "휴가 신청하기" });
    // 연차 잔여 13.25일, 결재 대기 0.5일 → 12.75일까지. 2026-11-02 ~ 11-18 = 13일
    fireEvent.change(within(dialog).getByLabelText(/휴가 시작일/), {
      target: { value: "2026-11-02" },
    });
    fireEvent.change(within(dialog).getByLabelText(/휴가 종료일/), {
      target: { value: "2026-11-18" },
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "13일 신청하기" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "결재 대기 중인 0.5일을 빼면 연차는 12.75일까지 신청할 수 있어요.",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("휴가 신청 내역 필터", () => {
  it("상태 조건으로 거르고 초기화한다", async () => {
    render(<App />);
    const table = await screen.findByRole("table", { name: "휴가 신청 내역" });
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    const statusGroup = screen.getByRole("group", { name: "상태" });
    await userEvent.click(within(statusGroup).getByLabelText("승인"));
    await userEvent.click(within(statusGroup).getByLabelText("반려"));
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      2,
    );
    await userEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      7,
    );
  });
});
