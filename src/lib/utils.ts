import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const fileNameToUrlMap: Record<string, string> = {
  "Architect's Supplemental Instructions": "architects-instructions",
  "Bill of Quantity": "bill-of-quantity",
  "Change Order": "change-order",
  "Consent of Surety (Retainage)": "consent-of-surety",
  "Consent of Surety (Final Payment)": "consent-of-surety",
  "Construction Change Directive": "construction-change-director",
  "Construction Activity Schedule": "construction-schedule",
  "Continuation Sheet": "continuation-sheet",
  "Drawings List": "drawings",
  "Instruction Sheet": "instruction-sheet",
  "List of Contractors": "list-of-contractors",
  "List of Sub-Consultants": "list-of-sub-consultants",
  "Preliminary Project Budget": "preliminary-project-budget",
  "Project Agreement": "project-agreement",
  "Project Application Summary": "project-application-summary",
  "Project Checklist": "project-checklist",
  "Project Data": "project-data",
  "Proposal Request": "proposal-request",
  "Rate Analysis": "rate-analysis",
  "Shop Drawing and Sample Record": "shop-drawings-record",
  "Timeline Schedule": "time-line-schedule",
};

export function getFormUrlFromFileName(fileName: string, dashboardPrefix: 'dashboard' | 'employee-dashboard'): string | null {
  const slug = fileNameToUrlMap[fileName];
  if (slug) {
    return `/${dashboardPrefix}/${slug}`;
  }
  return null;
}
