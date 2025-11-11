import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NoticeCard } from "@/components/notice-card";
import { NoticeCardDTO } from "@/lib/types";
import * as apiModule from "@/lib/api";

jest.mock("@/lib/api", () => ({
  createBookmark: jest.fn().mockResolvedValue({ ok: true, id: 10 }),
  deleteBookmark: jest.fn().mockResolvedValue({ ok: true }),
}));

const api = apiModule as jest.Mocked<typeof apiModule>;

const notice: NoticeCardDTO = {
  id: "1",
  title: "테스트",
  summary: "요약",
  pubDate: new Date().toISOString(),
  deadline: "20240101 ~ 20240131",
  organization: "기관",
  category: "분야",
  tags: [],
  bookmarked: false,
  bookmarkId: null,
};

describe("NoticeCard optimistic bookmark", () => {
  test("button toggles immediately", async () => {
    const queryClient = new QueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <NoticeCard notice={notice} />
      </QueryClientProvider>
    );

    const button = screen.getByRole("button", { name: /북마크/ });
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("저장됨");

    expect(api.createBookmark).toHaveBeenCalledWith("1");
  });
});
