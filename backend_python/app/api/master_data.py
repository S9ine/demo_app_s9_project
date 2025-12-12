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
    ServiceCreate, ServiceUpdate, ServiceResponse,
    ShiftCreate, ShiftUpdate, ShiftResponse
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
from app.models.shift import Shift
from app.models.schedule import Schedule
from app.api.audit_logs import create_audit_log
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

@router.get("/guards/template")
async def download_guard_template(
    current_user: User = Depends(get_current_active_user)
):
    """Download Excel template for guard import"""
    template_path = "templates/guard_template.xlsx"
    
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template file not found")
    
    return FileResponse(
        path=template_path,
        filename="guard_template.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/staff/template")
async def download_staff_template(
    current_user: User = Depends(get_current_active_user)
):
    """Download Excel template for staff import"""
    template_path = "templates/staff_template.xlsx"
    
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template file not found")
    
    return FileResponse(
        path=template_path,
        filename="staff_template.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/sites/template")
async def download_site_template(
    current_user: User = Depends(get_current_active_user)
):
    """Download Excel template for site import"""
    template_path = "templates/site_template.xlsx"
    
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template file not found")
    
    return FileResponse(
        path=template_path,
        filename="site_template.xlsx",
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
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="CREATE",
        entity_type="customers",
        entity_id=str(new_customer.id),
        entity_name=new_customer.name,
        description=f"สร้างลูกค้าใหม่: {new_customer.code} - {new_customer.name}",
        new_data={
            "code": new_customer.code,
            "name": new_customer.name,
            "businessType": new_customer.businessType,
            "phone": new_customer.phone,
            "email": new_customer.email
        }
    )
    
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
    
    # Store old data for audit
    old_data = {
        "code": customer.code,
        "name": customer.name,
        "businessType": customer.businessType,
        "phone": customer.phone,
        "email": customer.email,
        "isActive": customer.isActive
    }
    changes = []
    
    if customer_data.code is not None:
        # Check duplicate if code is changing
        if customer_data.code != customer.code:
            existing = await db.execute(select(Customer).where(Customer.code == customer_data.code))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="รหัสลูกค้าซ้ำ")
            changes.append("code")
        customer.code = customer_data.code  # type: ignore[assignment]

    if customer_data.businessType is not None:
        if customer_data.businessType != customer.businessType:
            changes.append("businessType")
        customer.businessType = customer_data.businessType  # type: ignore[assignment]
    if customer_data.name is not None:
        if customer_data.name != customer.name:
            changes.append("name")
        customer.name = customer_data.name  # type: ignore[assignment]
    if customer_data.taxId is not None:
        if customer_data.taxId != customer.taxId:
            changes.append("taxId")
        customer.taxId = customer_data.taxId  # type: ignore[assignment]
    if customer_data.contactPerson is not None:
        if customer_data.contactPerson != customer.contactPerson:
            changes.append("contactPerson")
        customer.contactPerson = customer_data.contactPerson  # type: ignore[assignment]
    if customer_data.phone is not None:
        if customer_data.phone != customer.phone:
            changes.append("phone")
        customer.phone = customer_data.phone  # type: ignore[assignment]
    if customer_data.email is not None:
        if customer_data.email != customer.email:
            changes.append("email")
        customer.email = customer_data.email  # type: ignore[assignment]
    if customer_data.address is not None:
        if customer_data.address != customer.address:
            changes.append("address")
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
        if customer_data.isActive != customer.isActive:
            changes.append("isActive")
        customer.isActive = customer_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(customer)
    
    # Create audit log if there are changes
    if changes:
        await create_audit_log(
            db=db,
            current_user=current_user,
            action="UPDATE",
            entity_type="customers",
            entity_id=str(customer.id),
            entity_name=customer.name,
            description=f"แก้ไขข้อมูลลูกค้า: {customer.code} - {customer.name}",
            old_data=old_data,
            new_data={
                "code": customer.code,
                "name": customer.name,
                "businessType": customer.businessType,
                "phone": customer.phone,
                "email": customer.email,
                "isActive": customer.isActive
            },
            changes=changes
        )
    
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
    
    # Store data for audit before deletion
    customer_code = customer.code
    customer_name = customer.name
    customer_data = {
        "code": customer.code,
        "name": customer.name,
        "businessType": customer.businessType,
        "phone": customer.phone,
        "email": customer.email
    }
        
    await db.delete(customer)
    await db.commit()
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="DELETE",
        entity_type="customers",
        entity_id=str(cid),
        entity_name=customer_name,
        description=f"ลบลูกค้า: {customer_code} - {customer_name}",
        old_data=customer_data
    )
    
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


# ========== GUARD ENDPOINTS ==========

