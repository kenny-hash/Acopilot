from pydantic import BaseModel, Field


class TaskStepResult(BaseModel):
    case_id: int
    step_index: int
    status: str
    message: str


class TestTaskBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    environment: str = Field(min_length=1, max_length=80)
    collection_id: int
    strategy_id: int | None = None
    case_ids: list[int] = Field(default_factory=list)
    allow_high_risk: bool = False
    auto_cleanup: bool = True
    retry_on_fail: bool = False


class TestTaskCreate(TestTaskBase):
    pass


class TestTaskOut(TestTaskBase):
    id: int
    status: str
    summary: dict[str, int]
    step_results: list[TaskStepResult]
