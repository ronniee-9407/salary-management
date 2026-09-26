import time
import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging_config import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "127.0.0.1"
        endpoint_name = request.url.path.strip("/").replace("/", ".") or "root"
        
        # Extract query parameters
        params_dict = dict(request.query_params)
        params_str = ",".join(params_dict.keys()) if params_dict else "{}"
        
        # Read body safely without breaking FastAPI stream
        body_dict = {}
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    body_dict = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                body_dict = {}

        # Log Endpoint Entry matching exact user log format
        logger.info(
            f"endpoint.{endpoint_name} entered ip={client_ip} body={body_dict} params={params_str}",
            extra={"event": "app.subprocess.log"}
        )

        response = await call_next(request)

        duration_ms = round((time.time() - start_time) * 1000, 2)
        
        # Log Endpoint Completion
        logger.info(
            f"endpoint.{endpoint_name} completed status={response.status_code} duration={duration_ms}ms",
            extra={"event": "app.subprocess.log"}
        )

        return response
