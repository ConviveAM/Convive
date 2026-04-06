"use client";

import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";

type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      className={cn("convive-calendar", className)}
      showOutsideDays
      fixedWeeks
      captionLayout="dropdown"
      {...props}
    />
  );
}
