import { Button } from '@workspace/shadcn/components/button';
import { cn } from '@workspace/shadcn/lib/utils';
import type { ReactNode } from 'react';

interface TabData {
  title?: string;
  url?: string;
  favIconUrl?: string;
  active?: boolean;
}

interface WindowCardProps {
  title: string;
  tabCount: number;
  tabs: TabData[];
  actionButton: {
    icon: ReactNode;
    variant: 'destructive' | 'default';
    onClick: () => void;
  };
  isHighlighted?: boolean;
  isClosed?: boolean;
  onTabClick?: (index: number) => void;
}

function getHostname(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function WindowCard({
  title,
  tabCount,
  tabs,
  actionButton,
  isHighlighted = false,
  isClosed = false,
  onTabClick,
}: WindowCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card/50',
        isHighlighted && !isClosed && 'border-2 border-blue-500',
        !isHighlighted && 'border-border',
        isClosed && 'opacity-50 grayscale',
      )}
    >
      <div
        className={`
          flex items-center justify-between border-b border-border bg-muted/50
          px-4 py-3
        `}
      >
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{tabCount} tabs</span>
        <div>
          <Button
            variant={actionButton.variant}
            size="icon"
            onClick={actionButton.onClick}
          >
            {actionButton.icon}
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        {tabs.map((tab, index) => {
          return (
            <div
              key={index}
              className={cn(
                `
                  flex items-center gap-3 border-b border-border px-4 py-3
                  last:border-b-0
                `,
                onTabClick &&
                  !isClosed &&
                  `
                    cursor-pointer transition-colors
                    hover:bg-blue-50
                  `,
                tab.active &&
                  !isClosed &&
                  `border-l-4 border-l-blue-500 bg-blue-100 pl-[calc(1rem-4px)]`,
              )}
              onClick={
                onTabClick && !isClosed
                  ? () => {
                      onTabClick(index);
                    }
                  : undefined
              }
            >
              {tab.favIconUrl && (
                <img
                  src={tab.favIconUrl}
                  alt=""
                  className="h-4 w-4 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-medium">
                  {tab.title || 'Untitled'}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {getHostname(tab.url)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
