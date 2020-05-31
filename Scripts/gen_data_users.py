# -*- coding: utf-8 -*-
import googlemaps
from datetime import datetime
import json
import pandas as pd
import math 
import numpy as np

#PARAMETERS
factor = 0.05


#Fichero en el que se genera el dataset, se va a ir rellenando
file_out = open("random_user_data2.csv","w")
#cabecera
file_out.write("UsrId,OriginLat,OriginLng,DestinationLat,DestinationLng,Transport Mode,Departure Time\n")

#API maps
gmaps = googlemaps.Client(key='AIzaSyCYKWuRKddltQK9sAMeWTWfBOn7_wIZUSY')

#Data Input
df = pd.read_csv("2019_densitat.csv")
data_horaris = pd.read_csv("densitat_hores_bcn.csv")

#Para iterar por barrio i densidad
barris = df['Nom_Barri']
densitats = df['Densitat neta (hab/ha)']

#Variables AUX
user_id_count = 0
hora = 0
api_calls = 0

#Ahora pasamos a normalizar las densidades para poderlas usar como probabilidad
densitats_norm = []
densmax = np.max(densitats)
for d in densitats:
    d = d/densmax
    densitats_norm.append(d)

#Aver lo que cuesta...
api_calls = int(np.sum(densitats.values)*factor)*2
print(api_calls)

for barri,densitat in zip(barris,densitats):
    #Call a la api coordenadas barrio origen
    datos_barrio = gmaps.geocode(barri+str(",Barcelona"))
    
    #Empieza el pachurro para sacar latitud y longitud
    geo_barri = datos_barrio[0]['geometry']
    #Cojemos Bounds
    bounds_barri = geo_barri['viewport']
    #upright
    upper_right = bounds_barri['northeast']
    #lowleft
    lower_left = bounds_barri['southwest']
    
    #Pillamos centro del barrio(coord)
    center_lat = (upper_right['lat']-lower_left['lat'])/2+lower_left['lat']
    center_lng = (upper_right['lng']-lower_left['lng'])/2+lower_left['lng']
    
    #La que sea mas grande la usamos para el radio de creacion de rutas(random)
    max1 = (upper_right['lat']-lower_left['lat'])/2
    max2 = (upper_right['lng']-lower_left['lng'])/2
    radi_barri = np.max([max1,max2])
    
    #Con esto hacemos que los barrios mas densos den mas rutas, 
    #hay un factor para reducir/augmentar el numero de calls
    for ruta in range(int(densitat*factor)):
        
        #Random angulo
        angulo = np.random.randint(0,360)
        angulo_rad = math.radians(angulo)
        
        #Radio random dentro del limite anterior
        radi_barri = np.random.uniform(0,radi_barri)
        
        #Se calcula la nueva posicion para el origen
        new_lat = center_lat+(np.sin(angulo_rad)*radi_barri)
        new_lng = center_lng+(np.cos(angulo_rad)*radi_barri)
        
        #Se pilla una hora de salida random siguiendo la distribucion de probabilidad que da el dataset
        hora_sortida = data_horaris.sample(weights=data_horaris['Densitat'])
        hora_sortida = hora_sortida['Hora'].values[0]
        
        #Escribimos usr ID y lat i lng origen
        file_out.write(str(user_id_count)+",")
        user_id_count = user_id_count + 1
        file_out.write(str(new_lat)+","+str(new_lng))
        
        # Pillamos un barrio destino usando la densidad como distribucion 
        # de probabilidad(se podria cambiar a algo que represente el trabajo)
        barri_desti = df.sample(weights=densitats_norm)['Nom_Barri']
        barri_desti = barri_desti.values[0]
        print("Barri Desti: "+barri_desti)
        
        #LLamada api desti
        datos_barrio_desti = gmaps.geocode(barri_desti+str(",Barcelona"))
        
        #Pachurro conocido
        geo_barri_desti = datos_barrio_desti[0]['geometry']
        bounds_barri_desti = geo_barri_desti['viewport']
        upper_right_desti = bounds_barri_desti['northeast']
        lower_left_desti = bounds_barri_desti['southwest']
        
        #Pillamos Centro
        center_lat_desti = (upper_right_desti['lat']-lower_left_desti['lat'])/2+lower_left_desti['lat']
        center_lng_desti = (upper_right_desti['lng']-lower_left_desti['lng'])/2+lower_left_desti['lng']
        
        #Pillamos Radio
        radi_barri_desti = np.max([(upper_right_desti['lat']-lower_left_desti['lat'])/2,(upper_right_desti['lng']-lower_left_desti['lng'])/2])
        
        #Angulo y radio random con bound
        angulo_desti = np.random.randint(0,360)
        angulo_rad_desti = math.radians(angulo_desti)
        radi_barri_desti = np.random.uniform(0,radi_barri_desti)
        
        #Nuevas lat y long del destino
        new_lat_desti = center_lat_desti+(np.sin(angulo_rad_desti)*radi_barri_desti)
        new_lng_desti = center_lng_desti+(np.cos(angulo_rad_desti)*radi_barri_desti)
        
        #Escribimos los Datos que faltan en el csv
        file_out.write(","+str(new_lat_desti)+","+str(new_lng_desti)+",transit,"+str(hora_sortida)+"\n")
        
        
file_out.close()
        
           
        

'''
for i in range(10):
    t = datetime(2020,5,11,5+i)
    dist_result = gmaps.distance_matrix("Escola Enginyeria, UAB, Bellaterra","Parc Güell, Barcelona",departure_time=t,mode="transit",language="es",units="metric")
    a = dist_result['rows'][0]['elements'][0]['duration']['value']
    print(a)
'''