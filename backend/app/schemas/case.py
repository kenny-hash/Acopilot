from pydantic import BaseModel, ConfigDict, Field


class CaseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="用例名称")
    preconditions: str = Field(..., min_length=1, description="预置条件")
    steps: str = Field(..., min_length=1, description="测试步骤")
    expected_result: str = Field(..., min_length=1, description="预期结果")


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200, description="用例名称")
    preconditions: str | None = Field(None, min_length=1, description="预置条件")
    steps: str | None = Field(None, min_length=1, description="测试步骤")
    expected_result: str | None = Field(None, min_length=1, description="预期结果")


class CaseOut(CaseBase):
    id: int = Field(..., ge=1, description="用例编号")

    model_config = ConfigDict(from_attributes=True)
