from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.crud import customer as customer_crud

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(
    customer_data: CustomerCreate, db: Session = Depends(get_db)
) -> CustomerResponse:
    """Create a new customer."""
    return customer_crud.create_customer(db, customer_data)


@router.get("/", response_model=List[CustomerResponse])
def list_customers(
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
) -> List[CustomerResponse]:
    """List all customers with optional search filter."""
    return customer_crud.get_customers(db, search)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int, db: Session = Depends(get_db)
) -> CustomerResponse:
    """Get a customer by ID."""
    return customer_crud.get_customer(db, customer_id)


@router.delete("/{customer_id}", response_model=CustomerResponse)
def delete_customer(
    customer_id: int, db: Session = Depends(get_db)
) -> CustomerResponse:
    """Delete a customer by ID."""
    return customer_crud.delete_customer(db, customer_id)
