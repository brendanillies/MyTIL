import random
from typing import Any
from django import http
from django.contrib.auth.models import User
from django.views.generic import DetailView, UpdateView, View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render

from feed.models import Post
from followers.models import Follower


class ProfileDetailView(DetailView):
    http_method_names = ['get']
    template_name = 'profiles/detail.html'
    model = User
    context_object_name = 'user'
    slug_field = 'username'
    slug_url_kwarg = 'username'
    
    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        user = self.get_object()
        context = super().get_context_data(**kwargs)
        context['total_posts'] = Post.objects.filter(author=user).count()
        context['total_followers'] = Follower.objects.filter(following=user).count()
        
        if self.request.user.is_authenticated:
            context['you_follow'] = Follower.objects.filter(following=user, followed_by=self.request.user).exists()
        return context


class ProfileSettingsView(LoginRequiredMixin, UpdateView):
    http_method_names = ['get', 'post']
    template_name = 'account/settings.html'
    model = User
    context_object_name = 'user'
    slug_field = 'username'
    slug_url_kwarg = 'username'
    fields = ['username']
    
    def get_context_data(self, **kwargs):
        user = self.get_object()
        context = super().get_context_data(**kwargs)

        # Define max cards to showcase
        max_cards = 5
        context['max_cards'] = max_cards

        # Get posts
        posts = Post.objects.filter(author=user).order_by('-date')
        context['total_posts'] = posts.count()
        context['posts'] = posts[:max_cards]

        # Get followers
        followers = Follower.objects.filter(following=user)
        context['total_followers'] = followers.count()
        context['followers'] = random.sample(list(followers), min(max_cards, len(followers)))

        # Get users followed by authenticated user
        following = Follower.objects.filter(followed_by=user)
        context['total_following'] = following.count()
        context['following'] = random.sample(list(following), min(max_cards, len(following)))

        return context
    

class SearchView(LoginRequiredMixin, TemplateView):
    http_method_names = ['get']
    template_name = 'profiles/search.html'

    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs: Any):
        context = super().get_context_data(**kwargs)    
        username = self.request.GET.get('username')
        context['search_result'] = User.objects.filter(username__icontains=username).exclude(username=self.request.user)
        return context


class FollowView(LoginRequiredMixin, View):
    http_method_names = ['post']
    
    def post(self, request, *args, **kwargs):
        data = request.POST.dict()

        if 'action' not in data or 'username' not in data:
            return HttpResponseBadRequest('Missing data')
        
        try:
            other_user = User.objects.get(username=data['username'])
        except User.DoesNotExist:
            return HttpResponseBadRequest('Missing user')

        if data['action'] == 'follow':
            # Follow other_user
            follower, created = Follower.objects.get_or_create(
                followed_by=request.user,
                following=other_user
            )
        else:
            # Unfollow other_user
            try:
                follower = Follower.objects.get(
                    followed_by=request.user,
                    following=other_user
                )
            except Follower.DoesNotExist:
                follower = None

            if follower:
                follower.delete()
        
        follower_count = Follower.objects.filter(following=other_user).count()

        return JsonResponse({
            'success': True,
            'wording': 'Unfollow' if data['action'] == 'follow' else 'Follow',
            'follower_count': follower_count
        })