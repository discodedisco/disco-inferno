from django.db import models

# Signup code
class SignupCode(models.Model):
    code = models.CharField(max_length=32, unique=True)
    used = models.BooleanField(default=False)
    used_by = models.ForeignKey('auth.User', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.code
