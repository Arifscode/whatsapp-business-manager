export default function MarginBadge({ percent }) {
  const cls =
    percent >= 30 ? 'margin-green' :
    percent >= 15 ? 'margin-yellow' :
    'margin-red';

  return <span className={cls}>{percent}%</span>;
}
