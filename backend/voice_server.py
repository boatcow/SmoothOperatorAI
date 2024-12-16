import os
import json
import base64
import asyncio
import websockets
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.websockets import WebSocketDisconnect
from fastapi import BackgroundTasks
# from twilio.twiml.voice_response import VoiceResponse, Connect, Say, Stream
from twilio.twiml.voice_response import VoiceResponse, Gather, Connect, Say, Stream
from twilio.rest import Client
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from fastapi import APIRouter, Request, HTTPException
from agents import firebase
from agents.firebase import CallStatus

import openai
import io
from pydub import AudioSegment

router = APIRouter()

load_dotenv()

twilio_client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
client = openai.OpenAI()


# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SERVER_ENDPOINT = os.getenv('SERVER_ENDPOINT')
PORT = int(os.getenv('PORT', 5050))

VOICE = 'alloy'
LOG_EVENT_TYPES = [
    'error', 'response.content.done', 'rate_limits.updated',
    'response.done', 'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped', 'input_audio_buffer.speech_started',
    'session.created', 'transcript.final'
]
SHOW_TIMING_MATH = False

# Define the prompt at the top of the file
INITIAL_PROMPT = (
                "You are an AI assistant initiating a conversation to enquire about moving services."
                "Your goal is to inquire about the moving services, asking for details, "
                "pricing, and availability. Maintain a neutral tone throughout "
                "the conversation. "
            )
INITIAL_CONVERSATION_TEXT = (
        "Hello! I'm interested in scheduling moving services. "
        "you have available?"
)
call_sid = None

current_user_id = None

app = FastAPI()

if not OPENAI_API_KEY:
    raise ValueError('Missing the OpenAI API key. Please set it in the .env file.')


@router.api_route("/outgoing-call-twiml", methods=["GET", "POST"])
async def outgoing_call_twiml(request: Request):
    """Provide TwiML instructions for the outgoing call."""
    response = VoiceResponse()
    response.say("Please wait while we connect your call to my assistant")
    response.pause(length=1)
    # response.say("Hi, How's it going?")
    connect = Connect()
    connect.stream(url=f'wss://{request.url.hostname}/media-stream')
    response.append(connect)
    return HTMLResponse(content=str(response), media_type="application/xml")

@router.api_route("/")
async def index_page():
    return {"message": "Voice Server is running!"}

def handle_outgoing_call_sync(to_number):
    """Initiate an outgoing call and return status."""

    global call_sid

    if not to_number or not os.getenv('TWILIO_PHONE_NUMBER'):
        return JSONResponse(content={"error": "Missing 'to' or 'from' number"}, status_code=400)

    # Function to initiate the call
    call = twilio_client.calls.create(
        to=to_number,
        from_=os.getenv('TWILIO_PHONE_NUMBER'),
        url=f'{os.getenv("SERVER_ENDPOINT")}/outgoing-call-twiml'
    )
    print(f"Call initiated: {call.sid}")

    firebase.update_call_data(current_user_id,call_sid, {
                "status": CallStatus.CALL_INITIATED
    })

    call_sid = call.sid


    return call.sid

def check_call_status(call_sid):
    call = twilio_client.calls(call_sid).fetch()
        
    return call.status

def get_call_data(call_sid):
    try:
        call_data = firebase.get_call_data_as_json(current_user_id, call_sid)
        return call_data
    except Exception as e:
        print(f"Error getting call data: {e}")
        return None

def initiate_call_with_prompt(phone_number, initial_prompt, conversation_text, user_id):
    """Function to initiate a call with specific prompts."""


    print(f"Initial prompt: {initial_prompt}")
    print(f"Conversation text: {conversation_text}")
    print(f"Phone number: {phone_number}")
    # Set the initial prompt and conversation text
    global INITIAL_PROMPT, INITIAL_CONVERSATION_TEXT, current_user_id
    INITIAL_PROMPT = initial_prompt
    INITIAL_CONVERSATION_TEXT = conversation_text
    current_user_id = user_id

    print(f"Initiating call to {phone_number}")

    # Call the handle_outgoing_call function
    response =  handle_outgoing_call_sync(phone_number)
    return response


