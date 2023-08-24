import json
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
from .serializers import QuestionSerializer

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

@login_required
@api_view(['GET'])
def myquestions(request):
    user = request.user
    questions = Question.objects.filter(author=user)  # Assuming you have a foreign key to the User model
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)