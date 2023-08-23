from django.contrib import admin
from .models import User, Question, Note, Progress

# Register your models here.
admin.site.register(User)
admin.site.register(Question)
admin.site.register(Note)
admin.site.register(Progress)