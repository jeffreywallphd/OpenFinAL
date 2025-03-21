from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from transformers import AutoModelForCausalLM, AutoTokenizer
from ..models import Conversation
from ..serializers import ConversationSerializer
import uuid
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
import torch


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model_cache = {} 
def get_model_and_tokenizer(model_name):    
    """
    Generate a response from the model based on the input prompt.
    """
    if model_name in model_cache:
        return model_cache[model_name]
    try:
        # Load tokenizer dynamically
        if "llama" in model_name.lower() or "meta" in model_name.lower() or "openelm" in model_name.lower():
            tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf", use_fast=False, trust_remote_code=True)
            tokenizer.add_bos_token = True
            model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)    
        else:
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(model_name,trust_remote_code=True)

        # Set pad_token for compatibility
        tokenizer.pad_token = tokenizer.eos_token
        model.resize_token_embeddings(len(tokenizer)) 
        model.to(device)

        model_cache[model_name] = (model, tokenizer)
        return model, tokenizer
    except Exception as e:
        raise ValueError(f"Error loading model '{model_name}' and tokenizer: {str(e)}")   

def generate_response(prompt, model_name, max_length=200, min_length=100, top_k=50, top_p=0.95, no_repeat_ngram_size=0, max_new_tokens=300):
    """
    Generate a response dynamically using the specified model and tokenizer.
    """
    try:
        model, tokenizer = get_model_and_tokenizer(model_name)
        # Tokenize the input prompt
        inputs = tokenizer(
            prompt,
            return_tensors='pt',
            padding=True,
            truncation=True,
            max_length=128
        ).to(device)  # Move inputs to the same device as the model

        # Generate a response
        outputs = model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            max_length=max_length,
            min_length=min_length,
            do_sample=True,
            top_k=top_k,
            top_p=top_p,
            no_repeat_ngram_size=no_repeat_ngram_size,
            max_new_tokens=max_new_tokens,
            num_return_sequences=1,
            pad_token_id=tokenizer.pad_token_id
        )
        
        # Decode and return the response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
    except Exception as e:
        return f"Error during response generation: {str(e)}"

class SessionCreateView(APIView):
    """
    Handle POST requests to create a new chat session.
    """
    def post(self, request):
        session_id = str(uuid.uuid4())  # Generate a new unique session_id
        return Response({'session_id': session_id}, status=status.HTTP_201_CREATED)

class SessionListView(APIView):
    """
    Handle GET requests to list all existing session IDs.
    """
    def get(self, request):
        sessions = Conversation.objects.values_list('session_id', flat=True).distinct()
        return Response({'sessions': list(sessions)})
    
class ConversationListView(APIView):
    """
    Handle GET requests to retrieve conversation history.
    """
    def get(self, request, session_id):
        conversations = Conversation.objects.filter(session_id=session_id).order_by('timestamp')
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

class ConversationCreateView(APIView):
    """
    Handle POST requests to add a new message to the conversation.
    """
    def post(self, request, session_id):
        data = request.data
        data['session_id'] = session_id  # Associate message with the session ID
        serializer = ConversationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'session_id': session_id, **serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatbotGenerateResponseView(APIView):
    def get(self, request):
        return Response({'message': 'This is a GET request. Please use a POST request to generate a chatbot response.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)  
    """
    Handle POST requests to generate a chatbot response using GPT-2
    and save the chat to the database.
    """
    def post(self, request, session_id):
        # Ensure that 'message' exists in the request body
        user_message = request.data.get('message')
        model_name = request.data.get('model_name')
        if not user_message or not model_name:
            return Response({'error': 'Both "message" and "model_name" are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Extract configurable parameters from the request or set defaults
        max_length = request.data.get('max_length', 200)
        min_length = request.data.get('min_length', 100)
        top_k = request.data.get('top_k', 50)
        top_p = request.data.get('top_p', 0.95)
        no_repeat_ngram_size = request.data.get('no_repeat_ngram_size', 0)
        max_new_tokens = request.data.get('max_new_tokens', 300)

        # Validate parameters
        try:
            model_name = str(model_name)
            max_length = int(max_length)
            min_length = int(min_length)
            top_k = int(top_k)
            top_p = float(top_p)
            no_repeat_ngram_size = int(no_repeat_ngram_size)
            max_new_tokens = int(max_new_tokens)
        except ValueError:
            return Response({'error': 'Invalid parameters. Ensure max_length, min_length, and top_k are integers, and top_p is a float.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure proper bounds for the parameters
        if not (1 <= min_length <= max_length <= 1024):
            return Response({'error': 'min_length must be <= max_length and within valid range.'}, status=status.HTTP_400_BAD_REQUEST)
        if not (0 <= top_p <= 1):
            return Response({'error': 'top_p must be between 0 and 1.'}, status=status.HTTP_400_BAD_REQUEST)
        if top_k < 0:
            return Response({'error': 'top_k must be a non-negative integer.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate response with configurable parameters
        try:
            bot_response = generate_response(
                user_message,
                model_name=model_name,
                max_length=max_length,
                min_length=min_length,
                top_k=top_k,
                top_p=top_p,
                no_repeat_ngram_size=no_repeat_ngram_size,
                max_new_tokens=max_new_tokens
            )
        except Exception as e:
            return Response({'error': f'Error during response generation: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # Save user message to the database
        user_message_data = {
            'session_id': session_id,
            'message': user_message,
            'is_user': True,  
        }
        user_serializer = ConversationSerializer(data=user_message_data)
        if user_serializer.is_valid():
            user_serializer.save()

        # Save bot response to the database
        bot_message_data = {
            'session_id': session_id,
            'message': bot_response,
            'is_user': False,  
 
        }
        bot_serializer = ConversationSerializer(data=bot_message_data)
        if bot_serializer.is_valid():
            bot_serializer.save()

        return Response({
            'user_message': user_message, 
            'bot_response': bot_response,
            'generation_params': {
                'model_name': model_name,
                'max_length': max_length,
                'min_length': min_length,
                'top_k': top_k,
                'top_p': top_p,
                'no_repeat_ngram_size': no_repeat_ngram_size,
                'max_new_tokens': max_new_tokens
            }
            }, status=status.HTTP_200_OK)

def chatbot_view(request):
    return render(request, 'chatbot.html')