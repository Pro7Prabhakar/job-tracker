from django.urls import path
from .views import run_reminder_job

urlpatterns = [
    path("run-reminders/", run_reminder_job, name="run-reminders"),
]
