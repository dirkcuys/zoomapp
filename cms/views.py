from django.shortcuts import render, get_object_or_404

from .models import Page

def page(request, key):
    page_ = get_object_or_404(Page, key=key)
    return render(request, 'cms/page.html', {"page": page_})


