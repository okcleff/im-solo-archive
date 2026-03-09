interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({ content, children, className }: Props) {
  return (
    <span className={`relative group inline-flex items-center ${className ?? ''}`}>
      {children}
      <span
        role="tooltip"
        className="
          absolute bottom-full left-0 mb-2
          w-56 max-w-[80vw] px-3 py-2 rounded-xl
          bg-slate-900/95 dark:bg-slate-800/95
          text-slate-100 text-xs leading-relaxed
          border border-slate-700 dark:border-slate-600/80
          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none
          transition-opacity duration-150 z-[60]
          shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.6)]
          backdrop-blur-sm text-left
        "
      >
        {content}
        <span className="absolute top-full left-3 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
      </span>
    </span>
  );
}
