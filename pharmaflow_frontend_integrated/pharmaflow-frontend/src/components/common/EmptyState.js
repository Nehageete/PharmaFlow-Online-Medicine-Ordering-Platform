export default function EmptyState({ icon = "bi-inbox", title, subtitle, action }) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} display-3 text-muted`} />
      <h5 className="mt-3">{title}</h5>
      {subtitle && <p className="text-muted">{subtitle}</p>}
      {action}
    </div>
  );
}
