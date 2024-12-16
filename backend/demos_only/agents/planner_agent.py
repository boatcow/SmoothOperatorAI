import pandas as pd
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents.agent_types import AgentType
from langchain_openai import ChatOpenAI


planner_system_prompt = """You are a strategic moving consultant. Based on the customer requirements and available movers,
you need to create a detailed negotiation strategy that maximizes the customer's chances of getting the best price with good quality services.
Format your response as:

NEGOTIATION_STRATEGY:
[Detailed strategy for negotiating with each mover]"""

class PlannerAgent:
    def __init__(self, model: str = Config.PLANNER_MODEL, database_path: str = "data/movers_database.csv"):
        self.llm = ChatOpenAI(model=model)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", planner_system_prompt),
        ])
        self.movers_db = pd.read_csv(database_path)

    def __call__(self, state: Dict) -> Dict:
        customer_info = state["customer_info"]
        selected_movers = self._get_movers_data(customer_info)
        
        chain = self.prompt | self.llm
        chain_structured = self.llm.with_structured_output(NegotiationStrategy)

        response = chain_structured.invoke(
        """Please create a detailed description of the customer's needs and a corresponding negotiation strategy for the customer's moving needs. The customer information is the following: {customer_info}"""
        )
        
        
        return {
            "selected_movers": selected_movers,
            "negotiation_strategy": response
        }

    def _get_movers_data(self, customer_info: CustomerInfo) -> List[Dict]:
        #TODO: Implementation to read and format movers data from CSV, could use create_pandas_dataframe_agent... This is hardcoded for now
        return {"mover_1":{"name":"mover_1","phone":"123-456-7890","rationale":"mover_1 is the best mover because..."},
                "mover_2":{"name":"mover_2","phone":"123-456-7890","rationale":"mover_2 is the second best mover because..."},
                "mover_3":{"name":"mover_3","phone":"123-456-7890","rationale":"mover_3 is the third best mover because..."}}
