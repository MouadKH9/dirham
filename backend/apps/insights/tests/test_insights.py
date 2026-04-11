import pytest
from datetime import date
from rest_framework import status
from apps.accounts.tests.factories import UserFactory
from apps.insights.models import AIInsight


def make_insight(user, **kwargs):
    return AIInsight.objects.create(
        user=user,
        type=kwargs.get("type", "awareness"),
        title=kwargs.get("title", "Test Insight"),
        body=kwargs.get("body", "Tu as dépensé plus ce mois-ci."),
        language=kwargs.get("language", "fr"),
        period_start=kwargs.get("period_start", date(2026, 4, 1)),
        period_end=kwargs.get("period_end", date(2026, 4, 30)),
        severity=kwargs.get("severity", "info"),
        is_read=kwargs.get("is_read", False),
        metadata=kwargs.get("metadata", {}),
    )


@pytest.mark.django_db
class TestAIInsightModel:
    def test_create_insight(self):
        user = UserFactory()
        insight = make_insight(user)
        import uuid
        assert isinstance(insight.id, uuid.UUID)
        assert not insight.is_read
        assert insight.language == "fr"

    def test_str(self):
        user = UserFactory()
        insight = make_insight(user, title="Budget Alert")
        assert "Budget Alert" in str(insight)


@pytest.mark.django_db
class TestInsightListView:
    url = "/api/v1/insights/"

    def test_list_own_insights(self, authenticated_client, user):
        make_insight(user, title="Mine")
        other = UserFactory()
        make_insight(other, title="Theirs")
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        titles = [i["title"] for i in response.data["results"]]
        assert "Mine" in titles
        assert "Theirs" not in titles

    def test_filter_by_is_read_false(self, authenticated_client, user):
        make_insight(user, is_read=False)
        make_insight(user, is_read=True)
        response = authenticated_client.get(self.url + "?is_read=false")
        assert response.data["count"] == 1

    def test_filter_by_is_read_true(self, authenticated_client, user):
        make_insight(user, is_read=False)
        make_insight(user, is_read=True)
        response = authenticated_client.get(self.url + "?is_read=true")
        assert response.data["count"] == 1

    def test_filter_by_type(self, authenticated_client, user):
        make_insight(user, type="breakdown")
        make_insight(user, type="anomaly")
        response = authenticated_client.get(self.url + "?type=breakdown")
        assert response.data["count"] == 1

    def test_filter_by_language(self, authenticated_client, user):
        make_insight(user, language="fr")
        make_insight(user, language="ar")
        response = authenticated_client.get(self.url + "?language=ar")
        assert response.data["count"] == 1

    def test_ordered_newest_first(self, authenticated_client, user):
        i1 = make_insight(user, title="Older")
        i2 = make_insight(user, title="Newer")
        response = authenticated_client.get(self.url)
        titles = [i["title"] for i in response.data["results"]]
        assert titles.index("Newer") < titles.index("Older")

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestInsightDetailView:
    def test_retrieve_own_insight(self, authenticated_client, user):
        insight = make_insight(user)
        response = authenticated_client.get(f"/api/v1/insights/{insight.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == insight.title

    def test_cannot_retrieve_other_users_insight(self, authenticated_client):
        other = UserFactory()
        insight = make_insight(other)
        response = authenticated_client.get(f"/api/v1/insights/{insight.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestMarkInsightRead:
    def test_patch_marks_insight_as_read(self, authenticated_client, user):
        insight = make_insight(user, is_read=False)
        response = authenticated_client.patch(
            f"/api/v1/insights/{insight.id}/", {"is_read": True}
        )
        assert response.status_code == status.HTTP_200_OK
        insight.refresh_from_db()
        assert insight.is_read

    def test_cannot_patch_other_fields(self, authenticated_client, user):
        insight = make_insight(user, title="Original")
        authenticated_client.patch(
            f"/api/v1/insights/{insight.id}/", {"title": "Hacked"}
        )
        insight.refresh_from_db()
        assert insight.title == "Original"


@pytest.mark.django_db
class TestUnreadCountView:
    url = "/api/v1/insights/unread-count/"

    def test_unread_count_correct(self, authenticated_client, user):
        make_insight(user, is_read=False)
        make_insight(user, is_read=False)
        make_insight(user, is_read=True)
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2

    def test_unread_count_only_own(self, authenticated_client, user):
        other = UserFactory()
        make_insight(other, is_read=False)
        make_insight(other, is_read=False)
        response = authenticated_client.get(self.url)
        assert response.data["count"] == 0

    def test_unread_count_zero_when_none(self, authenticated_client):
        response = authenticated_client.get(self.url)
        assert response.data["count"] == 0

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
