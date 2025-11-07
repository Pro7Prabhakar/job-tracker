from django.urls import path
from .views import run_reminder_job, dashboard_stats

urlpatterns = [
    path("run-reminders/", run_reminder_job, name="run-reminders"),
    path("dashboard/", dashboard_stats, name="dashboard-stats"),
]
