from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.schemas.dashboard import DashboardResponse
from app.crud.order import build_order_response

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    """Get dashboard summary with totals, low-stock products, and recent orders."""
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    # Low stock products (quantity_in_stock <= 10)
    low_stock_products = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= 10)
        .all()
    )

    # Recent orders (last 5)
    recent_orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
        recent_orders=[build_order_response(order) for order in recent_orders],
    )
