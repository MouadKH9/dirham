from decimal import Decimal
from django.db.models import F
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from .models import Transaction
from apps.accounts.models import Account


def _balance_delta(transaction):
    """Return the signed balance change for a transaction."""
    if transaction.type == Transaction.TransactionType.INCOME:
        return transaction.amount
    return -transaction.amount


@receiver(pre_save, sender=Transaction)
def capture_old_transaction(sender, instance, **kwargs):
    """Stash the previous DB state so post_save can compute the delta."""
    if instance.pk:
        try:
            instance._old_instance = Transaction.objects.get(pk=instance.pk)
        except Transaction.DoesNotExist:
            instance._old_instance = None
    else:
        instance._old_instance = None


@receiver(post_save, sender=Transaction)
def update_account_balance_on_save(sender, instance, created, **kwargs):
    if created:
        Account.objects.filter(pk=instance.account_id).update(
            balance=F("balance") + _balance_delta(instance)
        )
        return

    old = getattr(instance, "_old_instance", None)
    if old is None:
        return

    old_delta = _balance_delta(old)
    new_delta = _balance_delta(instance)

    if old.account_id == instance.account_id:
        diff = new_delta - old_delta
        if diff:
            Account.objects.filter(pk=instance.account_id).update(
                balance=F("balance") + diff
            )
    else:
        Account.objects.filter(pk=old.account_id).update(
            balance=F("balance") - old_delta
        )
        Account.objects.filter(pk=instance.account_id).update(
            balance=F("balance") + new_delta
        )


@receiver(post_delete, sender=Transaction)
def update_account_balance_on_delete(sender, instance, **kwargs):
    Account.objects.filter(pk=instance.account_id).update(
        balance=F("balance") - _balance_delta(instance)
    )
