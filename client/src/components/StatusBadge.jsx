const STATUS_CLASSES = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  DISPATCHED:'badge-dispatched',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
};

const STATUS_LABELS = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  DISPATCHED:'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function StatusBadge({ status }) {
  return (
    <span className={STATUS_CLASSES[status] || 'badge-pending'}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
