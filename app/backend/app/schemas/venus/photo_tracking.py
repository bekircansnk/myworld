from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class PhotoRevisionBase(BaseModel):
    description: str
    revised_count: int

class PhotoRevisionCreate(PhotoRevisionBase):
    color_id: Optional[int] = None

class PhotoRevisionResponse(PhotoRevisionBase):
    id: int
    model_id: int
    color_id: Optional[int]
    revised_at: datetime
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PhotoModelColorBase(BaseModel):
    color_name: str
    ig_required: bool = True
    banner_required: bool = True
    revision_required: bool = True

class PhotoModelColorCreate(PhotoModelColorBase):
    pass

class PhotoModelColorUpdate(BaseModel):
    color_name: Optional[str] = None
    ig_required: Optional[bool] = None
    ig_completed: Optional[bool] = None
    ig_photo_count: Optional[int] = None
    banner_required: Optional[bool] = None
    banner_completed: Optional[bool] = None
    banner_photo_count: Optional[int] = None
    revision_required: Optional[bool] = None
    revision_completed: Optional[bool] = None
    revision_photo_count: Optional[int] = None

class PhotoModelColorResponse(PhotoModelColorBase):
    id: int
    model_id: int
    ig_completed: bool = False
    ig_completed_at: Optional[datetime] = None
    ig_photo_count: int = 0
    banner_completed: bool = False
    banner_completed_at: Optional[datetime] = None
    banner_photo_count: int = 0
    revision_completed: bool = False
    revision_completed_at: Optional[datetime] = None
    revision_photo_count: int = 0
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PhotoModelBase(BaseModel):
    sezon_kodu: Optional[str] = None
    model_name: str
    week_number: int = 1
    month: int
    year: int
    notes: Optional[str] = None

class PhotoModelCreate(PhotoModelBase):
    project_id: Optional[int] = None

class PhotoModelUpdate(BaseModel):
    sezon_kodu: Optional[str] = None
    model_name: Optional[str] = None
    week_number: Optional[int] = None
    month: Optional[int] = None
    year: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    delivery_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class PhotoModelResponse(PhotoModelBase):
    id: int
    user_id: int
    project_id: Optional[int]
    status: str
    delivery_date: Optional[datetime]
    completed_at: Optional[datetime]
    total_photos: int
    created_at: datetime
    updated_at: datetime
    
    colors: List[PhotoModelColorResponse] = []
    revisions: List[PhotoRevisionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class PhotoOverviewStats(BaseModel):
    total_models: int
    total_colors: int
    total_photos: int
    total_revisions: int
    
class PhotoExcelImportResponse(BaseModel):
    id: int
    file_name: str
    models_imported: int
    colors_imported: int
    status: str
    error_log: Optional[Any]
    imported_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
