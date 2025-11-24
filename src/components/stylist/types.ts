"use client";

import { ReactNode } from "react";

export interface StatCardConfig {
  label: string;
  value: number;
  subLabel?: string;
  icon: ReactNode;
}

