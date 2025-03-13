from django.db import models

# Create your models here.

from django.db import models

class DataTable(models.Model):
    name = models.CharField(max_length=100)
    value = models.IntegerField()
