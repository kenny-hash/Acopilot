from fastapi import APIRouter, HTTPException

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
