from typing import List

from pydantic import BaseModel

from app.schemas.product import ProductResponse
from app.schemas.order import OrderResponse


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
    recent_orders: List[OrderResponse]
