"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type * as React from "react";
import { cn } from "../../lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
