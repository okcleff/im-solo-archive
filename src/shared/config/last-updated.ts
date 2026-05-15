const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UNKNOWN_LAST_UPDATED = "확인 불가";

type LastUpdatedOptions = {
  env?: NodeJS.ProcessEnv;
  fallback?: string;
};

export function resolveLastUpdated({
  env = process.env,
  fallback = UNKNOWN_LAST_UPDATED,
}: LastUpdatedOptions = {}): string {
  const lastUpdated = env.NEXT_PUBLIC_LAST_UPDATED?.trim();

  return lastUpdated && ISO_DATE_PATTERN.test(lastUpdated)
    ? lastUpdated
    : fallback;
}
