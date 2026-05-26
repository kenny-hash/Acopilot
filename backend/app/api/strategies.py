from fastapi import APIRouter, HTTPException
from app.schemas.strategy import TestStrategyCreate, TestStrategyOut, TestStrategyUpdate

router = APIRouter(prefix="/api/strategies", tags=["strategies"])
_store: dict[int, TestStrategyOut] = {}
_counter = 0

@router.get('', response_model=list[TestStrategyOut])
def list_strategies() -> list[TestStrategyOut]:
    return list(_store.values())

@router.post('', response_model=TestStrategyOut, status_code=201)
def create_strategy(payload: TestStrategyCreate) -> TestStrategyOut:
    global _counter
    _counter += 1
    item = TestStrategyOut(id=_counter, **payload.model_dump())
    _store[item.id] = item
    return item

@router.put('/{item_id}', response_model=TestStrategyOut)
def update_strategy(item_id: int, payload: TestStrategyUpdate) -> TestStrategyOut:
    existing = _store.get(item_id)
    if existing is None:
        raise HTTPException(status_code=404, detail='Strategy not found')
    data = existing.model_dump()
    data.update(payload.model_dump(exclude_unset=True))
    updated = TestStrategyOut(**data)
    _store[item_id] = updated
    return updated

@router.delete('/{item_id}', status_code=204)
def delete_strategy(item_id: int) -> None:
    if item_id not in _store:
        raise HTTPException(status_code=404, detail='Strategy not found')
    _store.pop(item_id)