@router.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    """Handle WebSocket connections between Twilio and OpenAI."""
    print("Client connected")
    await websocket.accept()

    # Initialize transcripts list
    transcripts = []

    try:
        async with websockets.connect(
            'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
            extra_headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "OpenAI-Beta": "realtime=v1"
            }
        ) as openai_ws:
            # When call is picked up, update status
            firebase.update_call_data(current_user_id, call_sid, {
                "status": CallStatus.CALL_INPROGRESS
            })

            await initialize_session(openai_ws)

            # Connection specific state
            stream_sid = None
            latest_media_timestamp = 0
            last_assistant_item = None
            mark_queue = []
            response_start_timestamp_twilio = None
            
            audio_buffer = []  # Global state for accumulating audio data

            async def receive_from_twilio():
                """Receive audio data from Twilio and send it to the OpenAI Realtime API."""
                nonlocal stream_sid, latest_media_timestamp, transcripts

                try:
                    async for message in websocket.iter_text():
                        data = json.loads(message)

                        if data['event'] == 'media':
                            latest_media_timestamp = int(data['media']['timestamp'])
                            
                            audio_buffer.append(base64.b64decode(data['media']['payload']))  # Accumulate audio data

                            # Decode the base64 audio data to bytes
                            audio_bytes = base64.b64decode(data['media']['payload'])

                            # Create an in-memory file-like object for the binary audio data
                            audio_stream = io.BytesIO(audio_bytes)

                            audio_append = {
                                "type": "input_audio_buffer.append",
                                "audio": data['media']['payload']
                            }

                            # print("sending audio_append")
                            await openai_ws.send(json.dumps(audio_append))

                        elif data['event'] == 'start':
                            stream_sid = data['start']['streamSid']
                            print(f"Incoming stream has started {stream_sid}")
                            response_start_timestamp_twilio = None
                            latest_media_timestamp = 0
                            last_assistant_item = None
                        elif data['event'] == 'mark':
                            if mark_queue:
                                mark_queue.pop(0)
                except WebSocketDisconnect:
                    print("Client disconnected.")
                    if openai_ws.open:
                        await openai_ws.close()
                    # Update Firestore status to call disconnected
                    firebase.update_call_data(current_user_id, call_sid, {
                        "status": CallStatus.CALL_COMPLETED
                    })

            async def send_to_twilio():
                """Receive events from the OpenAI Realtime API, send audio back to Twilio."""
                nonlocal stream_sid, last_assistant_item, response_start_timestamp_twilio, transcripts
                try:
                    async for openai_message in openai_ws:
                        response = json.loads(openai_message)
                        # print(f"Received event: {response['type']}", response)

                        # Log the conversation.item.input_audio_transcription.completed event
                        if response['type'] == 'conversation.item.input_audio_transcription.completed':
                            print(f"User input: {response['transcript']}")

                            transcripts.append({
                                "role": "user",
                                "message": response['transcript']
                            })

                            firebase.update_call_data(current_user_id, call_sid, {
                                "transcripts": transcripts
                            })

                        if response['type'] in LOG_EVENT_TYPES:                            
                            # Parse transcript from response.done event
                            if response['type'] == 'response.done':
                                try:
                                    output = response['response']['output']
                                    for item in output:
                                        if item['role'] == 'assistant':
                                            for content in item['content']:
                                                if content.get('transcript'):
                                                    print(f"\n\nAI said: {content['transcript']}\n\n")
                                                    transcripts.append({
                                                        "role": "assistant",
                                                        "message": content['transcript']
                                                    })
                                                    firebase.update_call_data(current_user_id, call_sid, {
                                                        "status": CallStatus.CALL_INPROGRESS,
                                                        "transcripts": transcripts
                                                    })
                                except KeyError as e:
                                    print(f"Error parsing response.done event: {e}")

                        if response.get('type') == 'transcript.final':
                            print(f"\n\nUser said: {response['text']}\n\n")
                            transcripts.append({
                                "role": "user",
                                "message": response['text']
                            })
                            firebase.update_call_data(current_user_id, call_sid, {
                                "status": CallStatus.CALL_INPROGRESS,
                                "transcripts": transcripts
                            })

                        if response.get('type') == 'response.audio.delta' and 'delta' in response:
                            audio_payload = base64.b64encode(base64.b64decode(response['delta'])).decode('utf-8')
                            audio_delta = {
                                "event": "media",
                                "streamSid": stream_sid,
                                "media": {
                                    "payload": audio_payload
                                }
                            }
                            await websocket.send_json(audio_delta)

                            if response_start_timestamp_twilio is None:
                                response_start_timestamp_twilio = latest_media_timestamp
                                if SHOW_TIMING_MATH:
                                    print(f"Setting start timestamp for new response: {response_start_timestamp_twilio}ms")

                            # Update last_assistant_item safely
                            if response.get('item_id'):
                                last_assistant_item = response['item_id']

                            await send_mark(websocket, stream_sid)

                        # Print AI response for debugging
                        if response.get('type') == 'response.text' and 'text' in response:
                            print(f"\n\nAI has send a message: {response['text']}\n\n")
                            transcripts.append({
                                "role": "assistant",
                                "message": response['text']
                            })
                            firebase.update_call_data(current_user_id, call_sid, {
                                "status": CallStatus.CALL_INPROGRESS,
                                "transcripts": transcripts
                            })

                        # Trigger an interruption. Your use case might work better using `input_audio_buffer.speech_stopped`, or combining the two.
                        if response.get('type') == 'input_audio_buffer.speech_started':
                            print("Speech started detected.")
                            if last_assistant_item:
                                print(f"Interrupting response with id: {last_assistant_item}")
                                await handle_speech_started_event()
                except Exception as e:
                    print(f"Error in send_to_twilio: {e}")

            async def handle_speech_started_event():
                """Handle interruption when the caller's speech starts."""
                nonlocal response_start_timestamp_twilio, last_assistant_item
                print("Handling speech started event.")
                if mark_queue and response_start_timestamp_twilio is not None:
                    elapsed_time = latest_media_timestamp - response_start_timestamp_twilio
                    if SHOW_TIMING_MATH:
                        print(f"Calculating elapsed time for truncation: {latest_media_timestamp} - {response_start_timestamp_twilio} = {elapsed_time}ms")

                    if last_assistant_item:
                        if SHOW_TIMING_MATH:
                            print(f"Truncating item with ID: {last_assistant_item}, Truncated at: {elapsed_time}ms")

                        truncate_event = {
                            "type": "conversation.item.truncate",
                            "item_id": last_assistant_item,
                            "content_index": 0,
                            "audio_end_ms": elapsed_time
                        }
                        # print(f"Sending truncate event: {truncate_event}")
                        await openai_ws.send(json.dumps(truncate_event))

                    await websocket.send_json({
                        "event": "clear",
                        "streamSid": stream_sid
                    })

                    mark_queue.clear()
                    last_assistant_item = None
                    response_start_timestamp_twilio = None

            async def send_mark(connection, stream_sid):
                if stream_sid:
                    mark_event = {
                        "event": "mark",
                        "streamSid": stream_sid,
                        "mark": {"name": "responsePart"}
                    }
                    await connection.send_json(mark_event)
                    mark_queue.append('responsePart')

            await asyncio.gather(receive_from_twilio(), send_to_twilio())
    finally:
        print("CALL OVER")