@router.post("/guards/import")
async def import_guards_from_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Import guards from Excel file with auto-generated IDs"""
    if not file.filename.endswith(('.xlsx', '.xls')):  # type: ignore[union-attr]
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ Excel (.xlsx หรือ .xls)")
    
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))  # type: ignore[call-overload]
        
        # Updated: รหัสพนักงาน is now optional - will be auto-generated
        expected_columns = [
            'ชื่อ', 'นามสกุล', 'เบอร์โทร', 'ที่อยู่',
            'เลขบัญชี', 'รหัสธนาคาร', 'สถานะ'
        ]
        
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"ไฟล์ขาดคอลัมน์: {', '.join(missing_columns)}"
            )
        
        # Get the latest guard ID once at the start
        result = await db.execute(
            select(Guard.guardId)
            .where(Guard.guardId.like('PG-%'))
            .order_by(Guard.guardId.desc())
            .limit(1)
        )
        last_guard_id = result.scalar_one_or_none()
        
        if last_guard_id:
            try:
                next_num = int(last_guard_id.split('-')[1]) + 1
            except (IndexError, ValueError):
                next_num = 1
        else:
            next_num = 1
        
        success_count = 0
        skipped_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Skip empty rows
                first_name = str(row['ชื่อ']).strip() if pd.notna(row['ชื่อ']) else None
                if not first_name or first_name == 'nan':
                    continue
                
                # Auto-generate guard ID
                new_guard_id = f"PG-{next_num:04d}"
                next_num += 1
                
                # Parse status
                status_str = str(row['สถานะ']).strip().lower() if pd.notna(row['สถานะ']) else 'active'
                is_active = status_str in ['active', 'ใช้งาน', 'เปิด', '1', 'true']
                
                new_guard = Guard(
                    guardId=new_guard_id,
                    firstName=first_name,
                    lastName=str(row['นามสกุล']).strip(),
                    phone=str(row['เบอร์โทร']).strip() if pd.notna(row['เบอร์โทร']) else None,
                    address=str(row['ที่อยู่']).strip() if pd.notna(row['ที่อยู่']) else None,
                    bankAccountNo=str(row['เลขบัญชี']).strip() if pd.notna(row['เลขบัญชี']) else None,
                    bankCode=str(row['รหัสธนาคาร']).strip() if pd.notna(row['รหัสธนาคาร']) else None,
                    isActive=is_active
                )
                
                db.add(new_guard)
                success_count += 1
                
            except Exception as e:
                errors.append(f"แถว {int(index) + 2}: {str(e)}")  # type: ignore[arg-type]
                error_count += 1
        
        if success_count > 0:
            await db.commit()
        
        return {
            "success": True,
            "imported": success_count,
            "skipped": skipped_count,
            "errors": error_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")


@router.post("/staff/import")
async def import_staff_from_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Import staff from Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls')):  # type: ignore[union-attr]
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ Excel (.xlsx หรือ .xls)")
    
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))  # type: ignore[call-overload]
        
        expected_columns = [
            'รหัสพนักงาน', 'ชื่อ', 'นามสกุล', 'เลขบัตรประชาชน', 'เบอร์โทร', 'ที่อยู่',
            'ตำแหน่ง', 'แผนก', 'วันเกิด', 'วันเริ่มงาน', 'เงินเดือน', 'ประเภทเงินเดือน',
            'วิธีรับเงิน', 'เลขบัญชี', 'รหัสธนาคาร', 'สถานะ'
        ]
        
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"ไฟล์ขาดคอลัมน์: {', '.join(missing_columns)}"
            )
        
        success_count = 0
        skipped_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                staff_id = str(row['รหัสพนักงาน']).strip()
                
                if not staff_id or staff_id == 'nan':
                    continue
                
                # Check if staff already exists
                result = await db.execute(select(Staff).where(Staff.staffId == staff_id))
                existing = result.scalar_one_or_none()
                
                if existing:
                    skipped_count += 1
                    continue
                
                # Parse dates
                birth_date = None
                if pd.notna(row['วันเกิด']):
                    birth_date = pd.to_datetime(row['วันเกิด']).date()
                
                start_date = None
                if pd.notna(row['วันเริ่มงาน']):
                    start_date = pd.to_datetime(row['วันเริ่มงาน']).date()
                
                # Parse salary
                salary = None
                if pd.notna(row['เงินเดือน']):
                    try:
                        salary = float(row['เงินเดือน'])
                    except:
                        pass
                
                # Parse status
                status_str = str(row['สถานะ']).strip().lower() if pd.notna(row['สถานะ']) else 'active'
                is_active = status_str in ['active', 'ใช้งาน', 'เปิด', '1', 'true']
                
                new_staff = Staff(
                    staffId=staff_id,
                    firstName=str(row['ชื่อ']).strip(),
                    lastName=str(row['นามสกุล']).strip(),
                    idCardNumber=str(row['เลขบัตรประชาชน']).strip() if pd.notna(row['เลขบัตรประชาชน']) else None,
                    phone=str(row['เบอร์โทร']).strip() if pd.notna(row['เบอร์โทร']) else None,
                    address=str(row['ที่อยู่']).strip() if pd.notna(row['ที่อยู่']) else None,
                    position=str(row['ตำแหน่ง']).strip() if pd.notna(row['ตำแหน่ง']) else None,
                    department=str(row['แผนก']).strip() if pd.notna(row['แผนก']) else None,
                    birthDate=birth_date,
                    startDate=start_date,
                    salary=salary,
                    salaryType=str(row['ประเภทเงินเดือน']).strip() if pd.notna(row['ประเภทเงินเดือน']) else None,
                    paymentMethod=str(row['วิธีรับเงิน']).strip() if pd.notna(row['วิธีรับเงิน']) else None,
                    bankAccountNo=str(row['เลขบัญชี']).strip() if pd.notna(row['เลขบัญชี']) else None,
                    bankCode=str(row['รหัสธนาคาร']).strip() if pd.notna(row['รหัสธนาคาร']) else None,
                    isActive=is_active
                )
                
                db.add(new_staff)
                success_count += 1
                
            except Exception as e:
                errors.append(f"แถว {int(index) + 2}: {str(e)}")  # type: ignore[arg-type]
                error_count += 1
        
        if success_count > 0:
            await db.commit()
        
        return {
            "success": True,
            "imported": success_count,
            "skipped": skipped_count,
            "errors": error_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")


@router.post("/sites/import")
async def import_sites_from_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Import sites from Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls')):  # type: ignore[union-attr]
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ Excel (.xlsx หรือ .xls)")
    
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))  # type: ignore[call-overload]
        
        expected_columns = [
            'รหัสหน่วยงาน', 'ชื่อหน่วยงาน', 'รหัสลูกค้า', 'ชื่อลูกค้า',
            'วันเริ่มสัญญา', 'วันสิ้นสุดสัญญา', 'ที่อยู่หน่วยงาน',
            'แขวง/ตำบล', 'เขต/อำเภอ', 'จังหวัด', 'รหัสไปรษณีย์',
            'ผู้ติดต่อ', 'เบอร์โทร', 'สถานะ'
        ]
        
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"ไฟล์ขาดคอลัมน์: {', '.join(missing_columns)}"
            )
        
        success_count = 0
        skipped_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                site_code = str(row['รหัสหน่วยงาน']).strip()
                customer_code = str(row['รหัสลูกค้า']).strip()
                
                if not site_code or site_code == 'nan':
                    continue
                
                # Check if site already exists
                result = await db.execute(select(Site).where(Site.siteCode == site_code))
                existing = result.scalar_one_or_none()
                
                if existing:
                    skipped_count += 1
                    continue
                
                # Find customer by code
                customer_result = await db.execute(select(Customer).where(Customer.code == customer_code))
                customer = customer_result.scalar_one_or_none()
                
                if not customer:
                    errors.append(f"แถว {int(index) + 2}: ไม่พบลูกค้ารหัส '{customer_code}'")  # type: ignore[arg-type]
                    error_count += 1
                    continue
                
                # Parse dates
                contract_start = None
                if pd.notna(row['วันเริ่มสัญญา']):
                    contract_start = pd.to_datetime(row['วันเริ่มสัญญา']).date()
                
                contract_end = None
                if pd.notna(row['วันสิ้นสุดสัญญา']):
                    contract_end = pd.to_datetime(row['วันสิ้นสุดสัญญา']).date()
                
                # Parse status
                status_str = str(row['สถานะ']).strip().lower() if pd.notna(row['สถานะ']) else 'active'
                is_active = status_str in ['active', 'ใช้งาน', 'เปิด', '1', 'true']
                
                new_site = Site(
                    siteCode=site_code,
                    name=str(row['ชื่อหน่วยงาน']).strip(),
                    customerId=customer.id,
                    customerCode=customer.code,
                    customerName=customer.name,
                    contractStartDate=contract_start,
                    contractEndDate=contract_end,
                    address=str(row['ที่อยู่หน่วยงาน']).strip() if pd.notna(row['ที่อยู่หน่วยงาน']) else None,
                    subDistrict=str(row['แขวง/ตำบล']).strip() if pd.notna(row['แขวง/ตำบล']) else None,
                    district=str(row['เขต/อำเภอ']).strip() if pd.notna(row['เขต/อำเภอ']) else None,
                    province=str(row['จังหวัด']).strip() if pd.notna(row['จังหวัด']) else None,
                    postalCode=str(row['รหัสไปรษณีย์']).strip() if pd.notna(row['รหัสไปรษณีย์']) else None,
                    contactPerson=str(row['ผู้ติดต่อ']).strip() if pd.notna(row['ผู้ติดต่อ']) else None,
                    phone=str(row['เบอร์โทร']).strip() if pd.notna(row['เบอร์โทร']) else None,
                    isActive=is_active
                )
                
                db.add(new_site)
                success_count += 1
                
            except Exception as e:
                errors.append(f"แถว {int(index) + 2}: {str(e)}")  # type: ignore[arg-type]
                error_count += 1
        
        if success_count > 0:
            await db.commit()
        
        return {
            "success": True,
            "imported": success_count,
            "skipped": skipped_count,
            "errors": error_count
        }
        
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
            "contractFilePath": site.contractFilePath if hasattr(site, 'contractFilePath') else None,
            "contractFileName": site.contractFileName if hasattr(site, 'contractFileName') else None,
            "address": site.address,
            "subDistrict": site.subDistrict if hasattr(site, 'subDistrict') else None,
            "district": site.district if hasattr(site, 'district') else None,
            "province": site.province if hasattr(site, 'province') else None,
            "postalCode": site.postalCode if hasattr(site, 'postalCode') else None,
            "contactPerson": site.contactPerson,
            "phone": site.phone,
            "employmentDetails": json.loads(site.employmentDetails) if hasattr(site, 'employmentDetails') and site.employmentDetails else [],  # type: ignore[arg-type]
            "shiftAssignments": json.loads(site.shiftAssignments) if hasattr(site, 'shiftAssignments') and site.shiftAssignments else [],  # type: ignore[arg-type]
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
        shiftAssignments=json.dumps([s.model_dump() for s in site_data.shiftAssignments]) if site_data.shiftAssignments else None,
        contractedServices=json.dumps([s.model_dump() for s in site_data.contractedServices]) if site_data.contractedServices else None,
        isActive=site_data.isActive
    )
    
    db.add(new_site)
    await db.commit()
    await db.refresh(new_site)
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="CREATE",
        entity_type="sites",
        entity_id=new_site.siteCode,
        entity_name=f"{new_site.siteCode} - {new_site.name}",
        description=f"สร้างข้อมูลหน่วยงาน: {new_site.siteCode} - {new_site.name}",
        new_data={
            "siteCode": new_site.siteCode,
            "name": new_site.name,
            "customerCode": new_site.customerCode,
            "customerName": new_site.customerName,
            "address": new_site.address,
            "district": new_site.district,
            "province": new_site.province,
            "phone": new_site.phone,
            "contactPerson": new_site.contactPerson,
            "employmentDetails": json.loads(new_site.employmentDetails) if new_site.employmentDetails else [],
            "shiftAssignments": json.loads(new_site.shiftAssignments) if new_site.shiftAssignments else [],
            "isActive": new_site.isActive
        }
    )
    
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
        "shiftAssignments": json.loads(new_site.shiftAssignments) if new_site.shiftAssignments else [],  # type: ignore[arg-type]
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
        "contractFilePath": site.contractFilePath if hasattr(site, 'contractFilePath') else None,
        "contractFileName": site.contractFileName if hasattr(site, 'contractFileName') else None,
        "address": site.address,
        "subDistrict": site.subDistrict if hasattr(site, 'subDistrict') else None,
        "district": site.district if hasattr(site, 'district') else None,
        "province": site.province if hasattr(site, 'province') else None,
        "postalCode": site.postalCode if hasattr(site, 'postalCode') else None,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "employmentDetails": json.loads(site.employmentDetails) if hasattr(site, 'employmentDetails') and site.employmentDetails else [],  # type: ignore[arg-type]
        "shiftAssignments": json.loads(site.shiftAssignments) if hasattr(site, 'shiftAssignments') and site.shiftAssignments else [],  # type: ignore[arg-type]
        "contractedServices": json.loads(site.contractedServices) if site.contractedServices else [],  # type: ignore[arg-type]
        "isActive": site.isActive,
        "createdAt": site.createdAt
    }


@router.get("/sites/{site_id}/has-schedule")
async def check_site_has_schedule(
    site_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """ตรวจสอบว่า Site มีตารางงานหรือไม่ และกะไหนมีคนแล้วบ้าง"""
    import json
    
    # ดึง schedules ทั้งหมดของ site นี้
    schedule_result = await db.execute(
        select(Schedule).where(Schedule.siteId == site_id)
    )
    schedules = schedule_result.scalars().all()
    
    # เก็บ shiftCode ที่มีคนจัดแล้ว
    shifts_with_guards = set()
    
    for schedule in schedules:
        if schedule.shifts:
            try:
                shifts_data = json.loads(schedule.shifts)
                for shift_code, guards in shifts_data.items():
                    if guards and len(guards) > 0:
                        shifts_with_guards.add(shift_code)
            except:
                pass
    
    return {
        "hasSchedule": len(schedules) > 0,
        "shiftsWithGuards": list(shifts_with_guards)  # กะที่มีคนจัดแล้ว
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
    
    # Store old data for audit
    old_data = {
        "siteCode": site.siteCode,
        "name": site.name,
        "customerCode": site.customerCode,
        "customerName": site.customerName,
        "contractStartDate": str(site.contractStartDate) if site.contractStartDate else None,
        "contractEndDate": str(site.contractEndDate) if site.contractEndDate else None,
        "address": site.address,
        "subDistrict": site.subDistrict,
        "district": site.district,
        "province": site.province,
        "postalCode": site.postalCode,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "employmentDetails": json.loads(site.employmentDetails) if site.employmentDetails else [],
        "shiftAssignments": json.loads(site.shiftAssignments) if hasattr(site, 'shiftAssignments') and site.shiftAssignments else [],
        "isActive": site.isActive
    }
    changes = []
    
    # Check duplicate siteCode if changed
    if site_data.siteCode is not None and site_data.siteCode != site.siteCode:
        result = await db.execute(select(Site).where(Site.siteCode == site_data.siteCode))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="รหัสหน่วยงานซ้ำ (Site Code already exists)")
        changes.append("siteCode")
        site.siteCode = site_data.siteCode  # type: ignore[assignment]
    
    if site_data.name is not None:
        if site_data.name != site.name:
            changes.append("name")
        site.name = site_data.name  # type: ignore[assignment]
    if site_data.customerId is not None:
        try:
            cid = int(site_data.customerId)
            # Only update if customer ID actually changed
            if cid != site.customerId:
                result = await db.execute(select(Customer).where(Customer.id == cid))
                customer = result.scalar_one_or_none()
                if not customer:
                    raise HTTPException(status_code=404, detail="Customer not found")
                changes.append("customerId")
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
        new_employment = json.dumps([d.model_dump() for d in site_data.employmentDetails])
        old_employment = site.employmentDetails
        if new_employment != old_employment:
            changes.append("employmentDetails")
        site.employmentDetails = new_employment  # type: ignore[assignment]
    if site_data.shiftAssignments is not None:
        new_shifts = json.dumps([s.model_dump() for s in site_data.shiftAssignments])
        old_shifts = site.shiftAssignments if hasattr(site, 'shiftAssignments') else None
        if new_shifts != old_shifts:
            changes.append("shiftAssignments")
        site.shiftAssignments = new_shifts  # type: ignore[assignment]
    if site_data.contractedServices is not None:
        site.contractedServices = json.dumps([s.model_dump() for s in site_data.contractedServices])  # type: ignore[assignment]
    if site_data.isActive is not None:
        if site_data.isActive != site.isActive:
            changes.append("isActive")
        site.isActive = site_data.isActive  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(site)
    
    # Get customer info before audit log
    result = await db.execute(select(Customer).where(Customer.id == site.customerId))
    customer = result.scalar_one_or_none()
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="UPDATE",
        entity_type="sites",
        entity_id=site.siteCode,
        entity_name=f"{site.siteCode} - {site.name}",
        description=f"แก้ไขข้อมูลหน่วยงาน: {site.siteCode} - {site.name}",
        old_data=old_data,
        new_data={
            "siteCode": site.siteCode,
            "name": site.name,
            "customerCode": site.customerCode,
            "customerName": site.customerName,
            "contractStartDate": str(site.contractStartDate) if site.contractStartDate else None,
            "contractEndDate": str(site.contractEndDate) if site.contractEndDate else None,
            "address": site.address,
            "subDistrict": site.subDistrict,
            "district": site.district,
            "province": site.province,
            "postalCode": site.postalCode,
            "contactPerson": site.contactPerson,
            "phone": site.phone,
            "employmentDetails": json.loads(site.employmentDetails) if site.employmentDetails else [],
            "shiftAssignments": json.loads(site.shiftAssignments) if hasattr(site, 'shiftAssignments') and site.shiftAssignments else [],
            "isActive": site.isActive
        },
        changes=changes if changes else None
    )
    
    return {
        "id": str(site.id),
        "siteCode": site.siteCode if hasattr(site, 'siteCode') else "",
        "name": site.name,
        "customerId": str(site.customerId) if site.customerId else "",  # type: ignore[arg-type]
        "customerCode": site.customerCode if hasattr(site, 'customerCode') else None,
        "customerName": site.customerName if hasattr(site, 'customerName') else (customer.name if customer else None),
        "contractStartDate": site.contractStartDate.isoformat() if hasattr(site, 'contractStartDate') and site.contractStartDate else None,  # type: ignore[arg-type]
        "contractEndDate": site.contractEndDate.isoformat() if hasattr(site, 'contractEndDate') and site.contractEndDate else None,  # type: ignore[arg-type]
        "contractFilePath": site.contractFilePath if hasattr(site, 'contractFilePath') else None,
        "contractFileName": site.contractFileName if hasattr(site, 'contractFileName') else None,
        "address": site.address,
        "subDistrict": site.subDistrict if hasattr(site, 'subDistrict') else None,
        "district": site.district if hasattr(site, 'district') else None,
        "province": site.province if hasattr(site, 'province') else None,
        "postalCode": site.postalCode if hasattr(site, 'postalCode') else None,
        "contactPerson": site.contactPerson,
        "phone": site.phone,
        "employmentDetails": json.loads(site.employmentDetails) if hasattr(site, 'employmentDetails') and site.employmentDetails else [],  # type: ignore[arg-type]
        "shiftAssignments": json.loads(site.shiftAssignments) if hasattr(site, 'shiftAssignments') and site.shiftAssignments else [],  # type: ignore[arg-type]
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
    
    # ตรวจสอบว่ามีการจัดตารางงานหรือไม่
    schedule_result = await db.execute(
        select(Schedule).where(Schedule.siteId == sid).limit(1)
    )
    has_schedule = schedule_result.scalar_one_or_none()
    
    if has_schedule:
        raise HTTPException(
            status_code=400, 
            detail="ไม่สามารถลบหน่วยงานนี้ได้ เนื่องจากมีการจัดตารางงานอยู่แล้ว กรุณาลบตารางงานก่อน"
        )
    
    # Store data for audit before deletion
    site_code = site.siteCode
    site_name = site.name
    site_data = {
        "siteCode": site.siteCode,
        "name": site.name,
        "customerCode": site.customerCode,
        "customerName": site.customerName,
        "address": site.address,
        "district": site.district,
        "province": site.province,
        "phone": site.phone,
        "employmentDetails": json.loads(site.employmentDetails) if site.employmentDetails else [],
        "isActive": site.isActive
    }
        
    await db.delete(site)
    await db.commit()
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="DELETE",
        entity_type="sites",
        entity_id=site_code,
        entity_name=site_name,
        description=f"ลบหน่วยงาน: {site_code} - {site_name}",
        old_data=site_data
    )
    
    return {"message": "Site deleted successfully"}


# ========== SITE CONTRACT FILE ENDPOINTS ==========

UPLOAD_DIR = "uploads/contracts"

@router.post("/sites/{site_id}/contract-file")
async def upload_contract_file(
    site_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload contract file for a site"""
    try:
        sid = int(site_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid site ID")
    
    result = await db.execute(select(Site).where(Site.id == sid))
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"ไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ประเภท: {', '.join(allowed_extensions)}"
        )
    
    # Create upload directory if not exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Delete old file if exists
    if site.contractFilePath and os.path.exists(site.contractFilePath):
        try:
            os.remove(site.contractFilePath)
        except Exception:
            pass  # Ignore error if file doesn't exist
    
    # Generate unique filename
    import uuid
    unique_filename = f"{site.siteCode}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update database
    site.contractFilePath = file_path
    site.contractFileName = file.filename
    await db.commit()
    
    # Audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="UPDATE",
        entity_type="sites",
        entity_id=site.siteCode,
        entity_name=site.name,
        description=f"อัปโหลดเอกสารสัญญา: {file.filename}",
        new_data={"contractFileName": file.filename}
    )
    
    return {
        "message": "อัปโหลดเอกสารสัญญาสำเร็จ",
        "contractFilePath": file_path,
        "contractFileName": file.filename
    }


