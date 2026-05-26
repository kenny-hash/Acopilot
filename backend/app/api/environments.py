from fastapi import APIRouter, HTTPException

from app.schemas.environment import EnvironmentCreate, EnvironmentOut, EnvironmentUpdate

router = APIRouter(prefix='/api/environments', tags=['environments'])
_store: dict[int, EnvironmentOut] = {}
_counter = 0


def _normalize_base_url(url: str) -> str:
    normalized = url.strip().rstrip('/')
    if not normalized.startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail='base_url must start with http:// or https://')
    return normalized


def _validate_auth(auth_type: str, token: str) -> None:
    if auth_type not in {'none', 'bearer'}:
        raise HTTPException(status_code=400, detail='auth_type only supports none/bearer')
    if auth_type == 'bearer' and not token.strip():
        raise HTTPException(status_code=400, detail='token is required when auth_type=bearer')


def _ensure_unique_name(name: str, exclude_id: int | None = None) -> None:
    lowered = name.strip().lower()
    for env_id, item in _store.items():
        if exclude_id is not None and env_id == exclude_id:
            continue
        if item.name.strip().lower() == lowered:
            raise HTTPException(status_code=409, detail='Environment name already exists')


@router.get('', response_model=list[EnvironmentOut])
def list_envs() -> list[EnvironmentOut]:
    return list(_store.values())


@router.post('', response_model=EnvironmentOut, status_code=201)
def create_env(payload: EnvironmentCreate) -> EnvironmentOut:
    global _counter
    _ensure_unique_name(payload.name)
    base_url = _normalize_base_url(payload.base_url)
    _validate_auth(payload.auth_type, payload.token)

    _counter += 1
    item = EnvironmentOut(id=_counter, **payload.model_dump(), base_url=base_url)
    _store[item.id] = item
    return item


@router.put('/{env_id}', response_model=EnvironmentOut)
def update_env(env_id: int, payload: EnvironmentUpdate) -> EnvironmentOut:
    existing = _store.get(env_id)
    if existing is None:
        raise HTTPException(status_code=404, detail='Environment not found')

    data = existing.model_dump()
    data.update(payload.model_dump(exclude_unset=True))
    _ensure_unique_name(data['name'], exclude_id=env_id)
    data['base_url'] = _normalize_base_url(data['base_url'])
    _validate_auth(data['auth_type'], data['token'])

    updated = EnvironmentOut(**data)
    _store[env_id] = updated
    return updated


@router.delete('/{env_id}', status_code=204)
def delete_env(env_id: int) -> None:
    if env_id not in _store:
        raise HTTPException(status_code=404, detail='Environment not found')
    _store.pop(env_id)
