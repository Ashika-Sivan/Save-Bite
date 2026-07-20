interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase();

  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    pending: "bg-orange-100 text-orange-700",
    blocked: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    inactive: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[normalizedStatus] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;