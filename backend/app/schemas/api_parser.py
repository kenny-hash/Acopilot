from typing import Any

from pydantic import BaseModel, Field


class ApiParseRequest(BaseModel):
    content: str = Field(..., description="待解析的 API 文本内容")
    format_hint: str | None = Field(
        None,
        description="可选格式提示，支持 openapi|curl|raw",
    )


class ApiEndpoint(BaseModel):
    path: str
    method: str
    summary: str | None = None
    params: list[dict[str, Any]] = Field(default_factory=list)
    request_body: dict[str, Any] | None = None
    responses: dict[str, Any] = Field(default_factory=dict)


class ApiParseResponse(BaseModel):
    endpoints: list[ApiEndpoint] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