async def initialize_session(openai_ws):
    """Control initial session with OpenAI."""
    session_update = {
        "type": "session.update",
        "session": {
            "turn_detection": {"type": "server_vad"},
            "input_audio_format": "g711_ulaw",
            "output_audio_format": "g711_ulaw",
            "voice": VOICE,
            "instructions": INITIAL_PROMPT,
            "modalities": ["text", "audio"],
            "temperature": 0.7,
            "input_audio_transcription": {
                "model": "whisper-1"
            }
        }
    }
    print('Sending session update:', json.dumps(session_update))
    await openai_ws.send(json.dumps(session_update))

    # Ensure the AI starts the conversation
    await send_initial_conversation_item(openai_ws)

async def send_initial_conversation_item(openai_ws):
    """Send initial conversation item if AI talks first."""
    initial_conversation_item = {
        "type": "conversation.item.create",
        "item": {
            "type": "message",
            "role": "assistant",
            "content": [
                {
                    "type": "input_text",
                    "text": INITIAL_CONVERSATION_TEXT
                }
            ]
        }
    }
    await openai_ws.send(json.dumps(initial_conversation_item))
    await openai_ws.send(json.dumps({"type": "response.create"}))


test_prompt= (''' general negotiation script based on common practices that can be adapted once specific details are available. Here’s a concise plan:

1. **Research and Prepare**: Gather pricing data from multiple movers, noting the lowest prices and service levels offered.
2. **Establish Rapport**: Start the conversation by expressing appreciation for their services and mentioning positive reviews you've heard.
3. **Present Your Requirements**: Clearly outline your moving needs, including distance, volume, and any special items requiring care.
4. **Mention Competitors**: Reference lower prices or better services from competitors without naming specific companies, to create a sense of urgency.
5. **Ask for Discounts**: Politely inquire about any current promotions or discounts that may apply to your situation.
6. **Negotiate the Price**: State the lowest price you've found and ask if they can match or beat it for comparable services.
7. **Emphasize Quality**: Stress that while price is important, you value quality service and reliability, and you’re looking for the best overall value.
8. **Request a Written Quote**: Once a verbal agreement is reached, ask for a detailed written quote outlining services and costs.
9. **Be Prepared to Walk Away**: If the price doesnt meet your expectations, be ready to explore other options, as this may prompt a better offer.
10. **Follow Up**: After the call, send a thank you email reiterating your interest and summarizing the agreed points to keep the mover engaged.

Adjust the specifics of this script based on the actual transcripts you have for a more tailored approach.
Conversation text: some strategy ''')

# if __name__ == "__main__":
    # import uvicorn
    # uvicorn.run(app, host="0.0.0.0", port=5001)