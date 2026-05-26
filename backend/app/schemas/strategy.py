from pydantic import BaseModel, Field


class TestStrategyBase(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    strategy_type: str = Field(min_length=1, max_length=40)
    collection_id: int
    case_ids: list[int] = Field(default_factory=list)
    risk_only: bool = False


class TestStrategyCreate(TestStrategyBase):
    pass


class TestStrategyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    strategy_type: str | None = None
    collection_id: int | None = None
    case_ids: list[int] | None = None
    risk_only: bool | None = None


class TestStrategyOut(TestStrategyBase):
    id: int
