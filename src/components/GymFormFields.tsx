"use client";

import { AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* -----------------------------------------------------------------------
 * Shared form-building-block components.
 *
 * These live in their own module (rather than inline in a page) so any
 * page in the app can reuse the exact same look & feel. They are kept as
 * plain components (not wrapped in React.memo) but are stable references
 * as long as they're imported from here instead of re-declared inline —
 * declaring them inside a page component is what causes input focus loss
 * on keystroke, since a fresh component identity is created every render.
 * --------------------------------------------------------------------- */

export const FormInput = ({
  label,
  placeholder,
  type = "text",
  error,
  ...props
}: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">
      {label}
      {props.required && <span className="text-destructive ml-1">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
        error
          ? "border-destructive bg-destructive/5"
          : "border-border bg-background hover:border-border/80 focus:border-primary"
      } focus:outline-none focus:ring-2 focus:ring-primary/20 `}
      {...props}
    />
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const FormInputWithUnit = ({
  label,
  unit,
  type = "text",
  error,
  ...props
}: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <div className="flex gap-2 items-end">
      <input
        type={type}
        className={`flex-1 min-w-0 px-3 py-2 rounded-lg border transition-colors ${
          error
            ? "border-destructive bg-destructive/5"
            : "border-border bg-background hover:border-border/80 focus:border-primary"
        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
        {...props}
      />
      <span className="text-xs text-muted-foreground pb-2 shrink-0">
        {unit}
      </span>
    </div>
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const FormSelect = ({ label, options, error, ...props }: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">
      {label}
      {props.required && <span className="text-destructive ml-1">*</span>}
    </label>
    <select
      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
        error
          ? "border-destructive bg-destructive/5"
          : "border-border bg-background hover:border-border/80 focus:border-primary"
      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
      {...props}
    >
      <option value="">Select...</option>
      {options.map((opt: any) => (
        <option
          className="px-3.5"
          key={opt.value || opt.id}
          value={opt.value || opt.id}
        >
          {opt.label || opt.name}
        </option>
      ))}
    </select>
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const FormTextarea = ({ label, placeholder, error, ...props }: any) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="text-sm font-medium text-foreground">
      {label}
      {props.required && <span className="text-destructive ml-1">*</span>}
    </label>
    <textarea
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
        error
          ? "border-destructive bg-destructive/5"
          : "border-border bg-background hover:border-border/80 focus:border-primary"
      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
      rows={3}
      {...props}
    />
    {error && (
      <span className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error.message}
      </span>
    )}
  </div>
);

export const SectionCard = ({
  title,
  description,
  icon: Icon,
  badge,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  icon: LucideIcon;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-card-foreground truncate">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {badge}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

/* Simple two-column summary row used inside sidebar SectionCards
 * (Membership Summary, Plan Summary, etc.) — kept here too so both
 * pages render these rows identically. */
export const SummaryRow = ({
  label,
  value,
  emphasize,
  border = true,
}: {
  label: string;
  value: React.ReactNode;
  emphasize?: boolean;
  border?: boolean;
}) => (
  <div
    className={`flex justify-between items-center ${
      border ? "pb-2 border-b border-border" : ""
    }`}
  >
    <span className="text-muted-foreground">{label}</span>
    <span
      className={
        emphasize ? "font-bold text-primary text-lg" : "font-medium text-right"
      }
    >
      {value}
    </span>
  </div>
);
