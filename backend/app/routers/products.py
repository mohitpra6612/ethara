from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.crud import product as product_crud

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product_data: ProductCreate, db: Session = Depends(get_db)
) -> ProductResponse:
    """Create a new product."""
    product = product_crud.create_product(db, product_data)
    return product


@router.get("/", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    db: Session = Depends(get_db),
) -> List[ProductResponse]:
    """List all products with optional search filter."""
    return product_crud.get_products(db, search)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int, db: Session = Depends(get_db)
) -> ProductResponse:
    """Get a product by ID."""
    return product_crud.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
) -> ProductResponse:
    """Update a product by ID."""
    return product_crud.update_product(db, product_id, product_data)


@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(
    product_id: int, db: Session = Depends(get_db)
) -> ProductResponse:
    """Delete a product by ID."""
    return product_crud.delete_product(db, product_id)
