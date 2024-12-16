from typing import List, Dict, Optional, TypedDict, Annotated, Tuple
from datetime import datetime
from pydantic import BaseModel, Field
from langgraph.graph.message import add_messages

class CustomerInfo(BaseModel):
    name: str = Field(description="The name of the customer")
    phone: str = Field(description="The phone number of the customer")
    current_address: str = Field(description="The current address of the customer")
    destination_address: str = Field(description="The destination address of the customer")
    is_long_distance: bool = Field(description="Is the move long distance")
    move_in_date: datetime = Field(description="The move out date of the customer")
    move_out_date: datetime = Field(description="The move in date of the customer")
    storage_required: bool = Field(description="Does the customer needs storage")
    apartment_size: str = Field(description="The apartment size of the customer")
    inventory: List[str] = Field(description="The inventory of the customer")
    packing_assistance: bool = Field(description="Does the customer needs packing assistance")
    special_items: str = Field(description="Any special items the customer needs to move")

class MoverInfo(BaseModel):
    name: str = Field(description="The name of the mover")
    phone: str = Field(description="The phone number of the mover")
    specialties: List[str] = Field(description="The specialties of the mover")
    base_price_range: Tuple[float, float] = Field(description="The min and max price of the mover")

class FilteredMovers(BaseModel):
    rationale: str = Field(description="Rationale for filtering the movers")
    movers: List[str] = Field(description="List of filtered movers")

class NegotiationStrategy(BaseModel):
    customer_info: CustomerInfo = Field(description="The customer information")
    negotiation_script: str = Field(description="The script of the negotiation")

class CallTranscript(BaseModel):
    mover_name: str = Field(description="The name of the mover")
    negotiated_price: float = Field(description="The lowestquoted price of the mover")
    services_included: List[str] = Field(description="The services included in the move")
    notes: str = Field(description="Any additional notes from the call")

class State(TypedDict):
    """State of the moving assistant"""
    messages: Annotated[list, add_messages]  # Tracks conversation
    customer_info: Optional[CustomerInfo] # To populate from the chat agent
    selected_movers: Optional[List[MoverInfo]] # To populate from the planner agent
    negotiation_strategy: Optional[str] # To populate from the planner agent
    summary_of_call_transcripts: Optional[str] # To populate from the planner agent
    call_transcripts: Optional[List[CallTranscript]] # To populate from the voice agent
    final_recommendation: Optional[str] # To populate from the analyst agent
    number_of_calls: Optional[int] = Field(description="The number of calls made to movers")