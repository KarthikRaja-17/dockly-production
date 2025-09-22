export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Single unified responsive function that handles all cases
export const responsive = (
  condition: string | Breakpoint | number
): boolean => {
  if (typeof window === "undefined") return false;
  const width = typeof window !== "undefined" ? window.innerWidth : 0;

  // Handle string conditions
  if (typeof condition === "string") {
    const lowerCondition = condition.toLowerCase();

    // Device type checks
    if (lowerCondition === "mobile") return width < breakpoints.md;
    if (lowerCondition === "tablet")
      return width >= breakpoints.md && width < breakpoints.lg;
    if (lowerCondition === "desktop") return width >= breakpoints.lg;
    if (lowerCondition === "small-mobile") return width < breakpoints.sm;

    // Range checks (e.g., "sm-lg", "md-xl")
    if (lowerCondition.includes("-")) {
      const [min, max] = lowerCondition.split("-") as [Breakpoint, Breakpoint];
      if (min in breakpoints && max in breakpoints) {
        return width >= breakpoints[min] && width < breakpoints[max];
      }
    }

    // Minimum checks (e.g., "sm+", "lg+")
    if (lowerCondition.endsWith("+")) {
      const bp = lowerCondition.slice(0, -1) as Breakpoint;
      if (bp in breakpoints) {
        return width >= breakpoints[bp];
      }
    }

    // Maximum checks (e.g., "sm-", "lg-")
    if (lowerCondition.endsWith("-")) {
      const bp = lowerCondition.slice(0, -1) as Breakpoint;
      if (bp in breakpoints) {
        return width < breakpoints[bp];
      }
    }

    // Exact breakpoint check
    if (lowerCondition in breakpoints) {
      const bp = lowerCondition as Breakpoint;
      const breakpointKeys = Object.keys(breakpoints) as Breakpoint[];
      const currentIndex = breakpointKeys.indexOf(bp);
      const nextBreakpoint = breakpointKeys[currentIndex + 1];

      if (!nextBreakpoint) {
        return width >= breakpoints[bp];
      }

      return width >= breakpoints[bp] && width < breakpoints[nextBreakpoint];
    }
  }

  // Handle breakpoint enum
  if (typeof condition === "string" && condition in breakpoints) {
    return width >= breakpoints[condition as Breakpoint];
  }

  // Handle direct pixel value
  if (typeof condition === "number") {
    return width >= condition;
  }

  return false;
};

// Get current breakpoint
export const getCurrentBreakpoint = (): Breakpoint => {
  const width = typeof window !== "undefined" ? window.innerWidth : 0;

  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
};

// Get current dimensions
export const getDimensions = () => ({
  width: typeof window !== "undefined" ? window.innerWidth : 0,
  height: typeof window !== "undefined" ? window.innerHeight : 0,
});
