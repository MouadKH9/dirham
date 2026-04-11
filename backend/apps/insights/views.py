from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AIInsight
from .serializers import AIInsightSerializer


class AIInsightViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AIInsightSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_read", "type", "language"]

    def get_queryset(self):
        return AIInsight.objects.filter(user=self.request.user)

    http_method_names = ["get", "patch", "head", "options"]

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"count": count})
