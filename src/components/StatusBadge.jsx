const STATUS_LABELS = {
  success: 'Success',
  partial_success: 'Partial Success',
  failed: 'Failed',
};

function StatusBadge({ status = 'success' }) {
  const label = STATUS_LABELS[status] || status;

  return <span className={`status-badge status-${status}`}>{label}</span>;
}

export default StatusBadge;
