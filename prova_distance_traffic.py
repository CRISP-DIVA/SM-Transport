# -*- coding: utf-8 -*-
import googlemaps
from datetime import datetime
import json
import pandas as pd
import math 
import numpy as np

#PARAMETERS
factor = 1




gmaps = googlemaps.Client(key='AIzaSyCYKWuRKddltQK9sAMeWTWfBOn7_wIZUSY')
df = pd.read_csv("2019_densitat.csv")
print(df.head(20))
# Request directions via public transit
now = datetime.now()

barris = df['Nom_Barri']
densitats = df['Densitat neta (hab/ha)']

coords = gmaps.geocode("El Raval,Barcelona")
geo_barri = coords[0]['geometry']
bounds_barri = geo_barri['bounds']
print(bounds_barri)



for barri,densitat in zip(barris,densitats):
    datos_barrio = gmaps.geocode(barri+str(",Barcelona"))
    for ruta in range(densitat*factor):
        
        angulo = np.random.randInt(0,360)
        angulo_rad = math.radians(angulo)
        
        geo_barri = datos_barrio['geometry']
        
        bounds_barri = geo_barri['bounds']
        
        upper_right = bounds_barri['northeast']
        lower_left = bounds_barri['southwest']
        
        center_lat = (upper_right['lat']-lower_left['lat'])/2+lower_left['lat']
        center_lng = (upper_right['lng']-lower_left['lng'])/2+lower_left['lng']
        
        radi_barri = np.max((upper_right['lat']-lower_left['lat'])/2,(upper_right['lng']-lower_left['lng'])/2)
        
        radi_barri = np.random.randint(1,radi_barri)
        
        new_lat = center_lat+np.sin(angulo_rad)*radi_barri
        new_lng = center_lng+np.cos(angulo_rad)*radi_barri
        
        
        


for i in range(10):
    t = datetime(2020,5,11,6+i)
    dist_result = gmaps.distance_matrix("Escola Enginyeria, UAB, Bellaterra","Parc Güell, Barcelona",departure_time=t,mode="transit",language="es",units="metric")
    

    a = dist_result['rows'][0]['elements'][0]['duration']['value']
    print(a)
    '''