from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class PollCreate(BaseModel):
    question: str
    options: List[str]

class PollResponseSubmit(BaseModel):
    poll_id: int
    option: str

class PollResponse(BaseModel):
    id: int
    session_id: int
    question: str
    options: List[str]
    status: str
    created_at: datetime
    total_votes: int = 0
    tally: Dict[str, int] = {}
    percentages: Dict[str, float] = {}
    user_selected_option: Optional[str] = None

    class Config:
        from_attributes = True