@router.get("/sites/{site_id}/contract-file")
async def download_contract_file(
    site_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Download contract file for a site"""
    try:
        sid = int(site_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid site ID")
    
    result = await db.execute(select(Site).where(Site.id == sid))
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    if not site.contractFilePath:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารสัญญา")
    
    if not os.path.exists(site.contractFilePath):
        raise HTTPException(status_code=404, detail="ไฟล์เอกสารไม่พบในระบบ")
    
    return FileResponse(
        path=site.contractFilePath,
        filename=site.contractFileName or "contract_file",
        media_type="application/octet-stream"
    )


@router.delete("/sites/{site_id}/contract-file")
async def delete_contract_file(
    site_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete contract file for a site"""
    try:
        sid = int(site_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid site ID")
    
    result = await db.execute(select(Site).where(Site.id == sid))
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    if not site.contractFilePath:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารสัญญา")
    
    old_filename = site.contractFileName
    
    # Delete physical file
    if os.path.exists(site.contractFilePath):
        try:
            os.remove(site.contractFilePath)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"ไม่สามารถลบไฟล์ได้: {str(e)}")
    
    # Update database
    site.contractFilePath = None
    site.contractFileName = None
    await db.commit()
    
    # Audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="UPDATE",
        entity_type="sites",
        entity_id=site.siteCode,
        entity_name=site.name,
        description=f"ลบเอกสารสัญญา: {old_filename}",
        old_data={"contractFileName": old_filename}
    )
    
    return {"message": "ลบเอกสารสัญญาสำเร็จ"}


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
            # Personal Information
            "title": g.title,
            "firstName": g.firstName,
            "lastName": g.lastName,
            "birthDate": g.birthDate,
            "nationality": g.nationality,
            "religion": g.religion,
            "idCardNumber": g.idCardNumber,
            # Addresses
            "addressIdCard": g.addressIdCard,
            "addressCurrent": g.addressCurrent,
            "phone": g.phone,
            # Education & License
            "education": g.education,
            "licenseNumber": g.licenseNumber,
            "licenseExpiry": g.licenseExpiry,
            # Employment
            "startDate": g.startDate,
            "isActive": g.isActive,
            # Banking
            "bankAccountName": g.bankAccountName,
            "bankAccountNo": g.bankAccountNo,
            "bankCode": g.bankCode,
            # Family Status
            "maritalStatus": g.maritalStatus,
            "spouseName": g.spouseName,
            # Emergency Contact
            "emergencyContactName": g.emergencyContactName,
            "emergencyContactPhone": g.emergencyContactPhone,
            "emergencyContactRelation": g.emergencyContactRelation,
            # Legacy fields
            "address": g.address,
            "position": g.position,
            "department": g.department,
            "salary": g.salary,
            "salaryType": g.salaryType,
            "paymentMethod": g.paymentMethod,
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
    """Create a new guard with auto-generated ID"""
    # Generate next guard ID
    result = await db.execute(
        select(Guard.guardId)
        .where(Guard.guardId.like('PG-%'))
        .order_by(Guard.guardId.desc())
        .limit(1)
    )
    last_guard_id = result.scalar_one_or_none()
    
    if last_guard_id:
        # Extract number from PG-XXXX format
        try:
            last_num = int(last_guard_id.split('-')[1])
            next_num = last_num + 1
        except (IndexError, ValueError):
            next_num = 1
    else:
        next_num = 1
    
    # Format as PG-0001, PG-0002, etc.
    new_guard_id = f"PG-{next_num:04d}"
    
    new_guard = Guard(
        guardId=new_guard_id,
        # Personal Information
        title=guard_data.title,
        firstName=guard_data.firstName,
        lastName=guard_data.lastName,
        birthDate=guard_data.birthDate,
        nationality=guard_data.nationality,
        religion=guard_data.religion,
        idCardNumber=guard_data.idCardNumber,
        # Addresses
        addressIdCard=guard_data.addressIdCard,
        addressCurrent=guard_data.addressCurrent,
        phone=guard_data.phone,
        # Education & License
        education=guard_data.education,
        licenseNumber=guard_data.licenseNumber,
        licenseExpiry=guard_data.licenseExpiry,
        # Employment
        startDate=guard_data.startDate,
        isActive=guard_data.isActive,
        # Banking
        bankAccountName=guard_data.bankAccountName,
        bankAccountNo=guard_data.bankAccountNo,
        bankCode=guard_data.bankCode,
        # Family Status
        maritalStatus=guard_data.maritalStatus,
        spouseName=guard_data.spouseName,
        # Emergency Contact
        emergencyContactName=guard_data.emergencyContactName,
        emergencyContactPhone=guard_data.emergencyContactPhone,
        emergencyContactRelation=guard_data.emergencyContactRelation,
        # Legacy fields (keep for backward compatibility)
        address=guard_data.address,
        position=guard_data.position,
        department=guard_data.department,
        salary=guard_data.salary,
        salaryType=guard_data.salaryType,
        paymentMethod=guard_data.paymentMethod
    )
    
    db.add(new_guard)
    await db.commit()
    await db.refresh(new_guard)
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="CREATE",
        entity_type="guards",
        entity_id=new_guard.guardId,  # Use guardId instead of guard.id
        entity_name=f"{new_guard.guardId} - {new_guard.title or ''}{new_guard.firstName} {new_guard.lastName}",
        description=f"สร้างข้อมูลพนักงาน: {new_guard.guardId} - {new_guard.title or ''}{new_guard.firstName} {new_guard.lastName}",
        new_data={
            "guardId": new_guard.guardId,
            "title": new_guard.title,
            "firstName": new_guard.firstName,
            "lastName": new_guard.lastName,
            "birthDate": str(new_guard.birthDate) if new_guard.birthDate else None,
            "nationality": new_guard.nationality,
            "idCardNumber": new_guard.idCardNumber,
            "phone": new_guard.phone,
            "startDate": str(new_guard.startDate) if new_guard.startDate else None,
            "emergencyContactName": new_guard.emergencyContactName,
            "emergencyContactPhone": new_guard.emergencyContactPhone,
            "isActive": new_guard.isActive
        }
    )
    
    return {  # type: ignore
        "id": str(new_guard.id),
        "guardId": new_guard.guardId,
        # Personal Information
        "title": new_guard.title,
        "firstName": new_guard.firstName,
        "lastName": new_guard.lastName,
        "birthDate": new_guard.birthDate,
        "nationality": new_guard.nationality,
        "religion": new_guard.religion,
        "idCardNumber": new_guard.idCardNumber,
        # Addresses
        "addressIdCard": new_guard.addressIdCard,
        "addressCurrent": new_guard.addressCurrent,
        "phone": new_guard.phone,
        # Education & License
        "education": new_guard.education,
        "licenseNumber": new_guard.licenseNumber,
        "licenseExpiry": new_guard.licenseExpiry,
        # Employment
        "startDate": new_guard.startDate,
        "isActive": new_guard.isActive,
        # Banking
        "bankAccountName": new_guard.bankAccountName,
        "bankAccountNo": new_guard.bankAccountNo,
        "bankCode": new_guard.bankCode,
        # Family Status
        "maritalStatus": new_guard.maritalStatus,
        "spouseName": new_guard.spouseName,
        # Emergency Contact
        "emergencyContactName": new_guard.emergencyContactName,
        "emergencyContactPhone": new_guard.emergencyContactPhone,
        "emergencyContactRelation": new_guard.emergencyContactRelation,
        # Legacy fields
        "address": new_guard.address,
        "position": new_guard.position,
        "department": new_guard.department,
        "salary": new_guard.salary,
        "salaryType": new_guard.salaryType,
        "paymentMethod": new_guard.paymentMethod,
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
        # Personal Information
        "title": guard.title,
        "firstName": guard.firstName,
        "lastName": guard.lastName,
        "birthDate": guard.birthDate,
        "nationality": guard.nationality,
        "religion": guard.religion,
        "idCardNumber": guard.idCardNumber,
        # Addresses
        "addressIdCard": guard.addressIdCard,
        "addressCurrent": guard.addressCurrent,
        "phone": guard.phone,
        # Education & License
        "education": guard.education,
        "licenseNumber": guard.licenseNumber,
        "licenseExpiry": guard.licenseExpiry,
        # Employment
        "startDate": guard.startDate,
        "isActive": guard.isActive,
        # Banking
        "bankAccountName": guard.bankAccountName,
        "bankAccountNo": guard.bankAccountNo,
        "bankCode": guard.bankCode,
        # Family Status
        "maritalStatus": guard.maritalStatus,
        "spouseName": guard.spouseName,
        # Emergency Contact
        "emergencyContactName": guard.emergencyContactName,
        "emergencyContactPhone": guard.emergencyContactPhone,
        "emergencyContactRelation": guard.emergencyContactRelation,
        # Legacy fields
        "address": guard.address,
        "position": guard.position,
        "department": guard.department,
        "salary": guard.salary,
        "salaryType": guard.salaryType,
        "paymentMethod": guard.paymentMethod,
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
    
    # Store old data for audit (complete snapshot)
    old_data = {
        "guardId": guard.guardId,
        "title": guard.title,
        "firstName": guard.firstName,
        "lastName": guard.lastName,
        "birthDate": str(guard.birthDate) if guard.birthDate else None,
        "nationality": guard.nationality,
        "religion": guard.religion,
        "idCardNumber": guard.idCardNumber,
        "addressIdCard": guard.addressIdCard,
        "addressCurrent": guard.addressCurrent,
        "phone": guard.phone,
        "education": guard.education,
        "licenseNumber": guard.licenseNumber,
        "licenseExpiry": str(guard.licenseExpiry) if guard.licenseExpiry else None,
        "startDate": str(guard.startDate) if guard.startDate else None,
        "bankAccountName": guard.bankAccountName,
        "bankAccountNo": guard.bankAccountNo,
        "bankCode": guard.bankCode,
        "maritalStatus": guard.maritalStatus,
        "spouseName": guard.spouseName,
        "emergencyContactName": guard.emergencyContactName,
        "emergencyContactPhone": guard.emergencyContactPhone,
        "emergencyContactRelation": guard.emergencyContactRelation,
        "isActive": guard.isActive
    }
    changes = []
    
    # Personal Information
    if guard_data.title is not None:
        guard.title = guard_data.title  # type: ignore[assignment]
    if guard_data.firstName is not None:
        if guard_data.firstName != guard.firstName:
            changes.append("firstName")
        guard.firstName = guard_data.firstName  # type: ignore[assignment]
    if guard_data.lastName is not None:
        if guard_data.lastName != guard.lastName:
            changes.append("lastName")
        guard.lastName = guard_data.lastName  # type: ignore[assignment]
    if guard_data.birthDate is not None:
        if guard_data.birthDate != guard.birthDate:
            changes.append("birthDate")
        guard.birthDate = guard_data.birthDate  # type: ignore[assignment]
    if guard_data.nationality is not None:
        guard.nationality = guard_data.nationality  # type: ignore[assignment]
    if guard_data.religion is not None:
        guard.religion = guard_data.religion  # type: ignore[assignment]
    if guard_data.idCardNumber is not None:
        if guard_data.idCardNumber != guard.idCardNumber:
            changes.append("idCardNumber")
        guard.idCardNumber = guard_data.idCardNumber  # type: ignore[assignment]
    
    # Addresses
    if guard_data.addressIdCard is not None:
        if guard_data.addressIdCard != guard.addressIdCard:
            changes.append("addressIdCard")
        guard.addressIdCard = guard_data.addressIdCard  # type: ignore[assignment]
    if guard_data.addressCurrent is not None:
        if guard_data.addressCurrent != guard.addressCurrent:
            changes.append("addressCurrent")
        guard.addressCurrent = guard_data.addressCurrent  # type: ignore[assignment]
    if guard_data.phone is not None:
        if guard_data.phone != guard.phone:
            changes.append("phone")
        guard.phone = guard_data.phone  # type: ignore[assignment]
    
    # Education & License
    if guard_data.education is not None:
        guard.education = guard_data.education  # type: ignore[assignment]
    if guard_data.licenseNumber is not None:
        guard.licenseNumber = guard_data.licenseNumber  # type: ignore[assignment]
    if guard_data.licenseExpiry is not None:
        guard.licenseExpiry = guard_data.licenseExpiry  # type: ignore[assignment]
    
    # Employment
    if guard_data.startDate is not None:
        if guard_data.startDate != guard.startDate:
            changes.append("startDate")
        guard.startDate = guard_data.startDate  # type: ignore[assignment]
    if guard_data.isActive is not None:
        if guard_data.isActive != guard.isActive:
            changes.append("isActive")
        guard.isActive = guard_data.isActive  # type: ignore[assignment]
    
    # Banking
    if guard_data.bankAccountName is not None:
        guard.bankAccountName = guard_data.bankAccountName  # type: ignore[assignment]
    if guard_data.bankAccountNo is not None:
        guard.bankAccountNo = guard_data.bankAccountNo  # type: ignore[assignment]
    if guard_data.bankCode is not None:
        guard.bankCode = guard_data.bankCode  # type: ignore[assignment]
    
    # Family Status
    if guard_data.maritalStatus is not None:
        guard.maritalStatus = guard_data.maritalStatus  # type: ignore[assignment]
    if guard_data.spouseName is not None:
        guard.spouseName = guard_data.spouseName  # type: ignore[assignment]
    
    # Emergency Contact
    if guard_data.emergencyContactName is not None:
        if guard_data.emergencyContactName != guard.emergencyContactName:
            changes.append("emergencyContactName")
        guard.emergencyContactName = guard_data.emergencyContactName  # type: ignore[assignment]
    if guard_data.emergencyContactPhone is not None:
        if guard_data.emergencyContactPhone != guard.emergencyContactPhone:
            changes.append("emergencyContactPhone")
        guard.emergencyContactPhone = guard_data.emergencyContactPhone  # type: ignore[assignment]
    if guard_data.emergencyContactRelation is not None:
        guard.emergencyContactRelation = guard_data.emergencyContactRelation  # type: ignore[assignment]
    
    # Legacy fields
    if guard_data.address is not None:
        guard.address = guard_data.address  # type: ignore[assignment]
    if guard_data.position is not None:
        guard.position = guard_data.position  # type: ignore[assignment]
    if guard_data.department is not None:
        guard.department = guard_data.department  # type: ignore[assignment]
    if guard_data.salary is not None:
        guard.salary = guard_data.salary  # type: ignore[assignment]
    if guard_data.salaryType is not None:
        guard.salaryType = guard_data.salaryType  # type: ignore[assignment]
    if guard_data.paymentMethod is not None:
        guard.paymentMethod = guard_data.paymentMethod  # type: ignore[assignment]
        
    await db.commit()
    await db.refresh(guard)
    
    # Create audit log for all updates (with detailed tracking)
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="UPDATE",
        entity_type="guards",
        entity_id=guard.guardId,  # Use guardId instead of guard.id
        entity_name=f"{guard.guardId} - {guard.title or ''}{guard.firstName} {guard.lastName}",
        description=f"แก้ไขข้อมูลพนักงาน: {guard.guardId} - {guard.title or ''}{guard.firstName} {guard.lastName}",
        old_data=old_data,
        new_data={
            "guardId": guard.guardId,
            "title": guard.title,
            "firstName": guard.firstName,
            "lastName": guard.lastName,
            "birthDate": str(guard.birthDate) if guard.birthDate else None,
            "nationality": guard.nationality,
            "religion": guard.religion,
            "idCardNumber": guard.idCardNumber,
            "addressIdCard": guard.addressIdCard,
            "addressCurrent": guard.addressCurrent,
            "phone": guard.phone,
            "education": guard.education,
            "licenseNumber": guard.licenseNumber,
            "licenseExpiry": str(guard.licenseExpiry) if guard.licenseExpiry else None,
            "startDate": str(guard.startDate) if guard.startDate else None,
            "bankAccountName": guard.bankAccountName,
            "bankAccountNo": guard.bankAccountNo,
            "bankCode": guard.bankCode,
            "maritalStatus": guard.maritalStatus,
            "spouseName": guard.spouseName,
            "emergencyContactName": guard.emergencyContactName,
            "emergencyContactPhone": guard.emergencyContactPhone,
            "emergencyContactRelation": guard.emergencyContactRelation,
            "isActive": guard.isActive
        },
        changes=changes if changes else None
    )
    
    return {  # type: ignore
        "id": str(guard.id),
        "guardId": guard.guardId,
        # Personal Information
        "title": guard.title,
        "firstName": guard.firstName,
        "lastName": guard.lastName,
        "birthDate": guard.birthDate,
        "nationality": guard.nationality,
        "religion": guard.religion,
        "idCardNumber": guard.idCardNumber,
        # Addresses
        "addressIdCard": guard.addressIdCard,
        "addressCurrent": guard.addressCurrent,
        "phone": guard.phone,
        # Education & License
        "education": guard.education,
        "licenseNumber": guard.licenseNumber,
        "licenseExpiry": guard.licenseExpiry,
        # Employment
        "startDate": guard.startDate,
        "isActive": guard.isActive,
        # Banking
        "bankAccountName": guard.bankAccountName,
        "bankAccountNo": guard.bankAccountNo,
        "bankCode": guard.bankCode,
        # Family Status
        "maritalStatus": guard.maritalStatus,
        "spouseName": guard.spouseName,
        # Emergency Contact
        "emergencyContactName": guard.emergencyContactName,
        "emergencyContactPhone": guard.emergencyContactPhone,
        "emergencyContactRelation": guard.emergencyContactRelation,
        # Legacy fields
        "address": guard.address,
        "position": guard.position,
        "department": guard.department,
        "salary": guard.salary,
        "salaryType": guard.salaryType,
        "paymentMethod": guard.paymentMethod,
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
    
    # Store data for audit before deletion
    guard_id_code = guard.guardId
    guard_name = f"{guard.firstName} {guard.lastName}"
    guard_data = {
        "guardId": guard.guardId,
        "firstName": guard.firstName,
        "lastName": guard.lastName,
        "phone": guard.phone,
        "isActive": guard.isActive
    }
        
    await db.delete(guard)
    await db.commit()
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="DELETE",
        entity_type="guards",
        entity_id=guard_id_code,  # Use guardId instead of str(gid)
        entity_name=guard_name,
        description=f"ลบพนักงาน: {guard_id_code} - {guard_name}",
        old_data=guard_data
    )
    
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
    return [
        {
            "id": str(s.id),
            "staffId": s.staffId,
            "title": s.title,
            "firstName": s.firstName,
            "lastName": s.lastName,
            "idCardNumber": s.idCardNumber,
            "birthDate": s.birthDate,
            "phone": s.phone,
            "email": s.email,
            "address": s.address,
            "position": s.position,
            "department": s.department,
            "startDate": s.startDate,
            "salary": s.salary,
            "bankAccountNo": s.bankAccountNo,
            "bankCode": s.bankCode,
            "emergencyContactName": s.emergencyContactName,
            "emergencyContactPhone": s.emergencyContactPhone,
            "emergencyContactRelation": s.emergencyContactRelation,
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
    # Auto-generate staffId like ST-0001
    result = await db.execute(
        select(Staff.staffId)
        .where(Staff.staffId.like('ST-%'))
        .order_by(Staff.staffId.desc())
        .limit(1)
    )
    last_staff_id = result.scalar_one_or_none()
    
    if last_staff_id:
        last_num = int(last_staff_id.split('-')[1])
        next_num = last_num + 1
    else:
        next_num = 1
    
    new_staff_id = f"ST-{next_num:04d}"
    
    new_staff = Staff(
        staffId=new_staff_id,
        title=staff_data.title,
        firstName=staff_data.firstName,
        lastName=staff_data.lastName,
        idCardNumber=staff_data.idCardNumber,
        birthDate=staff_data.birthDate,
        phone=staff_data.phone,
        email=staff_data.email,
        address=staff_data.address,
        position=staff_data.position,
        department=staff_data.department,
        startDate=staff_data.startDate,
        salary=staff_data.salary,
        bankAccountNo=staff_data.bankAccountNo,
        bankCode=staff_data.bankCode,
        emergencyContactName=staff_data.emergencyContactName,
        emergencyContactPhone=staff_data.emergencyContactPhone,
        emergencyContactRelation=staff_data.emergencyContactRelation,
        isActive=staff_data.isActive
    )
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="CREATE",
        entity_type="staff",
        entity_id=new_staff.staffId,
        entity_name=f"{new_staff.staffId} - {new_staff.title or ''}{new_staff.firstName} {new_staff.lastName}",
        description=f"สร้างข้อมูลพนักงานภายใน: {new_staff.staffId} - {new_staff.title or ''}{new_staff.firstName} {new_staff.lastName}",
        new_data={
            "staffId": new_staff.staffId,
            "title": new_staff.title,
            "firstName": new_staff.firstName,
            "lastName": new_staff.lastName,
            "idCardNumber": new_staff.idCardNumber,
            "phone": new_staff.phone,
            "email": new_staff.email,
            "position": new_staff.position,
            "department": new_staff.department,
            "startDate": str(new_staff.startDate) if new_staff.startDate else None,
            "emergencyContactName": new_staff.emergencyContactName,
            "emergencyContactPhone": new_staff.emergencyContactPhone,
            "isActive": new_staff.isActive
        }
    )
    
    return {
        "id": str(new_staff.id),
        "staffId": new_staff.staffId,
        "title": new_staff.title,
        "firstName": new_staff.firstName,
        "lastName": new_staff.lastName,
        "idCardNumber": new_staff.idCardNumber,
        "birthDate": new_staff.birthDate,
        "phone": new_staff.phone,
        "email": new_staff.email,
        "address": new_staff.address,
        "position": new_staff.position,
        "department": new_staff.department,
        "startDate": new_staff.startDate,
        "salary": new_staff.salary,
        "bankAccountNo": new_staff.bankAccountNo,
        "bankCode": new_staff.bankCode,
        "emergencyContactName": new_staff.emergencyContactName,
        "emergencyContactPhone": new_staff.emergencyContactPhone,
        "emergencyContactRelation": new_staff.emergencyContactRelation,
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
    return {
        "id": str(staff.id),
        "staffId": staff.staffId,
        "title": staff.title,
        "firstName": staff.firstName,
        "lastName": staff.lastName,
        "idCardNumber": staff.idCardNumber,
        "birthDate": staff.birthDate,
        "phone": staff.phone,
        "email": staff.email,
        "address": staff.address,
        "position": staff.position,
        "department": staff.department,
        "startDate": staff.startDate,
        "salary": staff.salary,
        "bankAccountNo": staff.bankAccountNo,
        "bankCode": staff.bankCode,
        "emergencyContactName": staff.emergencyContactName,
        "emergencyContactPhone": staff.emergencyContactPhone,
        "emergencyContactRelation": staff.emergencyContactRelation,
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
    
    # Store old data for audit
    old_data = {
        "staffId": staff.staffId,
        "title": staff.title,
        "firstName": staff.firstName,
        "lastName": staff.lastName,
        "idCardNumber": staff.idCardNumber,
        "birthDate": str(staff.birthDate) if staff.birthDate else None,
        "phone": staff.phone,
        "email": staff.email,
        "address": staff.address,
        "position": staff.position,
        "department": staff.department,
        "startDate": str(staff.startDate) if staff.startDate else None,
        "salary": str(staff.salary) if staff.salary else None,
        "bankAccountNo": staff.bankAccountNo,
        "bankCode": staff.bankCode,
        "emergencyContactName": staff.emergencyContactName,
        "emergencyContactPhone": staff.emergencyContactPhone,
        "emergencyContactRelation": staff.emergencyContactRelation,
        "isActive": staff.isActive
    }
    changes = []
    
    # Update all fields
    if staff_data.title is not None:
        if staff_data.title != staff.title:
            changes.append("title")
        staff.title = staff_data.title  # type: ignore[assignment]
    if staff_data.firstName is not None:
        if staff_data.firstName != staff.firstName:
            changes.append("firstName")
        staff.firstName = staff_data.firstName  # type: ignore[assignment]
    if staff_data.lastName is not None:
        if staff_data.lastName != staff.lastName:
            changes.append("lastName")
        staff.lastName = staff_data.lastName  # type: ignore[assignment]
    if staff_data.idCardNumber is not None:
        staff.idCardNumber = staff_data.idCardNumber  # type: ignore[assignment]
    if staff_data.birthDate is not None:
        staff.birthDate = staff_data.birthDate  # type: ignore[assignment]
    if staff_data.phone is not None:
        staff.phone = staff_data.phone  # type: ignore[assignment]
    if staff_data.email is not None:
        staff.email = staff_data.email  # type: ignore[assignment]
    if staff_data.address is not None:
        staff.address = staff_data.address  # type: ignore[assignment]
    if staff_data.position is not None:
        staff.position = staff_data.position  # type: ignore[assignment]
    if staff_data.department is not None:
        staff.department = staff_data.department  # type: ignore[assignment]
    if staff_data.startDate is not None:
        staff.startDate = staff_data.startDate  # type: ignore[assignment]
    if staff_data.salary is not None:
        staff.salary = staff_data.salary  # type: ignore[assignment]
    if staff_data.bankAccountNo is not None:
        staff.bankAccountNo = staff_data.bankAccountNo  # type: ignore[assignment]
    if staff_data.bankCode is not None:
        staff.bankCode = staff_data.bankCode  # type: ignore[assignment]
    if staff_data.emergencyContactName is not None:
        staff.emergencyContactName = staff_data.emergencyContactName  # type: ignore[assignment]
    if staff_data.emergencyContactPhone is not None:
        staff.emergencyContactPhone = staff_data.emergencyContactPhone  # type: ignore[assignment]
    if staff_data.emergencyContactRelation is not None:
        staff.emergencyContactRelation = staff_data.emergencyContactRelation  # type: ignore[assignment]
    if staff_data.isActive is not None:
        if staff_data.isActive != staff.isActive:
            changes.append("isActive")
        staff.isActive = staff_data.isActive  # type: ignore[assignment]
    
    await db.commit()
    await db.refresh(staff)
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="UPDATE",
        entity_type="staff",
        entity_id=staff.staffId,
        entity_name=f"{staff.staffId} - {staff.title or ''}{staff.firstName} {staff.lastName}",
        description=f"แก้ไขข้อมูลพนักงานภายใน: {staff.staffId} - {staff.title or ''}{staff.firstName} {staff.lastName}",
        old_data=old_data,
        new_data={
            "staffId": staff.staffId,
            "title": staff.title,
            "firstName": staff.firstName,
            "lastName": staff.lastName,
            "idCardNumber": staff.idCardNumber,
            "birthDate": str(staff.birthDate) if staff.birthDate else None,
            "phone": staff.phone,
            "email": staff.email,
            "address": staff.address,
            "position": staff.position,
            "department": staff.department,
            "startDate": str(staff.startDate) if staff.startDate else None,
            "salary": str(staff.salary) if staff.salary else None,
            "bankAccountNo": staff.bankAccountNo,
            "bankCode": staff.bankCode,
            "emergencyContactName": staff.emergencyContactName,
            "emergencyContactPhone": staff.emergencyContactPhone,
            "emergencyContactRelation": staff.emergencyContactRelation,
            "isActive": staff.isActive
        },
        changes=changes if changes else None
    )
    
    return {
        "id": str(staff.id),
        "staffId": staff.staffId,
        "title": staff.title,
        "firstName": staff.firstName,
        "lastName": staff.lastName,
        "idCardNumber": staff.idCardNumber,
        "birthDate": staff.birthDate,
        "phone": staff.phone,
        "email": staff.email,
        "address": staff.address,
        "position": staff.position,
        "department": staff.department,
        "startDate": staff.startDate,
        "salary": staff.salary,
        "bankAccountNo": staff.bankAccountNo,
        "bankCode": staff.bankCode,
        "emergencyContactName": staff.emergencyContactName,
        "emergencyContactPhone": staff.emergencyContactPhone,
        "emergencyContactRelation": staff.emergencyContactRelation,
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
    
    # Store data for audit before deletion
    staff_id_code = staff.staffId
    staff_name = f"{staff.title or ''}{staff.firstName} {staff.lastName}"
    staff_data = {
        "staffId": staff.staffId,
        "firstName": staff.firstName,
        "lastName": staff.lastName,
        "phone": staff.phone,
        "email": staff.email,
        "position": staff.position,
        "isActive": staff.isActive
    }
    
    await db.delete(staff)
    await db.commit()
    
    # Create audit log
    await create_audit_log(
        db=db,
        current_user=current_user,
        action="DELETE",
        entity_type="staff",
        entity_id=staff_id_code,
        entity_name=staff_name,
        description=f"ลบพนักงานภายใน: {staff_id_code} - {staff_name}",
        old_data=staff_data
    )
    
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


# ========== SHIFT ENDPOINTS ==========

@router.get("/shifts", response_model=List[ShiftResponse])
async def get_shifts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shift).order_by(Shift.shiftCode))
    shifts = result.scalars().all()
    return [
        ShiftResponse(
            id=s.id,
            shiftCode=s.shiftCode,
            name=s.name,
            startTime=s.startTime.strftime("%H:%M") if s.startTime else None,
            endTime=s.endTime.strftime("%H:%M") if s.endTime else None,
            isActive=s.isActive,
            createdAt=s.createdAt
        ) for s in shifts
    ]


@router.post("/shifts", response_model=ShiftResponse, status_code=201)
async def create_shift(shift: ShiftCreate, db: AsyncSession = Depends(get_db)):
    from datetime import time as time_type
    
    result = await db.execute(select(Shift).where(Shift.shiftCode == shift.shiftCode))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="รหัสกะซ้ำ")
    
    # Parse time strings to time objects
    start_time = None
    end_time = None
    if shift.startTime:
        try:
            parts = shift.startTime.split(":")
            start_time = time_type(int(parts[0]), int(parts[1]))
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="รูปแบบเวลาเริ่มกะไม่ถูกต้อง (ใช้ HH:MM)")
    if shift.endTime:
        try:
            parts = shift.endTime.split(":")
            end_time = time_type(int(parts[0]), int(parts[1]))
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="รูปแบบเวลาสิ้นสุดกะไม่ถูกต้อง (ใช้ HH:MM)")
    
    new_shift = Shift(
        shiftCode=shift.shiftCode,
        name=shift.name,
        startTime=start_time,
        endTime=end_time,
        isActive=shift.isActive
    )
    db.add(new_shift)
    await db.commit()
    await db.refresh(new_shift)
    
    return ShiftResponse(
        id=new_shift.id,
        shiftCode=new_shift.shiftCode,
        name=new_shift.name,
        startTime=new_shift.startTime.strftime("%H:%M") if new_shift.startTime else None,
        endTime=new_shift.endTime.strftime("%H:%M") if new_shift.endTime else None,
        isActive=new_shift.isActive,
        createdAt=new_shift.createdAt
    )


