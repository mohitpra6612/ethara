from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse


def create_order(db: Session, order_data: OrderCreate) -> Order:
    """
    Create an order with full business logic:
    1. Validate customer exists
    2. Validate all products exist
    3. Check stock for each item
    4. Calculate prices and totals
    5. Deduct stock atomically
    6. Set status to confirmed
    """
    # 1. Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found",
        )

    order_items: List[OrderItem] = []
    total_amount = 0.0

    for item_data in order_data.items:
        # 2. Validate product exists
        product = (
            db.query(Product).filter(Product.id == item_data.product_id).first()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item_data.product_id} not found",
            )

        # 3. Check stock
        if product.quantity_in_stock < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product: {product.name}",
            )

        # 4. Calculate prices
        unit_price = product.price
        subtotal = unit_price * item_data.quantity
        total_amount += subtotal

        order_item = OrderItem(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )
        order_items.append(order_item)

        # 6. Deduct stock
        product.quantity_in_stock -= item_data.quantity

    # Create order with status confirmed
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        status="confirmed",
        items=order_items,
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_orders(db: Session) -> List[Order]:
    """List all orders with customer info eagerly loaded."""
    return (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .all()
    )


def get_order(db: Session, order_id: int) -> Order:
    """Get an order by ID with items and product details. Raises 404 if not found."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )
    return order


def cancel_order(db: Session, order_id: int) -> Order:
    """Cancel an order: set status to cancelled and restore stock for each item."""
    order = get_order(db, order_id)

    if order.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already cancelled",
        )

    # Restore stock for each item
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity

    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return order


def build_order_response(order: Order) -> OrderResponse:
    """Build an OrderResponse from an Order ORM object, including nested product_name and customer_name."""
    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else "Unknown",
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal,
        )
        for item in order.items
    ]

    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else "Unknown",
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=items,
    )
