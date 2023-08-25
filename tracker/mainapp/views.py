import json
import requests
import sys

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Question, Note, Progress

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import QuestionSerializer, NoteSerializer

from requests.exceptions import HTTPError, ConnectionError, Timeout, RequestException
# Load environment variables from file
from dotenv import load_dotenv

# Create your views here.

""" 
as long as the user is signed in, this function renders the mainapp/inbox.html template

"""

def index(request):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "mainapp/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "mainapp/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "mainapp/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "mainapp/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(email, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "mainapp/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "mainapp/register.html")

@login_required
@api_view(['GET'])
def allquestions(request):
    questions = Question.objects.all()
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@csrf_exempt
@login_required
def create_question(request):

    # Creating a new question must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    try:
        data = json.loads(request.body)
        title = data.get("title", "")
        number = data.get("number", "")
        description = data.get("description", "")
        difficulty = data.get("difficulty", "")
        tags = data.get("tags", "")
        url = data.get("url", "")
        solvedfirst = data.get("solvedfirst", "")
        user = request.user 
        print(solvedfirst)

        # Create the Question object
        question = Question.objects.create(
            title=title,
            author=user,
            number=number,
            description=description,
            difficulty=difficulty,
            tags=tags,
            url=url,
            solved_first_time=solvedfirst
        )

        # You can perform additional actions if needed
        # For example, you might want to add tags to the question or associate it with the current user

        # Redirect the user to the index page with a success message
        return JsonResponse({'message': 'Question created successfully.'}, status=201)
    except Exception as e:
        # Handle any errors that occur during question creation
        error_message = str(e)
        return JsonResponse({'error': error_message}, status=400)

def get_leetcode_info_by_id(id):
    try:
        # Load environment variables from .env file
        load_dotenv(".venv")

        # URL
        LEETCODE_INFO_URL = "https://lcid.cc/info/"

        leetcode_url = f"{LEETCODE_INFO_URL}{id}"
        resInfo = requests.get(leetcode_url, timeout=3)
        resInfo.raise_for_status()

        # The response seems successful, parse and return the data
        return resInfo.json()

    except HTTPError as errh:
        return JsonResponse({"error": f"HTTP error occurred: {errh}"}, status=500)
    except ConnectionError as errc:
        return JsonResponse({"error": f"Connection error occurred: {errc}"}, status=500)
    except Timeout as errt:
        return JsonResponse({"error": f"Timeout error occurred: {errt}"}, status=500)
    except RequestException as err:
        return JsonResponse({"error": f"Request exception occurred: {err}"}, status=500)
    except json.JSONDecodeError as json_err:
        return JsonResponse({"error": f"JSON decoding error occurred: {json_err}"}, status=500)
    
def import_question(request):

    number = request.GET.get('number')

    try:
        leetcode_info = get_leetcode_info_by_id(number)  # Assuming get_leetcode_info_by_id is defined
        print(leetcode_info)
        return JsonResponse(leetcode_info, status=200)
    
    except Question.DoesNotExist:
        return JsonResponse({"error": "Question not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_question(request):
    if request.method == 'GET':
        number = request.GET.get('number')

        try:
            question = Question.objects.get(number=number)
            question_data = {
                'title': question.title,
                'number': question.number,
                'difficulty': question.difficulty,
                'description': question.description,
                'tags': question.tags,
                'url': question.url,
                'solved_first_time': question.solved_first_time
            }
            return JsonResponse(question_data, status=200)
        except Question.DoesNotExist:
            return JsonResponse({'error': 'Question not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'GET request required.'}, status=400)
    
# API endpoint to create a note
@csrf_exempt
@login_required
def create_note(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            question_number = data.get("question_number", "")
            content = data.get("content", "")
            
            user = request.user
            question = Question.objects.get(number=question_number)
            
            note = Note.objects.create(
                user=user,
                question=question,
                content=content
            )
            
            return JsonResponse({'message': 'Note created successfully.'}, status=201)
        except Exception as e:
            error_message = str(e)
            return JsonResponse({'error': error_message}, status=400)

# API endpoint to fetch notes for a question
@api_view(['GET'])
@login_required
def get_notes(request):
    if request.method == 'GET':
        question_number = request.GET.get('question_number')
        
        try:
            print('trying')
            question = Question.objects.get(number=question_number)
            notes = Note.objects.filter(question=question)
            print('note')
            serializer = NoteSerializer(notes, many=True)
            return Response(serializer.data)

        except Question.DoesNotExist:
            return JsonResponse({'error': 'Question not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

