import os
import py_compile
import sys

print("Starting syntax check...")
has_error = False

for root, dirs, files in os.walk("."):
    if "venv" in root or "__pycache__" in root:
        continue
    for file in files:
        if file.endswith(".py"):
            path = os.path.join(root, file)
            try:
                py_compile.compile(path, doraise=True)
            except py_compile.PyCompileError as e:
                print(f"\n❌ SYNTAX ERROR in file: {path}")
                print(e)
                has_error = True
            except Exception as e:
                print(f"\n❌ ERROR checking file: {path}")
                print(e)
                has_error = True

if not has_error:
    print("\n✅ No syntax errors found in Python files.")
else:
    print("\n❌ Found syntax errors.")
