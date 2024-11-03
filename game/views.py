from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Player, Room, Words
from .serializers import PlayerSerializer, RoomSerializer, WordsSerializer

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from django.http import JsonResponse
from django.views import View
import time

import google.generativeai as genai
import os
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view


# Player API
class PlayerCreateView(APIView):
    def post(self, request):
        serializer = PlayerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        players = Player.objects.all()
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Room API
class RoomListView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def perform_create(self, serializer):
        serializer.save()


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomDeleteView(APIView):
    def delete(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
            room.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Room.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# Words API
class WordsListView(generics.ListCreateAPIView):
    queryset = Words.objects.all()
    serializer_class = WordsSerializer


class WordsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Words.objects.all()
    serializer_class = WordsSerializer


class RoomWordsView(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        room_id = self.kwargs['pk']
        word_list = Words.objects.filter(related_to_room_id=room_id)

        response_data = []
        for word in word_list:
            response_data.append(word.plant)
            response_data.append(word.animal)
            response_data.append(word.famous_person)
            response_data.append(word.place)
            response_data.append(word.brand)
        return Response(response_data)


class ImageSearchView(View):
    def get(self, request, *args, **kwargs):
        word = request.GET.get('word')

        if not word:
            return JsonResponse({'error': 'No search word provided'}, status=400)

        # Set up Chrome options
        options = Options()
        options.add_argument('--headless')  # Run in headless mode
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        # Automatically manage ChromeDriver installation
        service = Service(ChromeDriverManager().install())

        # Initialize the Chrome Driver
        driver = webdriver.Chrome(service=service, options=options)

        try:
            # Perform the image search
            driver.get(f"https://www.google.com/search?hl=en&tbm=isch&q={word}")

            # Wait for images to load (adjust the sleep time as necessary)
            time.sleep(2)

            # Collect image URLs
            image_div_elements = driver.find_elements('css selector', 'div.H8Rx8c')  # Find the image div elements
            image_urls = []

            for div in image_div_elements[:3]:  # Get the first 3 image divs
                img = div.find_element('tag name', 'img')  # Find the <img> tag inside the div
                src = img.get_attribute('src')  # Get the 'src' attribute of the <img>
                if src:  # Ensure the src is not None
                    image_urls.append(src)

            return JsonResponse({'images': image_urls})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

        finally:
            driver.quit()  # Ensure the driver is closed


API_KEY = os.environ.get('API_KEY')


@csrf_exempt
@api_view(["POST"])
def get_word_description(request):
    # Retrieve the word from the request data
    word = request.data.get("word")
    if not word:
        return Response({"error": "No word provided"}, status=status.HTTP_400_BAD_REQUEST)

    # Construct the prompt
    prompt = f"Играем игра в която трябва да описвам думи. Моля те опиши ми с 2 изречения думата {word}."

    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        # Update the access to the response
        description = response.candidates[0].content.parts[0].text.strip()
        return Response({"description": description}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error for debugging
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)