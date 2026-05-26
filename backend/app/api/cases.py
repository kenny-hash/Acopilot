from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from openpyxl import load_workbook

from app.schemas.case import CaseCreate, CaseOut, CaseUpdate

router = APIRouter(prefix="/api/cases", tags=["cases"])

_cases_store: dict[int, CaseOut] = {}
_case_id_counter = 0


@router.get("", response_model=list[CaseOut])
def list_cases() -> list[CaseOut]:
    return list(_cases_store.values())


@router.post("", response_model=CaseOut, status_code=201)
def create_case(payload: CaseCreate) -> CaseOut:
    global _case_id_counter
    _case_id_counter += 1
    created = CaseOut(id=_case_id_counter, **payload.model_dump())
    _cases_store[created.id] = created
    return created


@router.put("/{case_id}", response_model=CaseOut)
def update_case(case_id: int, payload: CaseUpdate) -> CaseOut:
    existing = _cases_store.get(case_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Case not found")

    updated_data = existing.model_dump()
    updated_data.update(payload.model_dump(exclude_unset=True))
    updated = CaseOut(**updated_data)
    _cases_store[case_id] = updated
    return updated


@router.delete("/{case_id}", status_code=204)
def delete_case(case_id: int) -> None:
    if case_id not in _cases_store:
        raise HTTPException(status_code=404, detail="Case not found")
    _cases_store.pop(case_id)


@router.post("/import", response_model=list[CaseOut], status_code=201)
async def import_cases(file: UploadFile = File(...)) -> list[CaseOut]:
    global _case_id_counter

    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Only .xlsx/.xlsm files are supported")

    payload = await file.read()
    workbook = load_workbook(filename=BytesIO(payload), read_only=True, data_only=True)
    sheet = workbook.active

    header_row = next(sheet.iter_rows(min_row=1, max_row=1, values_only=True), None)
    if header_row is None:
        workbook.close()
        raise HTTPException(status_code=400, detail="Excel file is empty")

    normalized_headers = [str(cell).strip().lower() if cell is not None else "" for cell in header_row]
    data_headers = normalized_headers[1:]
    header_aliases: dict[str, tuple[str, ...]] = {
        "name": ("name", "名称", "用例名称"),
        "code": ("code", "编号", "用例编号"),
        "precondition": ("precondition", "前置条件", "预置条件"),
        "steps": ("steps", "步骤", "测试步骤"),
        "expected": ("expected", "预期", "预期结果"),
    }
    header_index: dict[str, int] = {}
    for field, aliases in header_aliases.items():
        for i, header in enumerate(data_headers):
            if header and header in aliases:
                header_index[field] = i
                break

    def _get_cell(cells: tuple, field: str, fallback_index: int) -> str:
        index = header_index.get(field, fallback_index)
        if index >= len(cells) or cells[index] is None:
            return ""
        return str(cells[index]).strip()

    imported: list[CaseOut] = []
    for idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        if row is None:
            continue

        # 第一列是 Depth，不参与导入字段映射
        row_data = row[1:] if len(row) > 1 else tuple()
        name = _get_cell(row_data, "name", 0)
        if not name:
            continue

        code = str(row[1]).strip() if len(row) > 1 and row[1] is not None else ""
        precondition = str(row[2]).strip() if len(row) > 2 and row[2] is not None else ""
        steps = str(row[3]).strip() if len(row) > 3 and row[3] is not None else ""
        expected = str(row[4]).strip() if len(row) > 4 and row[4] is not None else ""
        if not steps or not expected:
            # CaseOut 要求 steps / expected 最少 1 个字符；缺失时跳过该行，避免 500
            continue

        _case_id_counter += 1
        created = CaseOut(
            id=_case_id_counter,
            name=name,
            code=code,
            precondition=precondition,
            steps=steps,
            expected=expected,
        )
        _cases_store[created.id] = created
        imported.append(created)

    workbook.close()

    if not imported:
        raise HTTPException(status_code=400, detail="No valid case rows found in the Excel file")

    return imported
