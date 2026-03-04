import type { Participant } from '@/entities/participant';

export function filterParticipants(
  participants: Participant[],
  gender: string,
  query: string,
): Participant[] {
  return participants.filter((p) => {
    const matchGender =
      !gender || gender === 'all' || p.gender === gender.toUpperCase();

    const q = query.toLowerCase().trim();
    const matchQuery =
      !q ||
      p.handle.toLowerCase().includes(q) ||
      (p.profile.job?.toLowerCase().includes(q) ?? false) ||
      (p.profile.region?.toLowerCase().includes(q) ?? false) ||
      p.profile.traits.some((t) => t.toLowerCase().includes(q)) ||
      p.profile.notableQuotes.some((nq) => nq.toLowerCase().includes(q));

    return matchGender && matchQuery;
  });
}
