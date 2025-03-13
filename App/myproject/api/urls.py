# supplier_analysis_app/urls.py

from django.urls import path
from .views import SupplierAnalysisAPIView

urlpatterns = [
    path('matrix/', SupplierAnalysisAPIView.as_view(), name='supplier_analysis'),
]
