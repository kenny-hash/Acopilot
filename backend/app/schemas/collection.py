from pydantic import BaseModel, Field


class TestCollectionBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    version: str = Field(min_length=1, max_length=40)
    source: str = Field(default="openapi")
    status: str = Field(default="draft")
    description: str = ""


class TestCollectionCreate(TestCollectionBase):
    pass


class TestCollectionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    version: str | None = Field(default=None, min_length=1, max_length=40)
    source: str | None = None
    status: str | None = None
    description: str | None = None


class TestCollectionOut(TestCollectionBase):
    id: int
