import json
from typing import Any

from fastapi import APIRouter, HTTPException

from app.schemas.api_parser import ApiEndpoint, ApiParseRequest, ApiParseResponse

router = APIRouter(prefix="/api/parser", tags=["parser"])


@router.post("/parse", response_model=ApiParseResponse)
def parse_api(payload: ApiParseRequest) -> ApiParseResponse:
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Input content cannot be empty")

    format_hint = payload.format_hint.lower().strip() if payload.format_hint else ""
    if format_hint and format_hint not in {"openapi", "curl", "raw"}:
        raise HTTPException(status_code=400, detail="Unsupported format_hint")

    try:
        endpoints, warnings = _parse_content(content, format_hint)
    except HTTPException:
        raise
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {exc.msg}") from exc

    if not endpoints:
        raise HTTPException(status_code=400, detail="Unable to recognize API format")

    return ApiParseResponse(endpoints=endpoints, warnings=warnings)


def _parse_content(content: str, format_hint: str) -> tuple[list[ApiEndpoint], list[str]]:
    if format_hint in {"openapi", "raw"} or (not format_hint and content.startswith("{")):
        try:
            doc = json.loads(content)
        except json.JSONDecodeError:
            if format_hint == "openapi":
                raise
        else:
            endpoints = _parse_openapi_document(doc)
            if endpoints:
                return endpoints, []
            if format_hint == "openapi":
                raise HTTPException(status_code=400, detail="Invalid OpenAPI document")

    if format_hint in {"curl", "raw"} or (not format_hint and "curl " in content.lower()):
        endpoint = _parse_curl(content)
        if endpoint:
            return [endpoint], []
        if format_hint == "curl":
            raise HTTPException(status_code=400, detail="Invalid curl command")

    if format_hint == "raw":
        raise HTTPException(status_code=400, detail="Unable to recognize raw content format")

    raise HTTPException(status_code=400, detail="Unable to recognize API format")


def _parse_openapi_document(doc: dict[str, Any]) -> list[ApiEndpoint]:
    paths = doc.get("paths")
    if not isinstance(paths, dict):
        return []

    allowed_methods = {"get", "post", "put", "patch", "delete", "options", "head", "trace"}
    endpoints: list[ApiEndpoint] = []

    for path, methods in paths.items():
        if not isinstance(path, str) or not isinstance(methods, dict):
            continue

        for method, operation in methods.items():
            if method.lower() not in allowed_methods or not isinstance(operation, dict):
                continue

            endpoints.append(
                ApiEndpoint(
                    path=path,
                    method=method.upper(),
                    summary=operation.get("summary"),
                    params=operation.get("parameters", [])
                    if isinstance(operation.get("parameters", []), list)
                    else [],
                    request_body=operation.get("requestBody")
                    if isinstance(operation.get("requestBody"), dict)
                    else None,
                    responses=operation.get("responses", {})
                    if isinstance(operation.get("responses", {}), dict)
                    else {},
                )
            )

    return endpoints


def _parse_curl(content: str) -> ApiEndpoint | None:
    text = content.strip()
    if not text.lower().startswith("curl "):
        return None

    tokens = text.replace("\\\n", " ").split()
    method = "GET"
    url = ""

    for idx, token in enumerate(tokens):
        upper_token = token.upper()
        if upper_token in {"-X", "--REQUEST"} and idx + 1 < len(tokens):
            method = tokens[idx + 1].upper()

        if token.startswith("http://") or token.startswith("https://"):
            url = token.strip("\"'")

    if not url:
        return None

    path = url.split("?", maxsplit=1)[0]
    if "/" in path.replace("https://", "", 1).replace("http://", "", 1):
        path = "/" + path.split("/", maxsplit=3)[-1]
    else:
        path = "/"

    return ApiEndpoint(
        path=path,
        method=method,
        summary="Parsed from curl",
        params=[],
        request_body=None,
        responses={},
    )
