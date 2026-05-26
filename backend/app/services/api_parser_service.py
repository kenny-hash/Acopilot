import json
import re
import shlex
from urllib.parse import parse_qsl, urlparse

from app.schemas.api_parser import ApiEndpoint, ApiParam, ApiParseResult

_HTTP_METHODS = {"GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"}


def parse_api_source(content: str) -> ApiParseResult:
    text = (content or "").strip()
    if not text:
        return ApiParseResult(endpoints=[], warnings=["输入内容为空"])

    openapi_result = _try_parse_openapi(text)
    if openapi_result is not None:
        return openapi_result

    curl_result = _try_parse_curl(text)
    if curl_result is not None:
        return curl_result

    return ApiParseResult(endpoints=[], warnings=["无法识别输入格式：仅支持 OpenAPI JSON 或 cURL 文本"])


def _try_parse_openapi(text: str) -> ApiParseResult | None:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None

    if not isinstance(data, dict) or "paths" not in data:
        return None

    warnings: list[str] = []
    endpoints: list[ApiEndpoint] = []

    paths = data.get("paths")
    if not isinstance(paths, dict):
        return ApiParseResult(endpoints=[], warnings=["OpenAPI 的 paths 字段不是对象"])

    for path, methods in paths.items():
        if not isinstance(methods, dict):
            warnings.append(f"path {path} 的定义不是对象，已跳过方法解析")
            continue

        for method, operation in methods.items():
            normalized_method = str(method).upper()
            endpoint_warnings: list[str] = []
            if normalized_method not in _HTTP_METHODS:
                endpoint_warnings.append(f"method '{method}' 非标准 HTTP 方法")

            params: list[ApiParam] = []
            if isinstance(operation, dict):
                raw_params = operation.get("parameters", [])
                if isinstance(raw_params, list):
                    for idx, raw_param in enumerate(raw_params):
                        if not isinstance(raw_param, dict):
                            endpoint_warnings.append(f"参数[{idx}] 不是对象")
                            continue

                        location = str(raw_param.get("in", "unknown")).lower()
                        if location not in {"query", "path", "header"}:
                            endpoint_warnings.append(
                                f"参数 {raw_param.get('name', '<unknown>')} 的位置 '{location}' 暂不支持"
                            )

                        params.append(
                            ApiParam(
                                name=str(raw_param.get("name", "<unknown>")),
                                location=location,
                                required=bool(raw_param.get("required", False)),
                            )
                        )
                else:
                    endpoint_warnings.append("parameters 字段不是数组")
            else:
                endpoint_warnings.append("operation 定义不是对象")

            endpoints.append(
                ApiEndpoint(
                    method=normalized_method,
                    path=_normalize_path(path),
                    params=params,
                    body=None,
                    warnings=endpoint_warnings,
                )
            )

    return ApiParseResult(endpoints=endpoints, warnings=warnings)


def _try_parse_curl(text: str) -> ApiParseResult | None:
    if not text.lower().lstrip().startswith("curl"):
        return None

    warnings: list[str] = []

    try:
        tokens = shlex.split(text)
    except ValueError as exc:
        return ApiParseResult(endpoints=[], warnings=[f"cURL 解析失败: {exc}"])

    method = "GET"
    headers: list[ApiParam] = []
    body: str | None = None
    raw_url: str | None = None

    i = 0
    while i < len(tokens):
        token = tokens[i]
        if token == "-X" and i + 1 < len(tokens):
            method = tokens[i + 1].upper()
            i += 2
            continue
        if token.startswith("-X") and len(token) > 2:
            method = token[2:].upper()
            i += 1
            continue
        if token in {"-H", "--header"} and i + 1 < len(tokens):
            header = tokens[i + 1]
            name, _, _ = header.partition(":")
            headers.append(ApiParam(name=name.strip() or "<unknown>", location="header", required=False))
            i += 2
            continue
        if token in {"-d", "--data", "--data-raw", "--data-binary"} and i + 1 < len(tokens):
            body = tokens[i + 1]
            i += 2
            continue

        if token.startswith("http://") or token.startswith("https://"):
            raw_url = token
        i += 1

    if raw_url is None:
        warnings.append("未识别到 URL")
        path = ""
        query_params: list[ApiParam] = []
    else:
        parsed = urlparse(raw_url)
        path = parsed.path or "/"
        query_params = [ApiParam(name=name, location="query", required=False) for name, _ in parse_qsl(parsed.query)]

    if body is not None and method == "GET":
        warnings.append("GET 请求包含 body，已原样保留")

    if method not in _HTTP_METHODS:
        warnings.append(f"method '{method}' 非标准 HTTP 方法")

    endpoint = ApiEndpoint(method=method, path=path, params=[*query_params, *headers], body=body, warnings=warnings)
    return ApiParseResult(endpoints=[endpoint], warnings=[])


def _normalize_path(path: str) -> str:
    parsed = urlparse(str(path))
    if parsed.scheme or parsed.netloc:
        return parsed.path or "/"

    compact = re.sub(r"\s+", "", str(path))
    return compact if compact.startswith("/") else f"/{compact}"
