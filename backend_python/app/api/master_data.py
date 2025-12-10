from fastapi import APIRouter, HTTPException, Depends, UploadFile, File # type: ignore
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

@router.get("/customers/template")
async def download_customer_template(
    current_user: User = Depends(get_current_active_user)
):
    """Download Excel template for customer import"""
    template_path = "templates/customer_template.xlsx"
    
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template file not found")
    
    return FileResponse(
        path=template_path,
        filename="customer_template.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.get("/customers", response_model=List[CustomerResponse])
async def get_customers(  # type: ignore
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
            "businessType": c.businessType if hasattr(c, 'businessType') else None,
            "name": c.name,
            "taxId": c.taxId if hasattr(c, 'taxId') else None,
            "address": c.address,
            "subDistrict": c.subDistrict if hasattr(c, 'subDistrict') else None,
            "district": c.district if hasattr(c, 'district') else None,
            "province": c.province if hasattr(c, 'province') else None,
            "postalCode": c.postalCode if hasattr(c, 'postalCode') else None,
            "contactPerson": c.contactPerson,
            "phone": c.phone,
            "email": c.email,
            "secondaryContact": c.secondaryContact if hasattr(c, 'secondaryContact') else None,
            "paymentTerms": c.paymentTerms if hasattr(c, 'paymentTerms') else None,
            "isActive": c.isActive,
            "createdAt": c.createdAt
        }
        for c in customers
    ] # type: ignore


