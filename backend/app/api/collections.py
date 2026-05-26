from fastapi import APIRouter, HTTPException
from app.schemas.collection import TestCollectionCreate, TestCollectionOut, TestCollectionUpdate

router = APIRouter(prefix="/api/collections", tags=["collections"])
_store: dict[int, TestCollectionOut] = {}
_counter = 0

@router.get("", response_model=list[TestCollectionOut])
def list_collections() -> list[TestCollectionOut]:
    return list(_store.values())

@router.post("", response_model=TestCollectionOut, status_code=201)
def create_collection(payload: TestCollectionCreate) -> TestCollectionOut:
    global _counter
    _counter += 1
    item = TestCollectionOut(id=_counter, **payload.model_dump())
    _store[item.id] = item
    return item

@router.put('/{item_id}', response_model=TestCollectionOut)
def update_collection(item_id: int, payload: TestCollectionUpdate) -> TestCollectionOut:
    existing = _store.get(item_id)
    if existing is None:
        raise HTTPException(status_code=404, detail='Collection not found')
    data = existing.model_dump()
    data.update(payload.model_dump(exclude_unset=True))
    updated = TestCollectionOut(**data)
    _store[item_id] = updated
    return updated

@router.delete('/{item_id}', status_code=204)
def delete_collection(item_id: int) -> None:
    if item_id not in _store:
        raise HTTPException(status_code=404, detail='Collection not found')
    _store.pop(item_id)
