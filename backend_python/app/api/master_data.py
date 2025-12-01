from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.responses import FileResponse
import pandas as pd
from io import BytesIO
import os
import re
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.master_data import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    SiteCreate, SiteUpdate, SiteResponse,
    GuardCreate, GuardUpdate, GuardResponse,
    StaffCreate, StaffUpdate, StaffResponse,
    BankCreate, BankUpdate, BankResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    ServiceCreate, ServiceUpdate, ServiceResponse
)
from app.core.deps import get_current_active_user
from app.database import get_db
from app.models.customer import Customer
from app.models.site import Site
from app.models.guard import Guard
from app.models.staff import Staff
from app.models.bank import Bank
from app.models.user import User
from app.models.product import Product
from app.models.service import Service
import json


router = APIRouter()


# ========== CUSTOMER ENDPOINTS ==========

@router.get("/customers", response_model=List[CustomerResponse])
async def get_customers(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all customers"""
    result = await db.execute(select(Customer).order_by(Customer.id))
    customers = result.scalars().all()
    
    return [
        {
            "id": str(c.id),
            "code": c.code,
            "name": c.name,
            "contactPerson": c.contactPerson,
            "phone": c.phone,
            "email": c.email,
            "address": c.address,
            "isActive": c.isActive,
            "createdAt": c.createdAt
        }
        for c in customers
    ]


@router.post("/customers", response_model=CustomerResponse)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new customer"""
    # Check duplicate code
    result = await db.execute(select(Customer).where(Customer.code == customer_data.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="รหัสลูกค้าซ้ำ (Customer Code already exists)")

    new_customer = Customer(
        code=customer_data.code,
        name=customer_data.name,
        contactPerson=customer_data.contactPerson,
        phone=customer_data.phone,
        email=customer_data.email,
        address=customer_data.address,
        isActive=customer_data.isActive
    )
    
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)
    
    return {
        "id": str(new_customer.id),
        "code": new_customer.code,
        "name": new_customer.name,
        "contactPerson": new_customer.contactPerson,
        "phone": new_customer.phone,
        "email": new_customer.email,
        "address": new_customer.address,
        "isActive": new_customer.isActive,
        "createdAt": new_customer.createdAt
    }


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customer by ID"""
    try:
        cid = int(customer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
        
    result = await db.execute(select(Customer).where(Customer.id == cid))
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "id": str(customer.id),
        "code": customer.code,
        "name": customer.name,
        "contactPerson": customer.contactPerson,
        "phone": customer.phone,
        "email": customer.email,
        "address": customer.address,
        "isActive": customer.isActive,
        "createdAt": customer.createdAt
    }


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update customer"""
    try:
        cid = int(customer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
        
    result = await db.execute(select(Customer).where(Customer.id == cid))
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer_data.code is not None:
        # Check duplicate if code is changing
        if customer_data.code != customer.code:
            existing = await db.execute(select(Customer).where(Customer.code == customer_data.code))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="รหัสลูกค้าซ้ำ")
        customer.code = customer_data.code

    if customer_data.name is not None:
        customer.name = customer_data.name
    if customer_data.contactPerson is not None:
        customer.contactPerson = customer_data.contactPerson
    if customer_data.phone is not None:
        customer.phone = customer_data.phone
    if customer_data.email is not None:
        customer.email = customer_data.email
    if customer_data.address is not None:
        customer.address = customer_data.address
    if customer_data.isActive is not None:
        customer.isActive = customer_data.isActive
        
    await db.commit()
    await db.refresh(customer)
    
    return {
        "id": str(customer.id),
        "code": customer.code,
        "name": customer.name,
        "contactPerson": customer.contactPerson,
        "phone": customer.phone,
        "email": customer.email,
        "address": customer.address,
        "isActive": customer.isActive,
        "createdAt": customer.createdAt
    }


@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete customer"""
    try:
        cid = int(customer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
        
    result = await db.execute(select(Customer).where(Customer.id == cid))
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    await db.delete(customer)
    await db.commit()
    
    return {"message": "Customer deleted successfully"}


# ========== SITE ENDPOINTS ==========

@router.get("/sites", response_model=List[SiteResponse])
async def get_sites(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all sites"""
    result = await db.execute(select(Site).order_by(Site.id))
    sites = result.scalars().all()
    
    # Get customers for mapping
    customers_result = await db.execute(select(Customer))
    customers = customers_result.scalars().all()
    customer_map = {c.id: c for c in customers}
    
    result_list = []
    for site in sites:
        customer = customer_map.get(site.customerId)
        result_list.append({
            "id": str(site.id),
            "name": site.name,
            "customerId": str(site.customerId) if site.customerId else "",
            "customerName": customer.name if customer else None,
            "address": site.address,
            "contactPerson": site.contactPerson,
            "phone": site.phone,
            "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],
            "isActive": site.isActive,
            "createdAt": site.createdAt
        })
    
    return result_list


@router.post("/sites", response_model=SiteResponse)
async def create_site(
    site_data: SiteCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new site"""
    # Verify customer exists
    try:
        cid = int(site_data.customerId)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
        
    result = await db.execute(select(Customer).where(Customer.id == cid))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    new_site = Site(
        name=site_data.name,
        customerId=cid,
        address=site_data.address,
        contactPerson=site_data.contactPerson,
        phone=site_data.phone,
        contractedServices=json.dumps(site_data.contractedServices or []),
        isActive=site_data.isActive
    )
    
    db.add(new_site)
    await db.commit()
    await db.refresh(new_site)
    
    return {
        "id": str(new_site.id),
        "name": new_site.name,
        "customerId": str(new_site.customerId),
        "customerName": customer.name,
        "address": new_site.address,
        "contactPerson": new_site.contactPerson,
        "phone": new_site.phone,
        "contractedServices": json.loads(new_site.contractedServices),
        "isActive": new_site.isActive,
        "createdAt": new_site.createdAt
    }


@router.get("/sites/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get site by ID"""
    try:
        sid = int(site_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid site ID")
        
    result = await db.execute(select(Site).where(Site.id == sid))
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    result = await db.execute(select(Customer).where(Customer.id == site.customerId))
    customer = result.scalar_one_or_none()
    
    return {
        "id": str(site.id),
        "name": site.name,
        "customerId": str(site.customerId) if site.customerId else "",
        "customerName": customer.name if customer else None,
        "address": site.address,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],
        "isActive": site.isActive,
        "createdAt": site.createdAt
    }


@router.put("/sites/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: str,
    site_data: SiteUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update site"""
    try:
        sid = int(site_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid site ID")
        
    result = await db.execute(select(Site).where(Site.id == sid))
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    if site_data.name is not None:
        site.name = site_data.name
    if site_data.customerId is not None:
        try:
            cid = int(site_data.customerId)
            result = await db.execute(select(Customer).where(Customer.id == cid))
            if not result.scalar_one_or_none():
                raise HTTPException(status_code=404, detail="Customer not found")
            site.customerId = cid
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid customer ID")
            
    if site_data.address is not None:
        site.address = site_data.address
    if site_data.contactPerson is not None:
        site.contactPerson = site_data.contactPerson
    if site_data.phone is not None:
        site.phone = site_data.phone
    if site_data.contractedServices is not None:
        site.contractedServices = json.dumps(site_data.contractedServices)
    if site_data.isActive is not None:
        site.isActive = site_data.isActive
        
    await db.commit()
    await db.refresh(site)
    
    result = await db.execute(select(Customer).where(Customer.id == site.customerId))
    customer = result.scalar_one_or_none()
    
    return {
        "id": str(site.id),
        "name": site.name,
        "customerId": str(site.customerId) if site.customerId else "",
        "customerName": customer.name if customer else None,
        "address": site.address,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],
        "isActive": site.isActive,
        "createdAt": site.createdAt
    }


@router.delete("/sites/{site_id}")
async def delete_site(
    site_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete site"""
    try:
        sid = int(site_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid site ID")
        
    result = await db.execute(select(Site).where(Site.id == sid))
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    await db.delete(site)
    await db.commit()
    
    return {"message": "Site deleted successfully"}


# ========== GUARD ENDPOINTS ==========

@router.get("/guards", response_model=List[GuardResponse])
async def get_guards(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all guards"""
    result = await db.execute(select(Guard).order_by(Guard.id))
    guards = result.scalars().all()
    
    return [
        {
            "id": str(g.id),
            "guardId": g.guardId,
            "name": g.name,
            "phone": g.phone,
            "address": g.address,
            "bankAccountNo": g.bankAccountNo,
            "bankCode": g.bankCode,
            "isActive": g.isActive,
            "createdAt": g.createdAt
        }
        for g in guards
    ]


@router.post("/guards", response_model=GuardResponse)
async def create_guard(
    guard_data: GuardCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new guard"""
    # Check if guardId already exists
    result = await db.execute(select(Guard).where(Guard.guardId == guard_data.guardId))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Guard ID already exists")
    
    new_guard = Guard(
        guardId=guard_data.guardId,
        name=guard_data.name,
        phone=guard_data.phone,
        address=guard_data.address,
        bankAccountNo=guard_data.bankAccountNo,
        bankCode=guard_data.bankCode,
        isActive=guard_data.isActive
    )
    
    db.add(new_guard)
    await db.commit()
    await db.refresh(new_guard)
    
    return {
        "id": str(new_guard.id),
        "guardId": new_guard.guardId,
        "name": new_guard.name,
        "phone": new_guard.phone,
        "address": new_guard.address,
        "bankAccountNo": new_guard.bankAccountNo,
        "bankCode": new_guard.bankCode,
        "isActive": new_guard.isActive,
        "createdAt": new_guard.createdAt
    }


@router.get("/guards/{guard_id}", response_model=GuardResponse)
async def get_guard(
    guard_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get guard by ID"""
    try:
        gid = int(guard_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid guard ID")
        
    result = await db.execute(select(Guard).where(Guard.id == gid))
    guard = result.scalar_one_or_none()
    
    if not guard:
        raise HTTPException(status_code=404, detail="Guard not found")
    
    return {
        "id": str(guard.id),
        "guardId": guard.guardId,
        "name": guard.name,
        "phone": guard.phone,
        "address": guard.address,
        "bankAccountNo": guard.bankAccountNo,
        "bankCode": guard.bankCode,
        "isActive": guard.isActive,
        "createdAt": guard.createdAt
    }


@router.put("/guards/{guard_id}", response_model=GuardResponse)
async def update_guard(
    guard_id: str,
    guard_data: GuardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update guard"""
    try:
        gid = int(guard_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid guard ID")
        
    result = await db.execute(select(Guard).where(Guard.id == gid))
    guard = result.scalar_one_or_none()
    
    if not guard:
        raise HTTPException(status_code=404, detail="Guard not found")
    
    if guard_data.name is not None:
        guard.name = guard_data.name
    if guard_data.phone is not None:
        guard.phone = guard_data.phone
    if guard_data.address is not None:
        guard.address = guard_data.address
    if guard_data.bankAccountNo is not None:
        guard.bankAccountNo = guard_data.bankAccountNo
    if guard_data.bankCode is not None:
        guard.bankCode = guard_data.bankCode
    if guard_data.isActive is not None:
        guard.isActive = guard_data.isActive
        
    await db.commit()
    await db.refresh(guard)
    
    return {
        "id": str(guard.id),
        "guardId": guard.guardId,
        "name": guard.name,
        "phone": guard.phone,
        "address": guard.address,
        "bankAccountNo": guard.bankAccountNo,
        "bankCode": guard.bankCode,
        "isActive": guard.isActive,
        "createdAt": guard.createdAt
    }


@router.delete("/guards/{guard_id}")
async def delete_guard(
    guard_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete guard"""
    try:
        gid = int(guard_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid guard ID")
        
    result = await db.execute(select(Guard).where(Guard.id == gid))
    guard = result.scalar_one_or_none()
    
    if not guard:
        raise HTTPException(status_code=404, detail="Guard not found")
        
    await db.delete(guard)
    await db.commit()
    
    return {"message": "Guard deleted successfully"}


# ========== STAFF ENDPOINTS ==========

@router.get("/staff", response_model=List[StaffResponse])
async def get_staff(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all staff"""
    result = await db.execute(select(Staff).order_by(Staff.id))
    staff_list = result.scalars().all()
    
    return [
        {
            "id": str(s.id),
            "guardId": s.staffId,
            "name": s.name,
            "phone": s.phone,
            "address": s.address,
            "bankAccountNo": s.bankAccountNo,
            "bankCode": s.bankCode,
            "isActive": s.isActive,
            "createdAt": s.createdAt
        }
        for s in staff_list
    ]


@router.post("/staff", response_model=StaffResponse)
async def create_staff(
    staff_data: StaffCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new staff"""
    # Check if staffId (guardId) already exists
    result = await db.execute(select(Staff).where(Staff.staffId == staff_data.guardId))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Staff ID already exists")
    
    new_staff = Staff(
        staffId=staff_data.guardId,
        name=staff_data.name,
        phone=staff_data.phone,
        address=staff_data.address,
        bankAccountNo=staff_data.bankAccountNo,
        bankCode=staff_data.bankCode,
        isActive=staff_data.isActive
    )
    
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    
    return {
        "id": str(new_staff.id),
        "guardId": new_staff.staffId,
        "name": new_staff.name,
        "phone": new_staff.phone,
        "address": new_staff.address,
        "bankAccountNo": new_staff.bankAccountNo,
        "bankCode": new_staff.bankCode,
        "isActive": new_staff.isActive,
        "createdAt": new_staff.createdAt
    }


@router.get("/staff/{staff_id}", response_model=StaffResponse)
async def get_staff_member(
    staff_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get staff by ID"""
    try:
        sid = int(staff_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid staff ID")
        
    result = await db.execute(select(Staff).where(Staff.id == sid))
    staff = result.scalar_one_or_none()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    return {
        "id": str(staff.id),
        "guardId": staff.staffId,
        "name": staff.name,
        "phone": staff.phone,
        "address": staff.address,
        "bankAccountNo": staff.bankAccountNo,
        "bankCode": staff.bankCode,
        "isActive": staff.isActive,
        "createdAt": staff.createdAt
    }


@router.put("/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: str,
    staff_data: StaffUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update staff"""
    try:
        sid = int(staff_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid staff ID")
        
    result = await db.execute(select(Staff).where(Staff.id == sid))
    staff = result.scalar_one_or_none()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    if staff_data.name is not None:
        staff.name = staff_data.name
    if staff_data.phone is not None:
        staff.phone = staff_data.phone
    if staff_data.address is not None:
        staff.address = staff_data.address
    if staff_data.bankAccountNo is not None:
        staff.bankAccountNo = staff_data.bankAccountNo
    if staff_data.bankCode is not None:
        staff.bankCode = staff_data.bankCode
    if staff_data.isActive is not None:
        staff.isActive = staff_data.isActive
        
    await db.commit()
    await db.refresh(staff)
    
    return {
        "id": str(staff.id),
        "guardId": staff.staffId,
        "name": staff.name,
        "phone": staff.phone,
        "address": staff.address,
        "bankAccountNo": staff.bankAccountNo,
        "bankCode": staff.bankCode,
        "isActive": staff.isActive,
        "createdAt": staff.createdAt
    }


@router.delete("/staff/{staff_id}")
async def delete_staff(
    staff_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete staff"""
    try:
        sid = int(staff_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid staff ID")
        
    result = await db.execute(select(Staff).where(Staff.id == sid))
    staff = result.scalar_one_or_none()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    await db.delete(staff)
    await db.commit()
    
    return {"message": "Staff deleted successfully"}


# ========== BANK ENDPOINTS ==========

@router.get("/banks", response_model=List[BankResponse])
async def get_banks(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all banks"""
    result = await db.execute(select(Bank).order_by(Bank.id))
    banks = result.scalars().all()
    
    return [
        {
            "id": str(b.id),
            "code": b.code,
            "name": b.name,
            "shortNameEN": b.shortNameEN
        }
        for b in banks
    ]


@router.post("/banks", response_model=BankResponse)
async def create_bank(
    bank_data: BankCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new bank"""
    # Check if code already exists
    result = await db.execute(select(Bank).where(Bank.code == bank_data.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bank code already exists")
    
    new_bank = Bank(
        code=bank_data.code,
        name=bank_data.name,
        shortNameEN=bank_data.shortNameEN
    )
    
    db.add(new_bank)
    await db.commit()
    await db.refresh(new_bank)
    
    return {
        "id": str(new_bank.id),
        "code": new_bank.code,
        "name": new_bank.name,
        "shortNameEN": new_bank.shortNameEN
    }


@router.get("/banks/{bank_id}", response_model=BankResponse)
async def get_bank(
    bank_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bank by ID"""
    try:
        bid = int(bank_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid bank ID")
        
    result = await db.execute(select(Bank).where(Bank.id == bid))
    bank = result.scalar_one_or_none()
    
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    return {
        "id": str(bank.id),
        "code": bank.code,
        "name": bank.name,
        "shortNameEN": bank.shortNameEN
    }


@router.put("/banks/{bank_id}", response_model=BankResponse)
async def update_bank(
    bank_id: str,
    bank_data: BankUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update bank"""
    try:
        bid = int(bank_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid bank ID")
        
    result = await db.execute(select(Bank).where(Bank.id == bid))
    bank = result.scalar_one_or_none()
    
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    
    if bank_data.name is not None:
        bank.name = bank_data.name
    if bank_data.shortNameEN is not None:
        bank.shortNameEN = bank_data.shortNameEN
        
    await db.commit()
    await db.refresh(bank)
    
    return {
        "id": str(bank.id),
        "code": bank.code,
        "name": bank.name,
        "shortNameEN": bank.shortNameEN
    }


@router.delete("/banks/{bank_id}")
async def delete_bank(
    bank_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete bank"""
    try:
        bid = int(bank_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid bank ID")
        
    result = await db.execute(select(Bank).where(Bank.id == bid))
    bank = result.scalar_one_or_none()
    
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
        
    await db.delete(bank)
    await db.commit()
    
    return {"message": "Bank deleted successfully"}

# ========== PRODUCT ENDPOINTS ==========

@router.get("/products", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).order_by(Product.code))
    return [
        {"id": str(p.id), "code": p.code, "name": p.name, "category": p.category, "price": p.price, "isActive": p.isActive, "createdAt": p.createdAt}
        for p in result.scalars().all()
    ]

@router.post("/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate code
    existing = await db.execute(select(Product).where(Product.code == product_data.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="รหัสสินค้าซ้ำ")
        
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return {"id": str(new_product.id), "code": new_product.code, "name": new_product.name, "category": new_product.category, "price": new_product.price, "isActive": new_product.isActive, "createdAt": new_product.createdAt}

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    try:
        pid = int(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.execute(select(Product).where(Product.id == pid))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
        
    await db.commit()
    await db.refresh(product)
    return {"id": str(product.id), "code": product.code, "name": product.name, "category": product.category, "price": product.price, "isActive": product.isActive, "createdAt": product.createdAt}

@router.delete("/products/{product_id}")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    try:
        pid = int(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.execute(select(Product).where(Product.id == pid))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted"}

# ========== SERVICE ENDPOINTS ==========

@router.get("/services", response_model=List[ServiceResponse])
async def get_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).order_by(Service.id))
    return [{"id": str(s.id), "name": s.name, "isActive": s.isActive, "createdAt": s.createdAt} for s in result.scalars().all()]

@router.post("/services", response_model=ServiceResponse)
async def create_service(service_data: ServiceCreate, db: AsyncSession = Depends(get_db)):
    new_service = Service(**service_data.model_dump())
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    return {"id": str(new_service.id), "name": new_service.name, "isActive": new_service.isActive, "createdAt": new_service.createdAt}

@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(service_id: str, service_data: ServiceUpdate, db: AsyncSession = Depends(get_db)):
    try:
        sid = int(service_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.execute(select(Service).where(Service.id == sid))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    for key, value in service_data.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
        
    await db.commit()
    await db.refresh(service)
    return {"id": str(service.id), "name": service.name, "isActive": service.isActive, "createdAt": service.createdAt}

@router.delete("/services/{service_id}")
async def delete_service(service_id: str, db: AsyncSession = Depends(get_db)):
    try:
        sid = int(service_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.execute(select(Service).where(Service.id == sid))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    await db.delete(service)
    await db.commit()
    return {"message": "Service deleted"}