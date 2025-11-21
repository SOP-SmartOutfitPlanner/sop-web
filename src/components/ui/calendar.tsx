import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  numberOfMonths: numberOfMonthsProp,
  ...props
}: CalendarProps) {
  const defaultMonths = numberOfMonthsProp ?? 2;
  const [monthsToShow, setMonthsToShow] = React.useState(defaultMonths);
  React.useEffect(() => {
    const updateMonths = () => {
      if (typeof window === "undefined") return;
      const isSmall = window.innerWidth < 768;
      setMonthsToShow(isSmall ? 1 : defaultMonths);
    };

    updateMonths();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateMonths);
      return () => window.removeEventListener("resize", updateMonths);
    }
  }, [defaultMonths]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 text-slate-200", className)}
      mode="range"
      navLayout="around"
      captionLayout="dropdown-years"
      animate
      modifiersClassNames={{
        today:
          "border border-white/50 text-white font-semibold bg-white/10 rounded-full",
        selected: "bg-cyan-500 text-white hover:bg-cyan-600 focus:bg-cyan-600",
        outside: "text-slate-700 opacity-50",
        range_start: "bg-cyan-500 text-white hover:bg-cyan-600 rounded-l-md",
        range_end: "bg-cyan-500 text-white hover:bg-cyan-600 rounded-r-md",
        range_middle:
          "aria-selected:bg-cyan-500/20 aria-selected:text-cyan-200 rounded-none",
      }}
      endMonth={new Date()}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
