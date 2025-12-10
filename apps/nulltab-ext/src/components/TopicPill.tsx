import { Badge } from '@workspace/shadcn/components/badge';
import { cn } from '@workspace/shadcn/lib/utils';
import { X } from 'lucide-react';
import { ComponentProps, ReactNode } from 'react';

export type TopicPillProps = {
  color?: string;
  selected?: boolean;
  children?: ReactNode;
} & ComponentProps<typeof Badge>;

export function TopicPill({
  color,
  selected,
  children,
  ...props
}: TopicPillProps) {
  return (
    <Badge
      variant={selected ? 'default' : 'outline'}
      className={cn(
        'cursor-pointer gap-1.5 px-3 py-1 text-xs transition-colors select-none',
        selected && 'bg-primary text-primary-foreground',
        !selected && 'hover:bg-accent',
      )}
      style={
        color && selected
          ? { backgroundColor: color, borderColor: color }
          : color && !selected
            ? { borderColor: color, color: color }
            : undefined
      }
      {...props}
    >
      {children}
    </Badge>
  );
}

export function TopicPillLabel({
  selected,
  color,
  count,
  children,
}: {
  selected?: boolean;
  color?: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <>
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: selected ? 'currentColor' : color }}
        />
      )}
      {children}
      {count && <span className="ml-0.5 tabular-nums">{count}</span>}
    </>
  );
}

export function TopicPillDeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={`
        ml-1 rounded-full p-0.5
        hover:bg-white/20
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <X className="h-3 w-3" />
    </button>
  );
}
