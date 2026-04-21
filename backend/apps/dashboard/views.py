from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer
from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer
from apps.budgets.models import Budget
from apps.insights.models import AIInsight


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        month_start = today.replace(day=1)
        if today.month == 12:
            month_end = date(today.year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end = date(today.year, today.month + 1, 1) - timedelta(days=1)

        # 1. Account balances
        accounts = Account.objects.filter(user=user)
        accounts_data = AccountSerializer(accounts, many=True).data

        # 2. Recent 10 transactions (across all accounts, reverse-chronological)
        recent_qs = (
            Transaction.objects.filter(user=user)
            .select_related("account", "category")
            .order_by("-date", "-created_at")[:10]
        )
        recent_data = TransactionSerializer(recent_qs, many=True).data

        # 3. Monthly summary (single GROUP BY query)
        monthly_agg = (
            Transaction.objects.filter(user=user, date__gte=month_start, date__lte=month_end)
            .values("type")
            .annotate(total=Sum("amount"))
        )
        summary = {"income": Decimal("0.00"), "expense": Decimal("0.00"), "bill": Decimal("0.00")}
        for row in monthly_agg:
            summary[row["type"]] = row["total"]
        summary["net"] = summary["income"] - summary["expense"] - summary["bill"]
        summary["month"] = month_start.strftime("%Y-%m")

        # 4. Unread insights count
        unread_count = AIInsight.objects.filter(user=user, is_read=False).count()

        # 5. Budget progress for current month
        budgets = Budget.objects.filter(user=user, month=month_start).prefetch_related("categories")
        budget_progress = []
        for budget in budgets:
            budget_categories = list(budget.categories.all())
            if not budget_categories:
                continue
            spent = (
                Transaction.objects.filter(
                    user=user,
                    category__in=budget_categories,
                    date__gte=month_start,
                    date__lte=month_end,
                    type__in=["expense", "bill"],
                ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
            )
            category_ids = [str(category.id) for category in budget_categories]
            category_names = ", ".join(category.name_fr for category in budget_categories)
            budget_progress.append({
                "category_id": category_ids[0] if category_ids else "",
                "category_ids": category_ids,
                "category_name": category_names,
                "limit": budget.amount,
                "spent": spent,
                "remaining": budget.amount - spent,
            })

        return Response({
            "accounts": accounts_data,
            "recent_transactions": recent_data,
            "monthly_summary": summary,
            "unread_insights_count": unread_count,
            "budget_progress": budget_progress,
        })