@router.put("/shifts/{shift_id}", response_model=ShiftResponse)
async def update_shift(shift_id: int, shift: ShiftUpdate, db: AsyncSession = Depends(get_db)):
    from datetime import time as time_type
    
    result = await db.execute(select(Shift).where(Shift.id == shift_id))
    db_shift = result.scalar_one_or_none()
    if not db_shift:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลกะ")
    
    if shift.shiftCode and shift.shiftCode != db_shift.shiftCode:
        result = await db.execute(select(Shift).where(Shift.shiftCode == shift.shiftCode))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="รหัสกะซ้ำ")
        db_shift.shiftCode = shift.shiftCode
    
    if shift.name is not None:
        db_shift.name = shift.name
    if shift.startTime is not None:
        try:
            parts = shift.startTime.split(":")
            db_shift.startTime = time_type(int(parts[0]), int(parts[1]))
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="รูปแบบเวลาเริ่มกะไม่ถูกต้อง (ใช้ HH:MM)")
    if shift.endTime is not None:
        try:
            parts = shift.endTime.split(":")
            db_shift.endTime = time_type(int(parts[0]), int(parts[1]))
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="รูปแบบเวลาสิ้นสุดกะไม่ถูกต้อง (ใช้ HH:MM)")
    if shift.isActive is not None:
        db_shift.isActive = shift.isActive
    
    await db.commit()
    await db.refresh(db_shift)
    
    return ShiftResponse(
        id=db_shift.id,
        shiftCode=db_shift.shiftCode,
        name=db_shift.name,
        startTime=db_shift.startTime.strftime("%H:%M") if db_shift.startTime else None,
        endTime=db_shift.endTime.strftime("%H:%M") if db_shift.endTime else None,
        isActive=db_shift.isActive,
        createdAt=db_shift.createdAt
    )


@router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shift).where(Shift.id == shift_id))
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลกะ")
    
    # ตรวจสอบว่ากะถูกใช้ในตารางงานหรือไม่
    schedule_result = await db.execute(
        select(Schedule).where(Schedule.shifts.contains(shift.shiftCode)).limit(1)
    )
    has_schedule = schedule_result.scalar_one_or_none()
    
    if has_schedule:
        raise HTTPException(
            status_code=400, 
            detail="ไม่สามารถลบกะนี้ได้ เนื่องจากมีการใช้งานในตารางงานอยู่แล้ว"
        )
    
    # ตรวจสอบว่ากะถูกใช้ในหน่วยงานหรือไม่
    site_result = await db.execute(
        select(Site).where(Site.shiftAssignments.contains(shift.shiftCode)).limit(1)
    )
    has_site = site_result.scalar_one_or_none()
    
    if has_site:
        raise HTTPException(
            status_code=400, 
            detail="ไม่สามารถลบกะนี้ได้ เนื่องจากมีหน่วยงานที่ใช้กะนี้อยู่"
        )
    
    await db.delete(shift)
    await db.commit()
    return {"message": "ลบข้อมูลกะสำเร็จ"}