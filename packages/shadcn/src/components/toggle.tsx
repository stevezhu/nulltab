import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@workspace/shadcn/lib/utils';
import { toggleVariants } from '@workspace/shadcn/variants/toggle';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle };
