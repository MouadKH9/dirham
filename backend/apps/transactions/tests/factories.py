import factory
from datetime import date
from apps.accounts.tests.factories import UserFactory, AccountFactory
from apps.categories.tests.factories import CategoryFactory
from apps.transactions.models import Transaction, RecurringBill


class TransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Transaction

    user = factory.SubFactory(UserFactory)
    account = factory.SubFactory(AccountFactory, user=factory.SelfAttribute("..user"))
    category = factory.SubFactory(CategoryFactory)
    type = "expense"
    amount = factory.Faker("pydecimal", left_digits=4, right_digits=2, positive=True)
    currency = "MAD"
    date = factory.LazyFunction(date.today)
    source = "manual"
    notes = ""
    recurring_bill = None
