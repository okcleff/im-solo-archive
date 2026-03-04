export type Gender = 'M' | 'F';
export type Confidence = 'high' | 'medium' | 'low';

export interface Photo {
  src: string | null;
  alt: string;
}

export interface Source {
  title: string;
  url: string;
  confidence: Confidence;
}

export interface Profile {
  birthYear: number | null;
  ageKorean: number | null;
  job: string | null;
  region: string | null;
  traits: string[];
  notableQuotes: string[];
  issues: string[];
}

export interface Participant {
  seasonNo: number;
  gender: Gender;
  handle: string;
  photo: Photo;
  /** 인스타그램 username (@ 제외). 예: 'solo_youngsoo30'. null이면 미공개. */
  instagram: string | null;
  profile: Profile;
  sources: Source[];
}

export interface Episode {
  ep: number;
  airDate: string;
}

export interface Season {
  seasonNo: number;
  label: string;
  episodes: Episode[];
  participants: Participant[];
}

export interface ShowInfo {
  titleKo: string;
  titleEn: string;
  officialVod: string;
}
