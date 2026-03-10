import Tooltip from '@/shared/ui/Tooltip';

const tooltipContent = (
  <ul className="space-y-1">
    <li><span className="text-emerald-400">●</span> 고신뢰: 공식 방송 자막·본인 SNS 등 1차 출처</li>
    <li><span className="text-amber-400">●</span> 중간 신뢰: 블로그·커뮤니티 등 2차 출처</li>
    <li><span className="text-rose-400">●</span> 낮은 신뢰: 미확인 정보 또는 루머</li>
  </ul>
);

export default function SourceConfidenceLegend({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs text-base-content/55 ${className ?? ''}`}>
      <Tooltip content={tooltipContent}>
        <button
          type="button"
          aria-label="출처 신뢰도 설명 보기"
          className="btn btn-ghost btn-xs btn-circle"
        >
          ?
        </button>
      </Tooltip>
      <span className="text-emerald-500">●</span> 고신뢰 · <span className="text-amber-500">●</span> 중간 신뢰 ·{' '}
      <span className="text-rose-400">●</span> 낮은 신뢰
    </div>
  );
}
