from typing import Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig

chat_system_prompt = """You are a helpful moving assistant that collects necessary information from customers.
You need to gather:
1. Name
2. Current address
3. Contact phone number 
4. Destination address
5. Move date
6. Room type (studio, 1-bedroom, etc.)
7. Whether packing assistance is needed 
8. Any special items requiring special handling

Once you have all information, format it into a structured summary and indicate completion with DONE.
If any information is missing, ask for it politely."""

class ChatAgent:
    def __init__(self, model: str = Config.CHAT_MODEL):
        self.llm = ChatOpenAI(model=model)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", chat_system_prompt),
            ("human", "{input}"),
        ])

    def __call__(self, state: Dict, config: RunnableConfig) -> Dict:
            # Check if we have all required information
        messages = state.get("messages", [])
        
        # Process the latest message
        chain = self.prompt | self.llm
        response = chain.invoke({"input": messages})
        
        # Update state with response
        return {
            "messages": response,
            "customer_info": self._extract_customer_info(response.content) if "DONE" in response.content else None
        }


    def _extract_customer_info(self, content: str) -> Dict:
        # Implementation to parse the structured summary into CustomerInfo object
        # This would parse the LLM's response when it has collected all information
        structured_llm = self.llm.with_structured_output(CustomerInfo)
        return structured_llm.invoke("Summarize the previous conversation")

