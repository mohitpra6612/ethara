from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate


def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    """Create a new customer. Raises 409 if email already exists."""
    existing = (
        db.query(Customer).filter(Customer.email == customer_data.email).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{customer_data.email}' already exists",
        )

    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_customers(db: Session, search: Optional[str] = None) -> List[Customer]:
    """List all customers, optionally filtered by search query on name or email."""
    query = db.query(Customer)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Customer.full_name.ilike(search_pattern)
            | Customer.email.ilike(search_pattern)
        )
    return query.all()


def get_customer(db: Session, customer_id: int) -> Customer:
    """Get a customer by ID. Raises 404 if not found."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {customer_id} not found",
        )
    return customer


def delete_customer(db: Session, customer_id: int) -> Customer:
    """Delete a customer. Raises 400 if customer has any orders."""
    customer = get_customer(db, customer_id)

    has_orders = (
        db.query(Order).filter(Order.customer_id == customer_id).first()
    )
    if has_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete customer that has orders",
        )

    db.delete(customer)
    db.commit()
    return customer
