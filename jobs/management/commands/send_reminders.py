from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job

class Command(BaseCommand):
    help = "Send reminder emails for jobs still in 'applied' status after 7 days"

    def handle(self, *args, **options):
        cutoff_date = timezone.now() - timedelta(days=7)
        jobs = Job.objects.filter(status="applied", created_at__lt=cutoff_date)

        if not jobs.exists():
            self.stdout.write(self.style.SUCCESS("No reminders to send today."))
            return

        for job in jobs:
            subject = f"Follow up on your {job.title} application at {job.company}"
            message = (
                f"Hi {job.user.username},\n\n"
                f"It's been a week since you applied for '{job.title}' at {job.company}.\n"
                f"Consider following up or updating the status in your tracker.\n\n"
                f"Best,\nJob Tracker App"
            )

            send_mail(subject, message, None, [job.user.email])
            # self.stdout.write(self.style.SUCCESS(f"Reminder sent to {job.user.email}"))

        self.stdout.write(self.style.SUCCESS("✅ All reminder emails sent successfully!"))
