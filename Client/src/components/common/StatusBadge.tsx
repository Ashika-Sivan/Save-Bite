interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase();

  const styles: Record<string, string> = {
    active: "bg-green-600 text-white",
    approved: "bg-green-600 text-white",
    pending: "bg-orange-100 text-orange-700",
    blocked: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-gray-200 text-gray-600",
    inactive: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[normalizedStatus] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
