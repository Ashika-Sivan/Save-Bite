import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionButton?: ReactNode;
}

export const EmptyState = ({ icon, title, description, actionButton }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400">
        {icon}
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

      {actionButton && (
        <div className="mt-2">
          {actionButton}
        </div>
      )}
    </div>
  );
};
