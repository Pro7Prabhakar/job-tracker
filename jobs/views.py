import io
from rest_framework import viewsets, permissions
from .models import Job
from .serializers import JobSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.management import call_command
from decouple import config
from django.db.models import Count
from django.db.models.functions import TruncWeek

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Job.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def run_reminder_job(request):
    valid_key = request.GET.get("key") == config("REMINDER_KEY")
    is_admin = request.user and request.user.is_staff

    if not (valid_key or is_admin):
        return Response({"error": "Unauthorized"}, status=403)
    
    out = io.StringIO()
    call_command("send_reminders", stdout=out)
    return Response({"message": "Reminder job executed successfully!"})

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user

    status_summary = (
        Job.objects.filter(user=user)
        .values("status")
        .annotate(count=Count("id"))
        .order_by()
    )

    weekly_summary = (
        Job.objects.filter(user=user)
        .annotate(week=TruncWeek("created_at"))
        .values("week")
        .annotate(count=Count("id"))
        .order_by("week")
    )

    return Response({
        "status_summary": list(status_summary),
        "weekly_summary": list(weekly_summary),
    })
