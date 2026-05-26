from pydantic import BaseModel, Field


class EnvironmentBase(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    base_url: str = Field(min_length=1, max_length=255)
    auth_type: str = Field(default='none')
    token: str = ''
    verify_tls: bool = True
    timeout_seconds: int = Field(default=30, ge=1, le=300)
    enabled: bool = True
    description: str = ''


class EnvironmentCreate(EnvironmentBase):
    pass


class EnvironmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    base_url: str | None = Field(default=None, min_length=1, max_length=255)
    auth_type: str | None = None
    token: str | None = None
    verify_tls: bool | None = None
    timeout_seconds: int | None = Field(default=None, ge=1, le=300)
    enabled: bool | None = None
    description: str | None = None


class EnvironmentOut(EnvironmentBase):
    id: int
