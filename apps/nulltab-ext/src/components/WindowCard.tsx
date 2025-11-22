import { cn } from '@workspace/shadcn/lib/utils';
import type { ReactNode } from 'react';

export type WindowCardProps = {
  active?: boolean;
  disabled?: boolean;
  children?: ReactNode;
};

export function WindowCard({ active, disabled, children }: WindowCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card/50',
        active && !disabled && 'border-blue-500 outline-1 outline-blue-500',
        !active && 'border-border',
        disabled && 'opacity-50 grayscale',
      )}
    >
      {children}
    </div>
  );
}

export type WindowCardHeaderProps = {
  title: string;
  tabCount?: number;
  children?: ReactNode;
};

export function WindowCardHeader({
  title,
  tabCount,
  children,
}: WindowCardHeaderProps) {
  return (
    <div
      className={`
        flex items-center justify-between border-b border-border bg-muted/50
        px-4 py-3
      `}
    >
      <div className="flex items-baseline gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {tabCount && (
          <span className="text-sm text-muted-foreground">{tabCount} tabs</span>
        )}
      </div>
      {children}
    </div>
  );
}

export type WindowCardTabsProps = {
  children?: ReactNode;
};

export function WindowCardTabs({ children }: WindowCardTabsProps) {
  return <div className="flex flex-col">{children}</div>;
}

export type WindowCardTabProps = {
  title?: string;
  url?: string;
  favIconUrl?: string;
  active?: boolean;
  /**
   * Used when the tab is closed or disabled.
   */
  disabled?: boolean;
  truncateTitle?: boolean;
  onClick?: () => void;
};

export function WindowCardTab({
  title,
  url,
  favIconUrl,
  active,
  disabled,
  truncateTitle,
  onClick,
}: WindowCardTabProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        `
          flex items-center gap-3 border-b border-border px-4 py-3
          last:border-b-0
        `,
        !disabled &&
          onClick &&
          `
            cursor-pointer transition-colors
            hover:bg-blue-50
          `,
        !disabled &&
          active &&
          `border-l-4 border-l-blue-500 bg-blue-100 pl-[calc(1rem-4px)]`,
      )}
      onClick={
        onClick
          ? () => {
              onClick();
            }
          : undefined
      }
    >
      {favIconUrl && (
        <img
          src={favIconUrl}
          alt=""
          className="h-4 w-4 shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="min-w-0 flex-1 text-left">
        <div className={cn('text-sm font-medium', truncateTitle && 'truncate')}>
          {title ?? 'Untitled'}
        </div>
        <div className="text-xs wrap-anywhere break-all text-muted-foreground">
          {getHostname(url)}
        </div>
      </div>
    </button>
  );
}

function getHostname(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
