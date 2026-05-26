from fastapi import APIRouter, HTTPException

from app.schemas.agent import AgentConfigCreate, AgentConfigOut, AgentConfigUpdate

router = APIRouter(prefix="/api/agents", tags=["agents"])

# 注意：当前平台仅提供 Agent 配置管理能力。
# 暂不集成“执行用例”功能，因此不会提供执行相关接口。
_agents_store: dict[int, AgentConfigOut] = {}
_agent_id_counter = 0


@router.get("", response_model=list[AgentConfigOut])
def list_agents() -> list[AgentConfigOut]:
    return list(_agents_store.values())


@router.post("", response_model=AgentConfigOut, status_code=201)
def create_agent(payload: AgentConfigCreate) -> AgentConfigOut:
    global _agent_id_counter
    _agent_id_counter += 1
    created = AgentConfigOut(id=_agent_id_counter, **payload.model_dump())
    _agents_store[created.id] = created
    return created


@router.put("/{agent_id}", response_model=AgentConfigOut)
def update_agent(agent_id: int, payload: AgentConfigUpdate) -> AgentConfigOut:
    existing = _agents_store.get(agent_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Agent config not found")

    updated_data = existing.model_dump()
    updated_data.update(payload.model_dump(exclude_unset=True))
    updated = AgentConfigOut(**updated_data)
    _agents_store[agent_id] = updated
    return updated


@router.delete("/{agent_id}", status_code=204)
def delete_agent(agent_id: int) -> None:
    if agent_id not in _agents_store:
        raise HTTPException(status_code=404, detail="Agent config not found")
    _agents_store.pop(agent_id)
