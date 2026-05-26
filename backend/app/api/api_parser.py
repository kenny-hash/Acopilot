from fastapi import APIRouter

from app.schemas.api_parser import ApiParseRequest, ApiParseResult
from app.services.api_parser_service import parse_api_source

router = APIRouter(prefix="/api/parser", tags=["api-parser"])


@router.post("/parse", response_model=ApiParseResult)
def parse_api(payload: ApiParseRequest) -> ApiParseResult:
    return parse_api_source(payload.content)
