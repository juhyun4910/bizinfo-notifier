/**
 * 네트워크 오류나 서버 오류를 사용자에게 안내하는 배너.
 */
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
