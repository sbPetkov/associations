from django.db import models


class Player(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=100)
    players = models.ManyToManyField(Player, related_name='rooms')

    def __str__(self):
        return self.name


class Words(models.Model):
    related_to_room = models.ForeignKey(Room, on_delete=models.CASCADE)
    plant = models.CharField(max_length=30)
    animal = models.CharField(max_length=30)
    famous_person = models.CharField(max_length=30)
    place = models.CharField(max_length=30)
    brand = models.CharField(max_length=30)
