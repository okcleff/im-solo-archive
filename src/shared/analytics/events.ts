declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackSeasonTabClick(seasonNo: number) {
  trackEvent("season_tab_click", { season_no: seasonNo });
}

export function trackParticipantCardClick(
  seasonNo: number,
  name: string,
  gender: string
) {
  trackEvent("participant_card_click", { season_no: seasonNo, name, gender });
}

export function trackSearchQuery(query: string) {
  if (!query.trim()) return;
  trackEvent("search_query", { query });
}
