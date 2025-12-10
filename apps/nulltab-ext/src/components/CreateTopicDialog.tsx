import { Button } from '@workspace/shadcn/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/shadcn/components/dialog';
import { Input } from '@workspace/shadcn/components/input';
import { cn } from '@workspace/shadcn/lib/utils';
import { Plus } from 'lucide-react';
import { ComponentProps, type ReactNode, useState } from 'react';

const TOPIC_COLORS: [string, ...string[]] = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export type CreateTopicDialogProps = {
  onCreateTopic: (name: string, color?: string) => void;
  children?: ReactNode;
};

export function CreateTopicDialog({
  onCreateTopic,
  children,
}: CreateTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(TOPIC_COLORS[0]);

  const handleCreate = () => {
    if (name.trim()) {
      onCreateTopic(name.trim(), selectedColor);
      setName('');
      setSelectedColor(TOPIC_COLORS[0]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Topic</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Topic name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
            autoFocus
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Color</span>
            <div className="flex flex-wrap gap-2">
              {TOPIC_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'h-6 w-6 rounded-full transition-all',
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : 'hover:scale-110',
                  )}
                  style={{
                    backgroundColor: color,
                    // @ts-expect-error - CSS custom property for Tailwind ring color
                    '--tw-ring-color': color,
                  }}
                  onClick={() => {
                    setSelectedColor(color);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateTopicButton(props: ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="sm" {...props}>
      <Plus />
      <span>Add</span>
    </Button>
  );
}
