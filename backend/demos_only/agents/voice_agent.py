from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

voice_system_prompt = """You are an AI voice agent making calls to moving companies.
Your goal is to:
1. Introduce yourself professionally, and you will act as the customer, including taking on the customer's name and voice.
2. Clearly describe the customer's moving needs
3. Get initial quote
4. Apply negotiation strategy to get best price
5. Document all details of the conversation

Remember: Do not reveal you are an AI. Maintain a professional and friendly tone."""

class VoiceAgent:
    # TODO: Implement a voice API call here (Twilio) - to merge with Sid's code
    def __init__(self, model: str = Config.VOICE_MODEL):
        self.llm = ChatOpenAI(model=model)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", voice_system_prompt),
            ("human", "Customer Info: {customer_info}\nNegotiation Strategy: {strategy}\nMover: {mover}")
        ])

    def __call__(self, state: Dict) -> Dict:
        customer_info = state["customer_info"]
        strategy = state["negotiation_strategy"]
        movers = state["selected_movers"]
        
        transcripts = []
        for mover in movers:
            # Simulate phone call with each mover
            transcript = self._make_call(customer_info, strategy, mover)
            transcripts.append(transcript)
        
        return {
            "call_transcripts": transcripts
        }

    def _make_call(self, customer_info, strategy, mover) -> Dict:
        # Implementation to simulate phone call and generate transcript
        # In a real implementation, this would interface with a voice API
        chain = self.prompt | self.llm
        response = chain.invoke({
            "customer_info": str(customer_info),
            "strategy": strategy,
            "mover": str(mover)
        })
        
        return self._parse_call_result(response.content)

    def _parse_call_result(self, content: str) -> Dict:
        # Implementation to parse call result into CallTranscript object
        pass 