import { z } from "zod";

export const GenderSchema = z.enum(["M", "F"]);

export const PhotoSchema = z.object({
  src: z.string().nullable(),
  alt: z.string(),
});

export const ProfileSchema = z.object({
  birthYear: z.number().int().nullable(),
  job: z.string().nullable(),
  region: z.string().nullable(),
});

export const ParticipantSchema = z.object({
  seasonNo: z.number().int().positive(),
  gender: GenderSchema,
  handle: z.string().min(1),
  photo: PhotoSchema,
  instagram: z.string().nullable(),
  profile: ProfileSchema,
  sources: z.array(z.string().url()),
  finalChoice: z.string().nullable(),
});

export const EpisodeSchema = z.object({
  ep: z.number().int().positive(),
  airDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
});

export const SeasonSchema = z.object({
  seasonNo: z.number().int().positive(),
  label: z.string().min(1),
  episodes: z.array(EpisodeSchema).min(1),
  participants: z.array(ParticipantSchema),
});

export const ShowInfoSchema = z.object({
  titleKo: z.string(),
  titleEn: z.string(),
  officialVod: z.string().url(),
});

export type Gender = z.infer<typeof GenderSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type ShowInfo = z.infer<typeof ShowInfoSchema>;
