from pydantic import BaseModel, ConfigDict, Field


class AgentConfigBase(BaseModel):
    agent_name: str = Field(..., min_length=1, max_length=100, description="Agent 名称")
    provider: str = Field(..., min_length=1, max_length=50, description="模型提供商")
    model: str = Field(..., min_length=1, max_length=100, description="模型名称")
    temperature: float = Field(0.2, ge=0.0, le=2.0, description="采样温度")
    max_tokens: int = Field(1024, ge=1, le=128000, description="最大输出 token 数")
    system_prompt: str = Field("", description="系统提示词")
    enabled: bool = Field(True, description="是否启用")
    timeout_seconds: int = Field(60, ge=1, le=3600, description="超时时间（秒）")


class AgentConfigCreate(AgentConfigBase):
    pass


class AgentConfigUpdate(BaseModel):
    agent_name: str | None = Field(None, min_length=1, max_length=100)
    provider: str | None = Field(None, min_length=1, max_length=50)
    model: str | None = Field(None, min_length=1, max_length=100)
    temperature: float | None = Field(None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(None, ge=1, le=128000)
    system_prompt: str | None = None
    enabled: bool | None = None
    timeout_seconds: int | None = Field(None, ge=1, le=3600)


class AgentConfigOut(AgentConfigBase):
    id: int = Field(..., ge=1, description="配置编号")

    model_config = ConfigDict(from_attributes=True)
