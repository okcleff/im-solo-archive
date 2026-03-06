import Tooltip from '@/shared/ui/Tooltip';

const tooltipContent = (
  <ul className="space-y-1">
    <li><span className="text-green-400">●</span> 고신뢰: 공식 방송 자막·본인 SNS 등 1차 출처</li>
    <li><span className="text-yellow-400">●</span> 중간 신뢰: 블로그·커뮤니티 등 2차 출처</li>
    <li><span className="text-red-400">●</span> 낮은 신뢰: 미확인 정보 또는 루머</li>
  </ul>
);

export default function SourceConfidenceLegend({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs text-slate-500 ${className ?? ''}`}>
      <Tooltip content={tooltipContent}>
        <span className="cursor-help text-slate-400 hover:text-slate-600 transition-colors">💡</span>
      </Tooltip>
      <span className="text-green-500">●</span> 고신뢰 ·{' '}
      <span className="text-yellow-500">●</span> 중간 신뢰 ·{' '}
      <span className="text-red-400">●</span> 낮은 신뢰
    </div>
  );
}
