from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.agents import router as agents_router
from app.api.cases import router as cases_router
from app.api.api_parser import router as api_parser_router
from app.api.collections import router as collections_router
from app.api.strategies import router as strategies_router
from app.api.tasks import router as tasks_router

app = FastAPI(
    title="Acopilot Backend API",
    description="用例与 Agent 配置管理接口。当前版本不包含用例执行能力。",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8088",
        "http://localhost:8088",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(cases_router)
app.include_router(agents_router)

app.include_router(api_parser_router)
app.include_router(collections_router)
app.include_router(strategies_router)
app.include_router(tasks_router)
