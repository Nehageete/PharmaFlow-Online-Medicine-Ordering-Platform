import { Link } from "react-router-dom";
import { formatCurrency, getMedicineImageUrl } from "../../utils/formatters";

export default function CartItemRow({ item, onQuantityChange, onRemove, updating }) {
  return (
    <tr>
      <td className="d-flex align-items-center gap-3">
        <img
          src={getMedicineImageUrl(item.medicineImage)}
          alt={item.medicineName}
          width="60"
          height="60"
          style={{ objectFit: "cover", borderRadius: "6px" }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/medicine-placeholder.jpg";
          }}
        />
        <Link to={`/medicines/${item.medicineId}`} className="text-decoration-none text-dark fw-semibold">
          {item.medicineName}
        </Link>
      </td>
      <td>{formatCurrency(item.price)}</td>
      <td style={{ maxWidth: "130px" }}>
        <div className="input-group input-group-sm">
          <button
            className="btn btn-outline-secondary"
            disabled={updating || item.quantity <= 1}
            onClick={() => onQuantityChange(item, item.quantity - 1)}
          >
            -
          </button>
          <input
            className="form-control text-center"
            value={item.quantity}
            readOnly
          />
          <button
            className="btn btn-outline-secondary"
            disabled={updating}
            onClick={() => onQuantityChange(item, item.quantity + 1)}
          >
            +
          </button>
        </div>
      </td>
      <td className="fw-semibold">{formatCurrency(item.subtotal)}</td>
      <td>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onRemove(item)}>
          <i className="bi bi-trash" />
        </button>
      </td>
    </tr>
  );
}
