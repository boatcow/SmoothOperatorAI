
import os
from typing import List, Dict, Optional, TypedDict, Annotated, Tuple
from datetime import datetime
import operator
import json
from pydantic import BaseModel

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from graphviz import Digraph
from contextlib import contextmanager
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from itertools import chain

from typing import Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from firebase_admin.firestore import firestore

from .config import Config
from .state_models import CustomerInfo
from . import firebase

chat_system_prompt = """
You are an AI agent that helps in collection of information about the user in the home moving.
You need to gather:
1. Name
2. Contact phone number
3. Current address / zipcode,
4. Destination address / zipcode
5. Move out date
6. Move in date
7. Size of their apartment (number of bedrooms)
8. Inventory of their furniture and other discrete items or boxes
9. Whether packing assistance is needed
10. Any special items requiring special handling
11. Do they need storage (if move in date is more than 2 weeks away from move out)

Probe the user for information till you have everything you need. Be precise and keep the conversation short and to the point.
If the user provides vague information about anything, for example address, try to use general estimates / averages and ask for confirmation.
"""

class ChatAgent:
    def __init__(self, user_id: str, model: str = Config.CHAT_MODEL):
        self.llm = ChatOpenAI(model=model)
        self.user_id = user_id
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", chat_system_prompt),
            ("human", "{input}"),
        ])

    def __call__(self, state: Dict, config: RunnableConfig) -> Dict:
        # Check if we have all required information
        messages = state.get("messages", [])

        # Process the latest message
        chain = self.prompt | self.llm.bind_tools([CustomerInfo])
        response = chain.invoke({"input": messages})

        message_list = list(map(lambda x: { "role": "user" if isinstance(x, HumanMessage) else "assistant", "content": x.content }, messages))
        response_message = { "role": "assistant", "content": response.content if not response.tool_calls else "We have everything we need to get started on your quotes" }
        firebase.update_data(self.user_id, { "messages": message_list + [response_message] })

        customer_info = None
        if isinstance(response, AIMessage) and response.tool_calls:
            # if "DONE" in response.content:
            print("\n Information collected \n")
            customer_info = self._extract_customer_info(response.tool_calls[0]["args"])
            firebase.update_status(self.user_id, firebase.AppStatus.STRATEGIZING)

        # Update state with response
        return {
            "messages": response,
            "customer_info": customer_info
        }

    def _extract_customer_info(self, content: str) -> Dict:
        # Implementation to parse the structured summary into CustomerInfo object
        # This would parse the LLM's response when it has collected all information
        prompt = ChatPromptTemplate.from_messages([("human", """
            Summarzie the customer information.
            If the user does not provide zipcodes, infer them from the address / city. The addresses must have zipcodes.
            If the user doesn't provide inventory, assume it based on the size of the apartment.
            {request}
        """)])
        chain = prompt | self.llm.with_structured_output(CustomerInfo)
        customer_info: CustomerInfo = chain.invoke({"request": content})
        firebase.update_data(self.user_id, { "customerInfo": customer_info.model_dump() })
        return customer_info

