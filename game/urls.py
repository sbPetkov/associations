from django.urls import path
from .views import (
    PlayerCreateView,
    RoomListView,
    RoomDetailView,
    RoomDeleteView,
    WordsListView,
    WordsDetailView,
    RoomWordsView,
    ImageSearchView,
    get_word_description,
)

urlpatterns = [
    path('players/', PlayerCreateView.as_view(), name='create-player'),
    path('players/all/', PlayerCreateView.as_view(), name='list-players'),  # Add endpoint to list all players
    path('rooms/', RoomListView.as_view(), name='room-list'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('rooms/<int:pk>/delete/', RoomDeleteView.as_view(), name='delete-room'),  # New delete endpoint
    path('words/', WordsListView.as_view(), name='words-list'),
    path('words/<int:pk>/', WordsDetailView.as_view(), name='words-detail'),
    path('rooms/<int:pk>/words/', RoomWordsView.as_view(), name='room-words'),
    path('image-search/', ImageSearchView.as_view(), name='image_search'),
    path("get-word-description/", get_word_description, name="get_word_description"),
]

