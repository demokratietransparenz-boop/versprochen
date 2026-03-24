"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="text-xs text-gray-400 mb-4">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1">&rsaquo;</span>}
          {item.href ? (
            <Link href={item.href} className="text-[#1a56b8] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
