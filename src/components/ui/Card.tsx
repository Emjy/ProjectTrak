import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-card ${
        hoverable
          ? "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
