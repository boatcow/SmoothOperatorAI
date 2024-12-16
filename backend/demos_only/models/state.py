from typing import List, Dict, Optional, TypedDict, Annotated, Tuple
from datetime import datetime
from pydantic import BaseModel
from langgraph.graph.message import add_messages

class CustomerInfo(BaseModel):
    name: str
    current_address: str
    destination_address: str
    move_date: datetime
    room_type: str
    packing_assistance: bool
    special_items: Optional[str] = None

class MoverInfo(BaseModel):
    name: str
    phone: str
    rating: float
    specialties: List[str]
    base_price_range: Tuple[float, float]

class CallTranscript(BaseModel):
    mover_name: str
    quoted_price: float
    negotiated_price: float
    services_included: List[str]
    notes: str

class State(TypedDict):
    """State of the moving assistant"""
    messages: Annotated[list, add_messages]  # tracks conversation
    customer_info: Optional[CustomerInfo]
    selected_movers: Optional[List[MoverInfo]]
    negotiation_strategy: Optional[str]
    call_transcripts: Optional[List[CallTranscript]]
    final_recommendation: Optional[str] 