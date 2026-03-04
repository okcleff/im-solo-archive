import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 실제 사진 URL 도메인을 여기에 추가하세요 (예: i.imgur.com, cdn.example.com)
    remotePatterns: [],
  },
  // 순수 정적 배포(GitHub Pages 등)가 필요하다면 아래 주석 해제
  // output: 'export',
};

export default nextConfig;
