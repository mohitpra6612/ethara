from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.crud import order as order_crud

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    order_data: OrderCreate, db: Session = Depends(get_db)
) -> OrderResponse:
    """Create a new order with stock validation and deduction."""
    order = order_crud.create_order(db, order_data)
    return order_crud.build_order_response(order)


@router.get("/", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)) -> List[OrderResponse]:
    """List all orders with customer info."""
    orders = order_crud.get_orders(db)
    return [order_crud.build_order_response(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int, db: Session = Depends(get_db)
) -> OrderResponse:
    """Get an order with items and product details."""
    order = order_crud.get_order(db, order_id)
    return order_crud.build_order_response(order)


@router.delete("/{order_id}", response_model=OrderResponse)
def cancel_order(
    order_id: int, db: Session = Depends(get_db)
) -> OrderResponse:
    """Cancel an order and restore stock."""
    order = order_crud.cancel_order(db, order_id)
    return order_crud.build_order_response(order)
