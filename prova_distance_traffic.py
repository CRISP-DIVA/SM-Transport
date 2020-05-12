# -*- coding: utf-8 -*-
import googlemaps
from datetime import datetime
import json

gmaps = googlemaps.Client(key='AIzaSyCYKWuRKddltQK9sAMeWTWfBOn7_wIZUSY')


# Request directions via public transit
now = datetime.now()

for i in range(10):
    t = datetime(2020,5,11,6+i)
    dist_result = gmaps.distance_matrix("Escola Enginyeria, UAB, Bellaterra","Parc Güell, Barcelona",departure_time=t,mode="transit",language="es",units="metric")
    

    a = dist_result['rows'][0]['elements'][0]['duration']['value']
    print(a)