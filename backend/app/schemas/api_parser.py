from pydantic import BaseModel, Field


class ApiParam(BaseModel):
    name: str = Field(..., description="参数名")
    location: str = Field(..., description="参数位置：query/path/header")
    required: bool = Field(default=False, description="是否必填")


class ApiEndpoint(BaseModel):
    method: str = Field(..., description="HTTP 方法，统一大写")
    path: str = Field(..., description="仅 URL path")
    params: list[ApiParam] = Field(default_factory=list, description="参数列表")
    body: str | None = Field(default=None, description="请求体")
    warnings: list[str] = Field(default_factory=list, description="当前 endpoint 的解析告警")


class ApiParseRequest(BaseModel):
    content: str = Field(..., min_length=1, description="OpenAPI JSON 或 cURL 文本")


class ApiParseResult(BaseModel):
    endpoints: list[ApiEndpoint] = Field(default_factory=list, description="解析出的 endpoint 列表")
    warnings: list[str] = Field(default_factory=list, description="全局告警")