@router.post("/customers", response_model=CustomerResponse)
async def create_customer( # type: ignore
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
        businessType=customer_data.businessType,
        name=customer_data.name,
        taxId=customer_data.taxId,
        address=customer_data.address,
        subDistrict=customer_data.subDistrict,
        district=customer_data.district,
        province=customer_data.province,
        postalCode=customer_data.postalCode,
        contactPerson=customer_data.contactPerson,
        phone=customer_data.phone,
        email=customer_data.email,
        secondaryContact=customer_data.secondaryContact,
        paymentTerms=customer_data.paymentTerms,
        isActive=customer_data.isActive
    )
    
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)
    
    return {
        "id": str(new_customer.id),
        "code": new_customer.code,
        "businessType": new_customer.businessType,
        "name": new_customer.name,
        "taxId": new_customer.taxId,
        "address": new_customer.address,
        "subDistrict": new_customer.subDistrict,
        "district": new_customer.district,
        "province": new_customer.province,
        "postalCode": new_customer.postalCode,
        "contactPerson": new_customer.contactPerson,
        "phone": new_customer.phone,
        "email": new_customer.email,
        "secondaryContact": new_customer.secondaryContact,
        "paymentTerms": new_customer.paymentTerms,
        "isActive": new_customer.isActive,
        "createdAt": new_customer.createdAt
    } # type: ignore


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(  # type: ignore
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
        "businessType": customer.businessType if hasattr(customer, 'businessType') else None,
        "name": customer.name,
        "taxId": customer.taxId if hasattr(customer, 'taxId') else None,
        "address": customer.address,
        "subDistrict": customer.subDistrict if hasattr(customer, 'subDistrict') else None,
        "district": customer.district if hasattr(customer, 'district') else None,
        "province": customer.province if hasattr(customer, 'province') else None,
        "postalCode": customer.postalCode if hasattr(customer, 'postalCode') else None,
        "contactPerson": customer.contactPerson,
        "phone": customer.phone,
        "email": customer.email,
        "secondaryContact": customer.secondaryContact if hasattr(customer, 'secondaryContact') else None,
        "paymentTerms": customer.paymentTerms if hasattr(customer, 'paymentTerms') else None,
        "isActive": customer.isActive,
        "createdAt": customer.createdAt
    } # type: ignore


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(  # type: ignore
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
        customer.code = customer_data.code  # type: ignore[assignment]

    if customer_data.businessType is not None:
        customer.businessType = customer_data.businessType  # type: ignore[assignment]
    if customer_data.name is not None:
        customer.name = customer_data.name  # type: ignore[assignment]
    if customer_data.taxId is not None:
        customer.taxId = customer_data.taxId  # type: ignore[assignment]
    if customer_data.contactPerson is not None:
        customer.contactPerson = customer_data.contactPerson  # type: ignore[assignment]
    if customer_data.phone is not None:
        customer.phone = customer_data.phone  # type: ignore[assignment]
    if customer_data.email is not None:
        customer.email = customer_data.email  # type: ignore[assignment]
    if customer_data.address is not None:
        customer.address = customer_data.address  # type: ignore[assignment]
    if customer_data.subDistrict is not None:
        customer.subDistrict = customer_data.subDistrict  # type: ignore[assignment]
    if customer_data.district is not None:
        customer.district = customer_data.district  # type: ignore[assignment]
    if customer_data.province is not None:
        customer.province = customer_data.province  # type: ignore[assignment]
    if customer_data.postalCode is not None:
        customer.postalCode = customer_data.postalCode  # type: ignore[assignment]
    if customer_data.secondaryContact is not None:
        customer.secondaryContact = customer_data.secondaryContact  # type: ignore[assignment]
    if customer_data.paymentTerms is not None:
        customer.paymentTerms = customer_data.paymentTerms  # type: ignore[assignment]
    if customer_data.isActive is not None:
        customer.isActive = customer_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(customer)
    
    return {
        "id": str(customer.id),
        "code": customer.code,
        "businessType": customer.businessType if hasattr(customer, 'businessType') else None,
        "name": customer.name,
        "taxId": customer.taxId if hasattr(customer, 'taxId') else None,
        "address": customer.address,
        "subDistrict": customer.subDistrict if hasattr(customer, 'subDistrict') else None,
        "district": customer.district if hasattr(customer, 'district') else None,
        "province": customer.province if hasattr(customer, 'province') else None,
        "postalCode": customer.postalCode if hasattr(customer, 'postalCode') else None,
        "contactPerson": customer.contactPerson,
        "phone": customer.phone,
        "email": customer.email,
        "secondaryContact": customer.secondaryContact if hasattr(customer, 'secondaryContact') else None,
        "paymentTerms": customer.paymentTerms if hasattr(customer, 'paymentTerms') else None,
        "isActive": customer.isActive,
        "createdAt": customer.createdAt
    } # type: ignore


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


@router.post("/customers/import")
async def import_customers_from_excel(  # type: ignore
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Import customers from Excel file"""
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls')):  # type: ignore[union-attr]
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ Excel (.xlsx หรือ .xls)")
    
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))  # type: ignore[call-overload]
        
        # Expected columns (Thai)
        expected_columns = [
            'รหัสลูกค้า', 'ประเภทธุรกิจ', 'ชื่อลูกค้า', 'เลขประจำตัวผู้เสียภาษี',
            'ที่อยู่', 'แขวง/ตำบล', 'เขต/อำเภอ', 'จังหวัด', 'รหัสไปรษณีย์',
            'ชื่อผู้ติดต่อหลัก', 'เบอร์โทร', 'อีเมล',
            'ผู้ติดต่อรอง', 'เงื่อนไขการชำระเงิน'
        ]
        
        # Check columns
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"ไฟล์ขาดคอลัมน์: {', '.join(missing_columns)}"
            )
        
        success_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                code = str(row['รหัสลูกค้า']).strip()
                
                # Skip empty rows
                if not code or code == 'nan':
                    continue
                
                # Validate code format
                if not re.match(r'^[\w\-]+$', code):
                    errors.append(f"แถว {int(index) + 2}: รหัสลูกค้า '{code}' ไม่ถูกต้อง (ใช้ได้เฉพาะ A-Z, 0-9, - และ _)")  # type: ignore[arg-type]
                    error_count += 1
                    continue
                
                # Check if customer already exists
                result = await db.execute(select(Customer).where(Customer.code == code))
                existing = result.scalar_one_or_none()
                
                if existing:
                    errors.append(f"แถว {int(index) + 2}: รหัสลูกค้า '{code}' มีอยู่แล้วในระบบ")  # type: ignore[arg-type]
                    error_count += 1
                    continue
                
                # Get business type
                business_type = str(row['ประเภทธุรกิจ']).strip() if pd.notna(row['ประเภทธุรกิจ']) else ""
                
                # Create new customer
                new_customer = Customer(
                    code=code,
                    businessType=business_type if business_type else None,
                    name=str(row['ชื่อลูกค้า']).strip(),
                    taxId=str(row['เลขประจำตัวผู้เสียภาษี']).strip() if pd.notna(row['เลขประจำตัวผู้เสียภาษี']) else None,
                    address=str(row['ที่อยู่']).strip() if pd.notna(row['ที่อยู่']) else None,
                    subDistrict=str(row['แขวง/ตำบล']).strip() if pd.notna(row['แขวง/ตำบล']) else None,
                    district=str(row['เขต/อำเภอ']).strip() if pd.notna(row['เขต/อำเภอ']) else None,
                    province=str(row['จังหวัด']).strip() if pd.notna(row['จังหวัด']) else None,
                    postalCode=str(row['รหัสไปรษณีย์']).strip() if pd.notna(row['รหัสไปรษณีย์']) else None,
                    contactPerson=str(row['ชื่อผู้ติดต่อหลัก']).strip() if pd.notna(row['ชื่อผู้ติดต่อหลัก']) else None,
                    phone=str(row['เบอร์โทร']).strip() if pd.notna(row['เบอร์โทร']) else None,
                    email=str(row['อีเมล']).strip() if pd.notna(row['อีเมล']) else None,
                    secondaryContact=str(row['ผู้ติดต่อรอง']).strip() if pd.notna(row['ผู้ติดต่อรอง']) else None,
                    paymentTerms=str(row['เงื่อนไขการชำระเงิน']).strip() if pd.notna(row['เงื่อนไขการชำระเงิน']) else None,
                    isActive=True
                )
                
                db.add(new_customer)
                success_count += 1
                
            except Exception as e:
                errors.append(f"แถว {int(index) + 2}: {str(e)}")  # type: ignore[arg-type]
                error_count += 1
        
        # Commit all changes
        if success_count > 0:
            await db.commit()
        
        return {
            "success": True,
            "message": f"Import สำเร็จ {success_count} รายการ, ล้มเหลว {error_count} รายการ",
            "successCount": success_count,
            "errorCount": error_count,
            "errors": errors[:10]  # Return first 10 errors only
        } # type: ignore
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")


# ========== SITE ENDPOINTS ==========

@router.get("/sites", response_model=List[SiteResponse])
async def get_sites(  # type: ignore
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
        result_list.append({ # type: ignore
            "id": str(site.id),
            "siteCode": site.siteCode if hasattr(site, 'siteCode') else "",
            "name": site.name,
            "customerId": str(site.customerId) if site.customerId else "",  # type: ignore[arg-type]
            "customerCode": site.customerCode if hasattr(site, 'customerCode') else (customer.code if customer else None),
            "customerName": site.customerName if hasattr(site, 'customerName') else (customer.name if customer else None),
            "contractStartDate": site.contractStartDate.isoformat() if hasattr(site, 'contractStartDate') and site.contractStartDate else None,  # type: ignore[arg-type]
            "contractEndDate": site.contractEndDate.isoformat() if hasattr(site, 'contractEndDate') and site.contractEndDate else None,  # type: ignore[arg-type]
            "address": site.address,
            "subDistrict": site.subDistrict if hasattr(site, 'subDistrict') else None,
            "district": site.district if hasattr(site, 'district') else None,
            "province": site.province if hasattr(site, 'province') else None,
            "postalCode": site.postalCode if hasattr(site, 'postalCode') else None,
            "contactPerson": site.contactPerson,
            "phone": site.phone,
            "employmentDetails": json.loads(site.employmentDetails) if hasattr(site, 'employmentDetails') and site.employmentDetails else [],  # type: ignore[arg-type]
            "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],  # type: ignore[arg-type]
            "isActive": site.isActive,
            "createdAt": site.createdAt
        })
    
    return result_list # type: ignore


@router.get("/sites/next-code/{customer_id}")
async def get_next_site_code(  # type: ignore
    customer_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate next site code for a customer (e.g., C001.01, C001.02)"""
    try:
        cid = int(customer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    
    # Get customer
    result = await db.execute(select(Customer).where(Customer.id == cid))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Count existing sites for this customer
    result = await db.execute(
        select(Site).where(Site.customerId == cid)
    )
    sites = result.scalars().all()
    
    # Generate next code: customerCode.XX (e.g., C001.01, C001.02)
    next_number = len(sites) + 1
    next_code = f"{customer.code}.{next_number:02d}"
    
    return {"nextCode": next_code}


@router.post("/sites", response_model=SiteResponse)
async def create_site(  # type: ignore
    site_data: SiteCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new site"""
    # Check duplicate siteCode
    result = await db.execute(select(Site).where(Site.siteCode == site_data.siteCode))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="รหัสหน่วยงานซ้ำ (Site Code already exists)")
    
    # Verify customer exists
    try:
        cid = int(site_data.customerId)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
        
    result = await db.execute(select(Customer).where(Customer.id == cid))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Parse dates
    from datetime import datetime
    contract_start = None
    contract_end = None
    if site_data.contractStartDate:
        try:
            contract_start = datetime.fromisoformat(site_data.contractStartDate).date()
        except:
            pass
    if site_data.contractEndDate:
        try:
            contract_end = datetime.fromisoformat(site_data.contractEndDate).date()
        except:
            pass
    
    new_site = Site(
        siteCode=site_data.siteCode,
        name=site_data.name,
        customerId=cid,
        customerCode=customer.code,
        customerName=customer.name,
        contractStartDate=contract_start,
        contractEndDate=contract_end,
        address=site_data.address,
        subDistrict=site_data.subDistrict,
        district=site_data.district,
        province=site_data.province,
        postalCode=site_data.postalCode,
        contactPerson=site_data.contactPerson,
        phone=site_data.phone,
        employmentDetails=json.dumps([d.model_dump() for d in site_data.employmentDetails]) if site_data.employmentDetails else None,
        contractedServices=json.dumps([s.model_dump() for s in site_data.contractedServices]) if site_data.contractedServices else None,
        isActive=site_data.isActive
    )
    
    db.add(new_site)
    await db.commit()
    await db.refresh(new_site)
    
    return {
        "id": str(new_site.id),
        "siteCode": new_site.siteCode,
        "name": new_site.name,
        "customerId": str(new_site.customerId),
        "customerCode": new_site.customerCode,
        "customerName": new_site.customerName,
        "contractStartDate": new_site.contractStartDate.isoformat() if new_site.contractStartDate else None,  # type: ignore[arg-type]
        "contractEndDate": new_site.contractEndDate.isoformat() if new_site.contractEndDate else None,  # type: ignore[arg-type]
        "address": new_site.address,
        "subDistrict": new_site.subDistrict,
        "district": new_site.district,
        "province": new_site.province,
        "postalCode": new_site.postalCode,
        "contactPerson": new_site.contactPerson,
        "phone": new_site.phone,
        "employmentDetails": json.loads(new_site.employmentDetails) if new_site.employmentDetails else [],  # type: ignore[arg-type]
        "contractedServices": json.loads(new_site.contractedServices) if new_site.contractedServices else [],  # type: ignore[arg-type]
        "isActive": new_site.isActive,
        "createdAt": new_site.createdAt
    }


@router.get("/sites/{site_id}", response_model=SiteResponse)
async def get_site( # type: ignore
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
        "siteCode": site.siteCode if hasattr(site, 'siteCode') else "",
        "name": site.name,
        "customerId": str(site.customerId) if site.customerId else "",  # type: ignore[arg-type]
        "customerCode": site.customerCode if hasattr(site, 'customerCode') else (customer.code if customer else None),
        "customerName": site.customerName if hasattr(site, 'customerName') else (customer.name if customer else None),
        "contractStartDate": site.contractStartDate.isoformat() if hasattr(site, 'contractStartDate') and site.contractStartDate else None,  # type: ignore[arg-type]
        "contractEndDate": site.contractEndDate.isoformat() if hasattr(site, 'contractEndDate') and site.contractEndDate else None,  # type: ignore[arg-type]
        "address": site.address,
        "subDistrict": site.subDistrict if hasattr(site, 'subDistrict') else None,
        "district": site.district if hasattr(site, 'district') else None,
        "province": site.province if hasattr(site, 'province') else None,
        "postalCode": site.postalCode if hasattr(site, 'postalCode') else None,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "employmentDetails": json.loads(site.employmentDetails) if hasattr(site, 'employmentDetails') and site.employmentDetails else [],  # type: ignore[arg-type]
        "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],  # type: ignore[arg-type]
        "isActive": site.isActive,
        "createdAt": site.createdAt
    }


@router.put("/sites/{site_id}", response_model=SiteResponse)
async def update_site(  # type: ignore
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
    
    # Check duplicate siteCode if changed
    if site_data.siteCode is not None and site_data.siteCode != site.siteCode:
        result = await db.execute(select(Site).where(Site.siteCode == site_data.siteCode))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="รหัสหน่วยงานซ้ำ (Site Code already exists)")
        site.siteCode = site_data.siteCode  # type: ignore[assignment]
    
    if site_data.name is not None:
        site.name = site_data.name  # type: ignore[assignment]
    if site_data.customerId is not None:
        try:
            cid = int(site_data.customerId)
            result = await db.execute(select(Customer).where(Customer.id == cid))
            customer = result.scalar_one_or_none()
            if not customer:
                raise HTTPException(status_code=404, detail="Customer not found")
            site.customerId = cid  # type: ignore[assignment]
            site.customerCode = customer.code  # type: ignore[assignment]
            site.customerName = customer.name  # type: ignore[assignment]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid customer ID")
    
    if site_data.customerCode is not None:
        site.customerCode = site_data.customerCode  # type: ignore[assignment]
    if site_data.customerName is not None:
        site.customerName = site_data.customerName  # type: ignore[assignment]
    
    # Update contract dates
    if site_data.contractStartDate is not None:
        from datetime import datetime
        try:
            site.contractStartDate = datetime.fromisoformat(site_data.contractStartDate).date()  # type: ignore[assignment]
        except:
            site.contractStartDate = None  # type: ignore[assignment]
    if site_data.contractEndDate is not None:
        from datetime import datetime
        try:
            site.contractEndDate = datetime.fromisoformat(site_data.contractEndDate).date()  # type: ignore[assignment]
        except:
            site.contractEndDate = None  # type: ignore[assignment]
            
    if site_data.address is not None:
        site.address = site_data.address  # type: ignore[assignment]
    if site_data.subDistrict is not None:
        site.subDistrict = site_data.subDistrict  # type: ignore[assignment]
    if site_data.district is not None:
        site.district = site_data.district  # type: ignore[assignment]
    if site_data.province is not None:
        site.province = site_data.province  # type: ignore[assignment]
    if site_data.postalCode is not None:
        site.postalCode = site_data.postalCode  # type: ignore[assignment]
    if site_data.contactPerson is not None:
        site.contactPerson = site_data.contactPerson  # type: ignore[assignment]
    if site_data.phone is not None:
        site.phone = site_data.phone  # type: ignore[assignment]
    if site_data.employmentDetails is not None:
        site.employmentDetails = json.dumps([d.model_dump() for d in site_data.employmentDetails])  # type: ignore[assignment]
    if site_data.contractedServices is not None:
        site.contractedServices = json.dumps([s.model_dump() for s in site_data.contractedServices])  # type: ignore[assignment]
    if site_data.isActive is not None:
        site.isActive = site_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(site)
    
    result = await db.execute(select(Customer).where(Customer.id == site.customerId))
    customer = result.scalar_one_or_none()
    
    return {
        "id": str(site.id),
        "siteCode": site.siteCode if hasattr(site, 'siteCode') else "",
        "name": site.name,
        "customerId": str(site.customerId) if site.customerId else "",  # type: ignore[arg-type]
        "customerCode": site.customerCode if hasattr(site, 'customerCode') else None,
        "customerName": site.customerName if hasattr(site, 'customerName') else (customer.name if customer else None),
        "contractStartDate": site.contractStartDate.isoformat() if hasattr(site, 'contractStartDate') and site.contractStartDate else None,  # type: ignore[arg-type]
        "contractEndDate": site.contractEndDate.isoformat() if hasattr(site, 'contractEndDate') and site.contractEndDate else None,  # type: ignore[arg-type]
        "address": site.address,
        "subDistrict": site.subDistrict if hasattr(site, 'subDistrict') else None,
        "district": site.district if hasattr(site, 'district') else None,
        "province": site.province if hasattr(site, 'province') else None,
        "postalCode": site.postalCode if hasattr(site, 'postalCode') else None,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "employmentDetails": json.loads(site.employmentDetails) if hasattr(site, 'employmentDetails') and site.employmentDetails else [],  # type: ignore[arg-type]
        "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],  # type: ignore[arg-type]
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
async def get_guards(  # type: ignore
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
            "firstName": g.firstName,
            "lastName": g.lastName,
            "phone": g.phone,
            "address": g.address,
            "bankAccountNo": g.bankAccountNo,
            "bankCode": g.bankCode,
            "isActive": g.isActive,
            "createdAt": g.createdAt
        }
        for g in guards
    ] # type: ignore


@router.post("/guards", response_model=GuardResponse)
async def create_guard( # type: ignore
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
        firstName=guard_data.firstName,
        lastName=guard_data.lastName,
        phone=guard_data.phone,
        address=guard_data.address,
        bankAccountNo=guard_data.bankAccountNo,
        bankCode=guard_data.bankCode,
        isActive=guard_data.isActive
    )
    
    db.add(new_guard)
    await db.commit()
    await db.refresh(new_guard)
    
    return {  # type: ignore
        "id": str(new_guard.id),
        "guardId": new_guard.guardId,
        "firstName": new_guard.firstName,
        "lastName": new_guard.lastName,
        "phone": new_guard.phone,
        "address": new_guard.address,
        "bankAccountNo": new_guard.bankAccountNo,
        "bankCode": new_guard.bankCode,
        "isActive": new_guard.isActive,
        "createdAt": new_guard.createdAt
    }


@router.get("/guards/{guard_id}", response_model=GuardResponse)
async def get_guard(  # type: ignore
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
    
    return {  # type: ignore
        "id": str(guard.id),
        "guardId": guard.guardId,
        "firstName": guard.firstName,
        "lastName": guard.lastName,
        "phone": guard.phone,
        "address": guard.address,
        "bankAccountNo": guard.bankAccountNo,
        "bankCode": guard.bankCode,
        "isActive": guard.isActive,
        "createdAt": guard.createdAt
    }


@router.put("/guards/{guard_id}", response_model=GuardResponse)
async def update_guard(  # type: ignore
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
    
    if guard_data.firstName is not None:
        guard.firstName = guard_data.firstName  # type: ignore[assignment]
    if guard_data.lastName is not None:
        guard.lastName = guard_data.lastName  # type: ignore[assignment]
    if guard_data.phone is not None:
        guard.phone = guard_data.phone  # type: ignore[assignment]
    if guard_data.address is not None:
        guard.address = guard_data.address  # type: ignore[assignment]
    if guard_data.bankAccountNo is not None:
        guard.bankAccountNo = guard_data.bankAccountNo  # type: ignore[assignment]
    if guard_data.bankCode is not None:
        guard.bankCode = guard_data.bankCode  # type: ignore[assignment]
    if guard_data.isActive is not None:
        guard.isActive = guard_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(guard)
    
    return {  # type: ignore
        "id": str(guard.id),
        "guardId": guard.guardId,
        "firstName": guard.firstName,
        "lastName": guard.lastName,
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
async def get_staff(  # type: ignore
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all staff"""
    result = await db.execute(select(Staff).order_by(Staff.id))
    staff_list = result.scalars().all()
    
    return [  # type: ignore
        {
            "id": str(s.id),
            "guardId": s.staffId,
            "firstName": s.firstName,
            "lastName": s.lastName,
            "idCardNumber": s.idCardNumber,
            "phone": s.phone,
            "address": s.address,
            "position": s.position,
            "department": s.department,
            "startDate": s.startDate,
            "birthDate": s.birthDate,
            "salary": s.salary,
            "salaryType": s.salaryType,
            "paymentMethod": s.paymentMethod,
            "bankAccountNo": s.bankAccountNo,
            "bankCode": s.bankCode,
            "isActive": s.isActive,
            "createdAt": s.createdAt
        }
        for s in staff_list
    ]


@router.post("/staff", response_model=StaffResponse)
async def create_staff(  # type: ignore
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
        firstName=staff_data.firstName,
        lastName=staff_data.lastName,
        idCardNumber=staff_data.idCardNumber,
        phone=staff_data.phone,
        address=staff_data.address,
        position=staff_data.position,
        department=staff_data.department,
        startDate=staff_data.startDate,
        birthDate=staff_data.birthDate,
        salary=staff_data.salary,
        salaryType=staff_data.salaryType,
        paymentMethod=staff_data.paymentMethod,
        bankAccountNo=staff_data.bankAccountNo,
        bankCode=staff_data.bankCode,
        isActive=staff_data.isActive
    )
    
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    
    return {  # type: ignore
        "id": str(new_staff.id),
        "guardId": new_staff.staffId,
        "firstName": new_staff.firstName,
        "lastName": new_staff.lastName,
        "idCardNumber": new_staff.idCardNumber,
        "phone": new_staff.phone,
        "address": new_staff.address,
        "position": new_staff.position,
        "department": new_staff.department,
        "startDate": new_staff.startDate,
        "birthDate": new_staff.birthDate,
        "salary": new_staff.salary,
        "salaryType": new_staff.salaryType,
        "paymentMethod": new_staff.paymentMethod,
        "bankAccountNo": new_staff.bankAccountNo,
        "bankCode": new_staff.bankCode,
        "isActive": new_staff.isActive,
        "createdAt": new_staff.createdAt
    }


@router.get("/staff/{staff_id}", response_model=StaffResponse)
async def get_staff_member(  # type: ignore
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
    
    return {  # type: ignore
        "id": str(staff.id),
        "guardId": staff.staffId,
        "firstName": staff.firstName,
        "lastName": staff.lastName,
        "idCardNumber": staff.idCardNumber,
        "phone": staff.phone,
        "address": staff.address,
        "position": staff.position,
        "department": staff.department,
        "startDate": staff.startDate,
        "birthDate": staff.birthDate,
        "salary": staff.salary,
        "salaryType": staff.salaryType,
        "paymentMethod": staff.paymentMethod,
        "bankAccountNo": staff.bankAccountNo,
        "bankCode": staff.bankCode,
        "isActive": staff.isActive,
        "createdAt": staff.createdAt
    }


@router.put("/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(  # type: ignore
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
    
    if staff_data.firstName is not None:
        staff.firstName = staff_data.firstName  # type: ignore[assignment]
    if staff_data.lastName is not None:
        staff.lastName = staff_data.lastName  # type: ignore[assignment]
    if staff_data.idCardNumber is not None:
        staff.idCardNumber = staff_data.idCardNumber  # type: ignore[assignment]
    if staff_data.phone is not None:
        staff.phone = staff_data.phone  # type: ignore[assignment]
    if staff_data.address is not None:
        staff.address = staff_data.address  # type: ignore[assignment]
    if staff_data.position is not None:
        staff.position = staff_data.position  # type: ignore[assignment]
    if staff_data.department is not None:
        staff.department = staff_data.department  # type: ignore[assignment]
    if staff_data.startDate is not None:
        staff.startDate = staff_data.startDate  # type: ignore[assignment]
    if staff_data.birthDate is not None:
        staff.birthDate = staff_data.birthDate  # type: ignore[assignment]
    if staff_data.salary is not None:
        staff.salary = staff_data.salary  # type: ignore[assignment]
    if staff_data.salaryType is not None:
        staff.salaryType = staff_data.salaryType  # type: ignore[assignment]
    if staff_data.paymentMethod is not None:
        staff.paymentMethod = staff_data.paymentMethod  # type: ignore[assignment]
    if staff_data.bankAccountNo is not None:
        staff.bankAccountNo = staff_data.bankAccountNo  # type: ignore[assignment]
    if staff_data.bankCode is not None:
        staff.bankCode = staff_data.bankCode  # type: ignore[assignment]
    if staff_data.isActive is not None:
        staff.isActive = staff_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(staff)
    
    return {  # type: ignore
        "id": str(staff.id),
        "guardId": staff.staffId,
        "firstName": staff.firstName,
        "lastName": staff.lastName,
        "idCardNumber": staff.idCardNumber,
        "phone": staff.phone,
        "address": staff.address,
        "position": staff.position,
        "department": staff.department,
        "startDate": staff.startDate,
        "birthDate": staff.birthDate,
        "salary": staff.salary,
        "salaryType": staff.salaryType,
        "paymentMethod": staff.paymentMethod,
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
async def get_banks(  # type: ignore
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all banks"""
    result = await db.execute(select(Bank).order_by(Bank.id))
    banks = result.scalars().all()
    
    return [  # type: ignore
        {
            "id": str(b.id),
            "code": b.code,
            "name": b.name,
            "shortNameEN": b.shortNameEN
        }
        for b in banks
    ]


@router.post("/banks", response_model=BankResponse)
async def create_bank(  # type: ignore
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
    
    return {  # type: ignore
        "id": str(new_bank.id),
        "code": new_bank.code,
        "name": new_bank.name,
        "shortNameEN": new_bank.shortNameEN
    }


@router.get("/banks/{bank_id}", response_model=BankResponse)
async def get_bank(  # type: ignore
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
    
    return {  # type: ignore
        "id": str(bank.id),
        "code": bank.code,
        "name": bank.name,
        "shortNameEN": bank.shortNameEN
    }


@router.put("/banks/{bank_id}", response_model=BankResponse)
async def update_bank(  # type: ignore
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
        bank.name = bank_data.name  # type: ignore[assignment]
    if bank_data.shortNameEN is not None:
        bank.shortNameEN = bank_data.shortNameEN  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(bank)
    
    return {  # type: ignore
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
async def get_products(db: AsyncSession = Depends(get_db)):  # type: ignore
    result = await db.execute(select(Product).order_by(Product.code))
    return [  # type: ignore
        {"id": str(p.id), "code": p.code, "name": p.name, "category": p.category, "price": p.price, "isActive": p.isActive, "createdAt": p.createdAt}  # type: ignore
        for p in result.scalars().all()
    ]

@router.post("/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, db: AsyncSession = Depends(get_db)):  # type: ignore
    # Check duplicate code
    existing = await db.execute(select(Product).where(Product.code == product_data.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="รหัสสินค้าซ้ำ")
        
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return {"id": str(new_product.id), "code": new_product.code, "name": new_product.name, "category": new_product.category, "price": new_product.price, "isActive": new_product.isActive, "createdAt": new_product.createdAt}  # type: ignore

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductUpdate, db: AsyncSession = Depends(get_db)):  # type: ignore
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
    return {"id": str(product.id), "code": product.code, "name": product.name, "category": product.category, "price": product.price, "isActive": product.isActive, "createdAt": product.createdAt}  # type: ignore

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
async def get_services(db: AsyncSession = Depends(get_db)):  # type: ignore
    result = await db.execute(select(Service).order_by(Service.id))
    return [{
        "id": str(s.id),
        "serviceCode": s.serviceCode if hasattr(s, 'serviceCode') else f"SVC-{s.id:03d}",
        "serviceName": s.serviceName if hasattr(s, 'serviceName') else s.name,
        "remarks": s.remarks if hasattr(s, 'remarks') else None,
        "hiringRate": s.hiringRate if hasattr(s, 'hiringRate') else 0.0,
        "diligenceBonus": s.diligenceBonus if hasattr(s, 'diligenceBonus') else 0.0,
        "sevenDayBonus": s.sevenDayBonus if hasattr(s, 'sevenDayBonus') else 0.0,
        "pointBonus": s.pointBonus if hasattr(s, 'pointBonus') else 0.0,
        "isActive": s.isActive,
        "createdAt": s.createdAt
    } for s in result.scalars().all()]  # type: ignore

@router.post("/services", response_model=ServiceResponse)
async def create_service(service_data: ServiceCreate, db: AsyncSession = Depends(get_db)):  # type: ignore
    # Check for duplicate serviceCode
    result = await db.execute(select(Service).where(Service.serviceCode == service_data.serviceCode))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="รหัสบริการซ้ำ")
    new_service = Service(
        serviceCode=service_data.serviceCode,
        serviceName=service_data.serviceName,
        name=service_data.serviceName,  # Keep for backward compatibility
        remarks=service_data.remarks,
        hiringRate=service_data.hiringRate,
        diligenceBonus=service_data.diligenceBonus,
        sevenDayBonus=service_data.sevenDayBonus,
        pointBonus=service_data.pointBonus,
        isActive=service_data.isActive
    )
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    return {
        "id": str(new_service.id),
        "serviceCode": new_service.serviceCode,
        "serviceName": new_service.serviceName,
        "remarks": new_service.remarks,
        "hiringRate": new_service.hiringRate,
        "diligenceBonus": new_service.diligenceBonus,
        "sevenDayBonus": new_service.sevenDayBonus,
        "pointBonus": new_service.pointBonus,
        "isActive": new_service.isActive,
        "createdAt": new_service.createdAt
    }  # type: ignore

@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(service_id: str, service_data: ServiceUpdate, db: AsyncSession = Depends(get_db)):  # type: ignore
    try:
        sid = int(service_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.execute(select(Service).where(Service.id == sid))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check for duplicate serviceCode if changing
    if service_data.serviceCode and service_data.serviceCode != service.serviceCode:
        existing = await db.execute(select(Service).where(Service.serviceCode == service_data.serviceCode))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="รหัสบริการซ้ำ")
        
    # Update fields
    if service_data.serviceCode is not None:
        service.serviceCode = service_data.serviceCode  # type: ignore[assignment]
    if service_data.serviceName is not None:
        service.serviceName = service_data.serviceName  # type: ignore[assignment]
        service.name = service_data.serviceName  # type: ignore[assignment]
    if service_data.remarks is not None:
        service.remarks = service_data.remarks  # type: ignore[assignment]
    if service_data.hiringRate is not None:
        service.hiringRate = service_data.hiringRate  # type: ignore[assignment]
    if service_data.diligenceBonus is not None:
        service.diligenceBonus = service_data.diligenceBonus  # type: ignore[assignment]
    if service_data.sevenDayBonus is not None:
        service.sevenDayBonus = service_data.sevenDayBonus  # type: ignore[assignment]
    if service_data.pointBonus is not None:
        service.pointBonus = service_data.pointBonus  # type: ignore[assignment]
    if service_data.isActive is not None:
        service.isActive = service_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(service)
    return {
        "id": str(service.id),
        "serviceCode": service.serviceCode,
        "serviceName": service.serviceName,
        "remarks": service.remarks,
        "hiringRate": service.hiringRate,
        "diligenceBonus": service.diligenceBonus,
        "sevenDayBonus": service.sevenDayBonus,
        "pointBonus": service.pointBonus,
        "isActive": service.isActive,
        "createdAt": service.createdAt
    }  # type: ignore

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