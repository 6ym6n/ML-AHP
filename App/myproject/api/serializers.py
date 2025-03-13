# supplier_analysis_app/serializers.py

from rest_framework import serializers

class ConsistentMatrixSerializer(serializers.Serializer):
    matrix = serializers.DictField(child=serializers.DictField(child=serializers.FloatField()))
    best_model = serializers.CharField()
    mse = serializers.FloatField()
    r2 = serializers.FloatField()
