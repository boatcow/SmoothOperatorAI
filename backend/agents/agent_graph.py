from typing import Dict
from langgraph.graph import StateGraph, END

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from .state_models import State
from .chat_agent import ChatAgent
from .strategist_agent import StrategistAgent
from .voice_agent import VoiceAgent
from .analyst_agent import AnalystAgent
from . import firebase

class AgentGraph:

    def __init__(self, user_id = 'user1'):
        self.user_id = user_id

        # Initialize agents
        chat_agent = ChatAgent(user_id)
        strategist_agent = StrategistAgent(user_id)
        voice_agent = VoiceAgent(user_id)
        analyst_agent = AnalystAgent(user_id)

        # Create workflow graph
        workflow = StateGraph(State)

        # Add nodes
        workflow.add_node("chat", chat_agent)
        workflow.add_node("strategist", strategist_agent)
        workflow.add_node("voice", voice_agent)
        workflow.add_node("analyst", analyst_agent)

        # define when to continue the chat, or move on to the strategist agent
        def should_continue_chat(state: State) -> str:
            if state.get("customer_info"):
                return "strategist"
            elif not isinstance(state.get("messages")[-1], HumanMessage):
                return END
            return "chat"

        # define when to make calls
        def should_make_calls(state: State) -> str:
            if state.get("selected_movers"):
                print("\n MOVING ON TO VOICE AGENT \n")
                return "voice"
            return "strategist"

        # define when to analyze the call transcripts
        def should_analyze(state: State) -> str:
            if state.get("call_transcripts"):
                print("\n MOVING ON TO ANALYST \n")
                return "analyst"
            return END


        # Add edges
        workflow.add_conditional_edges("chat", should_continue_chat, ["chat", "strategist", END])
        workflow.add_conditional_edges("strategist", should_make_calls, ["voice"])
        workflow.add_conditional_edges("voice", should_analyze, ["analyst"])
        workflow.add_edge("analyst", END)

        # Set entry point
        workflow.set_entry_point("chat")

        memory = MemorySaver() # to change this into a sqlitessaver and connect to the DB
        self.graph = workflow.compile(checkpointer=memory) #, interrupt_before=["tools"]

        firebase.update_data(self.user_id, data = { "status": firebase.AppStatus.INFO_COLLECTION }, merge=False)


if __name__ == "__main__":

    # I want to move from SF to Miami, help me find the top 5 movers. My current address is 825 Menlo Ave, Menlo Park, CA 94002, my destinatin is 200 first street, Miami. I plan to move on Dec 10, 2024. I'm moving from a studio with 500 sq ft, no special items. I need help with packing and loading. My name is Dean, and my phone number is 650-321-4321.
    import uuid
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    agent_graph = AgentGraph()
    while True:
        user = input("User (q/Q to quit): ")
        if user in {"q", "Q"}:
            print("Ai: Byebye")
            break
        output = None
        results = agent_graph.graph.invoke({"messages": [HumanMessage(content=user)]}, config=config)
        print(f"RESULT: {results['messages'][-1].content}")
