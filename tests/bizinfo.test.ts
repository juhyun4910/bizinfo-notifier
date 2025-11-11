import axios from "axios";
import { fetchPage, normalizeTags, parseDate, parsePeriod } from "@/lib/bizinfo";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("bizinfo utilities", () => {
  test("parseDate handles multiple formats", () => {
    expect(parseDate("2023-01-01 12:00:00")?.getFullYear()).toBe(2023);
    expect(parseDate("20240102")?.getDate()).toBe(2);
    expect(parseDate(undefined)).toBeNull();
  });

  test("parsePeriod splits into start/end dates", () => {
    const { start, end } = parsePeriod("20240101 ~ 20240201");
    expect(start?.getFullYear()).toBe(2024);
    expect(end?.getMonth()).toBe(1);
  });

  test("normalizeTags removes blanks and normalizes", () => {
    expect(normalizeTags([" 태그", "태그", "Tag", "TAG"]).sort()).toEqual(["tag", "태그"]);
  });

  test("fetchPage retries on 429 with backoff", async () => {
    jest.useFakeTimers();
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 429 } });
    mockedAxios.get.mockResolvedValueOnce({ data: { jsonArray: { item: [] } } });

    const promise = fetchPage({ pageIndex: 1, pageUnit: 10 });

    await Promise.resolve();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    jest.runOnlyPendingTimers();
    await promise;

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
