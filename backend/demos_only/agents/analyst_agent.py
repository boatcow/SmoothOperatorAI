from typing import Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

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
The final output should be in the following format:
FINAL VENDOR
[Vendor name, phone number]

RATIONALE
[Evidence supporting recommendation]
"""

class AnalystAgent:
    def __init__(self, model: str = Config.ANALYST_MODEL):
        self.llm = ChatOpenAI(model=model)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", analyst_system_prompt),
            ("human", "Customer Info: {customer_info}\nCall Transcripts: {transcripts}")
        ])

    def __call__(self, state: Dict) -> Dict:
        customer_info = state["customer_info"]
        transcripts = state["call_transcripts"]
        
        chain = self.prompt | self.llm
        response = chain.invoke({"customer_info": customer_info,"transcripts": transcripts})
        
        return {
            "final_recommendation": response.content
        } 