from rest_framework import serializers
from .models import Player, Room, Words


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'players']


class WordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Words
        fields = '__all__'