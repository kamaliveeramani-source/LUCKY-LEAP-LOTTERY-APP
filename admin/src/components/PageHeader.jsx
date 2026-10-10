export default function PageHeader({ eyebrow, title, description, action, crumb }) {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        <div className="breadcrumb-row">
          {crumb ? <span className="breadcrumb">{crumb}</span> : <span className="eyebrow">{eyebrow}</span>}
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}