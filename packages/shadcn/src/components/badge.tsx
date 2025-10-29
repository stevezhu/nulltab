import { Slot } from '@radix-ui/react-slot';
import { cn } from '@workspace/shadcn/lib/utils';
import { badgeVariants } from '@workspace/shadcn/variants/badge';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
