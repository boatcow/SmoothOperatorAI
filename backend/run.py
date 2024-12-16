from langchain_core.messages import HumanMessage
import uuid
from agents.agent_graph import AgentGraph

agent_graph = AgentGraph()
# I want to move from SF to Miami, help me find the top 5 movers. My current address is 825 Menlo Ave, Menlo Park, CA 94002, my destinatin is 200 first street, Miami. I plan to move on Dec 10, 2024. I'm moving from a studio with 500 sq ft, no special items. I need help with packing and loading. My name is Dean, and my phone number is 650-321-4321.
config = {"configurable": {"thread_id": str(uuid.uuid4())}}

while True:
    user = input("User (q/Q to quit): ")
    if user in {"q", "Q"}:
        print("Ai: Byebye")
        break
    output = None
    results = agent_graph.graph.invoke({"messages": [HumanMessage(content=user)]}, config=config)
    print(f"RESULT: {results['messages'][-1].content}")