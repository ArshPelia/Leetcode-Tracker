from django.contrib import admin
from django.urls import path, include

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

        # API Routes
    path("questions/all", views.allquestions, name="allquestions"),
    path("questions/create", views.create_question, name="create_question"),
    path('questions/import', views.import_question, name='import_question'),
    path('questions/getquestion', views.get_question, name='get_question'),
    path('questions/getnotes', views.get_notes, name='get_notes'),
    path('questions/createnote', views.create_note, name='create_note')
    
    
]
