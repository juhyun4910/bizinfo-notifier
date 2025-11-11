import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NoticeCard } from "@/components/notice-card";
import { NoticeCardDTO } from "@/lib/types";

jest.mock("@/lib/api", () => ({
  createBookmark: jest.fn().mockResolvedValue({ ok: true, id: 1 }),
  deleteBookmark: jest.fn().mockResolvedValue({ ok: true }),
}));

const notice: NoticeCardDTO = {
  id: "1",
  title: "테스트 공고",
  summary: "요약",
  pubDate: new Date().toISOString(),
  deadline: "20240101 ~ 20240131",
  organization: "기관",
  category: "분야",
  tags: [
    { id: 1, name: "태그" },
  ],
  bookmarked: false,
  bookmarkId: null,
};

describe("NoticeCard", () => {
  test("renders snapshot", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <NoticeCard notice={notice} />
      </QueryClientProvider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
