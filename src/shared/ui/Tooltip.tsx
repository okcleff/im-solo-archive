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
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          w-max max-w-[220px] px-3 py-2 rounded-lg
          bg-slate-800 text-white text-xs leading-relaxed
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 z-50 shadow-lg text-left
        "
      >
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}
