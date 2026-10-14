import { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORY_ICONS = {
  "baby care": "bi-emoji-smile text-warning",
  "skincare": "bi-stars text-info",
  "personal care": "bi-heart-pulse text-danger",
  "health supplements": "bi-capsule text-success",
  "medical devices": "bi-activity text-primary",
  "ayurvedic care": "bi-tree text-success",
  "diabetes care": "bi-droplet text-danger",
  "wellness": "bi-sun text-warning",
};

export default function CategoryCard({ category }) {
  const [imgError, setImgError] = useState(!category.image);
  const normalized = (category.categoryName || "").toLowerCase().trim();
  const iconClass = CATEGORY_ICONS[normalized] || "bi-grid text-primary";

  return (
    <Link
      to={`/medicines?categoryId=${category.categoryId}`}
      className="text-decoration-none"
    >
      <div className="card h-100 text-center shadow-sm category-card border-0">
        {category.image && !imgError ? (
          <img
            src={category.image}
            alt={category.categoryName}
            className="card-img-top"
            style={{ height: "100px", objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-light rounded-top"
            style={{ height: "100px" }}
          >
            <i className={`bi ${iconClass}`} style={{ fontSize: "2.4rem" }} />
          </div>
        )}
        <div className="card-body py-2">
          <span className="fw-semibold text-dark small">{category.categoryName}</span>
        </div>
      </div>
    </Link>
  );
}
