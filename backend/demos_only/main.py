from typing import Dict
from langgraph.graph import StateGraph, END
from agents.chat_agent import ChatAgent
from agents.planner_agent import PlannerAgent
from agents.voice_agent import VoiceAgent
from agents.analyst_agent import AnalystAgent
from models.state import State

def create_moving_assistant():
    # Initialize agents
    chat_agent = ChatAgent()
    planner_agent = PlannerAgent()
    voice_agent = VoiceAgent()
    analyst_agent = AnalystAgent()

    # Create workflow graph
    workflow = StateGraph(State)

    # Add nodes
    workflow.add_node("chat", chat_agent)
    workflow.add_node("planner", planner_agent)
    workflow.add_node("voice", voice_agent)
    workflow.add_node("analyst", analyst_agent)

    # Define edges
    def should_continue_chat(state: State):
        return "chat" if not state.get("customer_info") else "planner"

    def should_make_calls(state: State):
        return "voice" if state.get("selected_movers") else END

    def should_analyze(state: State):
        return "analyst" if state.get("call_transcripts") else END

    # Add edges
    workflow.add_edge("chat", should_continue_chat)
    workflow.add_edge("planner", should_make_calls)
    workflow.add_edge("voice", should_analyze)
    workflow.add_edge("analyst", END)

    # Set entry point
    workflow.set_entry_point("chat")

    return workflow.compile()

def main():
    # Create the assistant
    assistant = create_moving_assistant()

    # Example usage
    config = {"configurable": {"session_id": "example_session"}}
    
    for step in assistant.stream({
        "messages": [("human", "Hi, I need help finding a mover")]
    }, config):
        # Process each step
        print(step)

if __name__ == "__main__":
    main() 