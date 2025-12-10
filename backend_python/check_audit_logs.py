import asyncio
from app.database import engine
from sqlalchemy import text  # type: ignore

async def check_audit_logs():
    async with engine.connect() as conn:
        # Check all audit logs for guards
        result = await conn.execute(
            text('''
                SELECT 
                    id,
                    action,
                    "entityType",
                    "entityId",
                    "entityName",
                    username,
                    "createdAt"
                FROM audit_logs 
                WHERE "entityType" = 'guards'
                ORDER BY "createdAt" DESC
                LIMIT 10
            ''')
        )
        rows = result.fetchall()
        
        print(f"\n{'='*80}")
        print(f"พบ Audit Logs สำหรับ Guards: {len(rows)} รายการ")
        print(f"{'='*80}\n")
        
        if len(rows) == 0:
            print("❌ ไม่มี audit logs สำหรับ guards เลย!")
            print("   แปลว่า:")
            print("   1. ยังไม่เคยมีการ CREATE/UPDATE/DELETE guard")
            print("   2. หรือ audit log ไม่ได้ถูกบันทึก\n")
        else:
            for i, row in enumerate(rows, 1):
                print(f"{i}. Action: {row[1]}")
                print(f"   Entity ID: {row[3]}")
                print(f"   Entity Name: {row[4]}")
                print(f"   User: {row[5]}")
                print(f"   Created: {row[6]}")
                print()
        
        # Check sample audit log data
        if len(rows) > 0:
            print(f"\n{'='*80}")
            print("ตัวอย่าง audit log แบบละเอียด (รายการแรก):")
            print(f"{'='*80}\n")
            
            result2 = await conn.execute(
                text('''
                    SELECT 
                        id,
                        action,
                        "entityId",
                        "entityName",
                        description,
                        "oldData",
                        "newData",
                        changes
                    FROM audit_logs 
                    WHERE "entityType" = 'guards'
                    ORDER BY "createdAt" DESC
                    LIMIT 1
                ''')
            )
            row = result2.fetchone()
            
            if row:
                print(f"ID: {row[0]}")
                print(f"Action: {row[1]}")
                print(f"Entity ID: {row[2]}")
                print(f"Entity Name: {row[3]}")
                print(f"Description: {row[4]}")
                print(f"\nOld Data: {row[5][:200] if row[5] else 'None'}...")
                print(f"\nNew Data: {row[6][:200] if row[6] else 'None'}...")
                print(f"\nChanges: {row[7][:200] if row[7] else 'None'}...")

if __name__ == "__main__":
    asyncio.run(check_audit_logs())
