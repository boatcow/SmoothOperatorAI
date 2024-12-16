from typing import Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from .config import Config
from . import firebase

analyst_system_prompt = """You are a moving services analyst. Your task is to:
1. Review all call transcripts
2. Compare quotes and services offered
3. Analyze the negotiation results
4. Make a final recommendation based on:
   - Price
   - Services included
   - Customer needs
   - Other factors (e.g., mover's reputation, reviews, etc.)

Format your response as a clear recommendation on who to choose with supporting evidence, if no clear evidence, respond with INCONCLUSIVE.
List the vendors you contacted and explain their differences on how you arrived at your final recommendation.
The final output should be in the following format:

Final Recomendation: Vendor name

**Rationale**
[Evidence supporting recommendation]
"""

class AnalystAgent:
    def __init__(self, user_id: str, model: str = Config.ANALYST_MODEL):
        self.llm = ChatOpenAI(model=model)
        self.user_id = user_id
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", analyst_system_prompt),
            ("human", "Customer Info: {customer_info}\nCall Transcripts: {transcripts}")
        ])

    def __call__(self, state: Dict) -> Dict:
        customer_info = state.get("customer_info", None)
        transcripts = state.get("call_transcripts", None)

        print(f"Analysing quotes")

        chain = self.prompt | self.llm
        response = chain.invoke({"customer_info": customer_info,"transcripts": transcripts})

        print(f"FINAL RECOMMENDATION: {response.content}")

        firebase.update_data(self.user_id, {
            "status": firebase.AppStatus.COMPLETED,
            "recommendation": response.content,
            # "messages": response,
        })

        return {
            "messages": response,
            "final_recommendation": response.content
        }