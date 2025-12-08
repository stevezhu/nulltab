import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/shadcn/components/tooltip';
import { cn } from '@workspace/shadcn/lib/utils';
import { CirclePause, Clock, MoreHorizontal, Tag, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

import { type Topic } from '#models/index.js';

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
  lastAccessed?: number;
  discarded?: boolean;
  /**
   * Used when the tab is closed or disabled.
   */
  disabled?: boolean;
  truncateTitle?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  // Topic-related props
  topics?: Topic[];
  currentTopicId?: string;
  onTopicChange?: (topicId: string | null) => void;
};

export function WindowCardTab({
  title,
  url,
  favIconUrl,
  active,
  lastAccessed,
  discarded,
  disabled,
  truncateTitle,
  onClick,
  onClose,
  topics,
  currentTopicId,
  onTopicChange,
}: WindowCardTabProps) {
  const currentTopic = topics?.find((t) => t.id === currentTopicId);

  return (
    <div
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
        discarded && 'bg-gray-50/50',
      )}
      onClick={
        onClick && !disabled
          ? () => {
              onClick();
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {favIconUrl && (
        <img
          src={favIconUrl}
          alt=""
          className={cn(
            'h-4 w-4 shrink-0',
            discarded && 'opacity-50 grayscale',
          )}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="min-w-0 flex-1 text-left">
        <div
          className={cn(
            'overflow-hidden text-sm font-medium wrap-break-word',
            truncateTitle && `truncate`,
            discarded && 'text-muted-foreground italic',
          )}
        >
          {title ?? 'Untitled'}
        </div>
        <div className="text-xs wrap-anywhere break-all text-muted-foreground">
          {getHostname(url)}
        </div>
      </div>
      {discarded && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CirclePause className="h-3.5 w-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>Suspended</TooltipContent>
        </Tooltip>
      )}
      {lastAccessed && <LastAccessedDisplay timestamp={lastAccessed} />}
      {/* Actions menu */}
      {(onClose || (topics && onTopicChange)) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                `
                  flex shrink-0 items-center rounded-md p-1
                  text-muted-foreground transition-colors
                `,
                'hover:bg-accent hover:text-foreground',
              )}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Topic submenu */}
            {topics && onTopicChange && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Tag className="h-4 w-4" />
                  <span>Topic</span>
                  {currentTopic && (
                    <span
                      className="ml-auto h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: currentTopic.color }}
                    />
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={!currentTopicId}
                    onCheckedChange={() => {
                      onTopicChange(null);
                    }}
                  >
                    Uncategorized
                  </DropdownMenuCheckboxItem>
                  {topics.map((topic) => (
                    <DropdownMenuCheckboxItem
                      key={topic.id}
                      checked={currentTopicId === topic.id}
                      onCheckedChange={() => {
                        onTopicChange(topic.id);
                      }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="truncate">{topic.name}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            {/* Close tab */}
            {onClose && (
              <>
                {topics && onTopicChange && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                  <span>Close tab</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
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

function LastAccessedDisplay({ timestamp }: { timestamp: number }) {
  const [now, setNow] = useState(() => Date.now());

  // Update `now` periodically so the display stays fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const diff = now - timestamp;
  const hours = diff / (1000 * 60 * 60);

  const clockColor =
    hours < 1
      ? 'text-green-500'
      : hours < 24
        ? 'text-blue-400'
        : hours < 72
          ? 'text-amber-500'
          : 'text-red-400/80';

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <div className="flex shrink-0 items-center gap-1">
          <Clock className={cn('h-3.5 w-3.5', clockColor)} />
          <span className="text-xs text-muted-foreground">
            {formatLastAccessed(timestamp, now)}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        {new Date(timestamp).toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </TooltipContent>
    </Tooltip>
  );
}

function formatLastAccessed(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const date = new Date(timestamp);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return 'Now';
  if (minutes < 1) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  // Older than a week: show date
  return date.toLocaleDateString();
}
