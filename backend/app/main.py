from fastapi import FastAPI

from app.api.agents import router as agents_router
from app.api.cases import router as cases_router
from app.api.api_parser import router as api_parser_router

app = FastAPI(
    title="Acopilot Backend API",
    description="用例与 Agent 配置管理接口。当前版本不包含用例执行能力。",
    version="0.1.0",
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(cases_router)
app.include_router(agents_router)
app.include_router(api_parser_router)
