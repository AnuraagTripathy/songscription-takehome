"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A control whose face turns over.
 *
 * The label you see is what the control is; the label that wipes up under it is
 * what it will do. It is worth its animation only where those two are different
 * sentences, so `reveal` is required — a version of this that says the same
 * thing twice is decoration with a transition on it.
 *
 * From 21st.dev, repigmented to the book: the original is a blue gradient pair
 * with a dark-mode variant this project has no use for.
 */
export function RevealButton({
  children,
  reveal,
  className,
  ...props
}: {
  children: React.ReactNode;
  reveal: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-12 items-center justify-center overflow-hidden",
        "rounded-[5px] border border-board-deep bg-board font-label text-[14px] font-semibold",
        "shadow-lift transition-[box-shadow,transform] duration-150 active:translate-y-px",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-kraft-deep",
        className,
      )}
      {...props}
    >
      <span className="inline-flex h-12 translate-y-0 items-center justify-center whitespace-nowrap px-5 text-paper transition-transform duration-500 group-hover:-translate-y-[150%] md:px-6">
        {children}
      </span>
      <span className="absolute inline-flex h-12 w-full translate-y-full items-center justify-center whitespace-nowrap px-5 text-graphite transition-transform duration-500 group-hover:translate-y-0 md:px-6">
        <span className="absolute h-full w-full translate-y-full skew-y-12 scale-y-0 bg-kraft transition-transform duration-500 group-hover:translate-y-0 group-hover:scale-150" />
        <span className="relative z-10 whitespace-nowrap">{reveal}</span>
      </span>
    </button>
  );
}

export default RevealButton;
