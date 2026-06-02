from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product_data: ProductCreate) -> Product:
    """Create a new product. Raises 409 if SKU already exists."""
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{product_data.sku}' already exists",
        )

    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session, search: Optional[str] = None) -> List[Product]:
    """List all products, optionally filtered by search query on name or SKU."""
    query = db.query(Product)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Product.name.ilike(search_pattern) | Product.sku.ilike(search_pattern)
        )
    return query.all()


def get_product(db: Session, product_id: int) -> Product:
    """Get a product by ID. Raises 404 if not found."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )
    return product


def update_product(
    db: Session, product_id: int, product_data: ProductUpdate
) -> Product:
    """Update a product. Validates unique SKU if changed. Raises 404/409."""
    product = get_product(db, product_id)

    update_data = product_data.model_dump(exclude_unset=True)

    # Validate unique SKU if it's being changed
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{update_data['sku']}' already exists",
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> Product:
    """Delete a product. Raises 400 if product is in any active order."""
    product = get_product(db, product_id)

    # Check if product is in any active (non-cancelled) order
    active_order_item = (
        db.query(OrderItem)
        .join(OrderItem.order)
        .filter(
            OrderItem.product_id == product_id,
            Order.status != "cancelled",
        )
        .first()
    )

    if active_order_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product that is part of an active order",
        )

    db.delete(product)
    db.commit()
    return product
