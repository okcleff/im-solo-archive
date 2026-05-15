import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';

function getBuildLastUpdated(): string {
  if (process.env.NEXT_PUBLIC_LAST_UPDATED) {
    return process.env.NEXT_PUBLIC_LAST_UPDATED;
  }

  const commands = [
    'git log -1 --merges --first-parent --format=%cd --date=short',
    'git log -1 --format=%cd --date=short',
  ];

  for (const command of commands) {
    try {
      const date = execSync(command, { encoding: 'utf-8' }).trim();

      if (date) {
        return date;
      }
    } catch {
      // Git metadata may be unavailable in some build environments.
    }
  }

  return '';
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_UPDATED: getBuildLastUpdated(),
  },
  images: {
    // 실제 사진 URL 도메인을 여기에 추가하세요 (예: i.imgur.com, cdn.example.com)
    remotePatterns: [],
  },
  // 순수 정적 배포(GitHub Pages 등)가 필요하다면 아래 주석 해제
  // output: 'export',
};

export default nextConfig;
