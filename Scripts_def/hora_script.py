# -*- coding: utf-8 -*-
"""
Created on Fri May 22 15:36:59 2020

@author: mique
"""


import os
import pymysql
import sqlalchemy
import pandas as pd
import googlemaps
import numpy as np
from datetime import datetime
import pytz

#Toleràncies de latitud i longitud per a considerar que un tram és igual que un altre
tol_lat = 0.001
tol_lng = 0.001
#insertar clau
gmaps = googlemaps.Client()

#Funcio recursiva per extreure les coordenades de la ruta de maps
def get_steps(ruta,coords,tram_types,tram_bounds):

    #Si el paso actual contiene subpasos
    if 'steps' in ruta.keys():
        for step in ruta['steps']:
            get_steps(step,coords,tram_types,tram_bounds)
    #Sino ya podemos coger las coord
    else:
        coords.append(np.array([ruta['start_location'],ruta['end_location']]))
        tram_types.append(ruta['travel_mode'])
        return True

#Cloud Function Principal amb un schedule per executarse cada hora
def hora_tramo(request):

    d = datetime.now()
    timezone1 = pytz.timezone("ETC/GMT")
    timezone2 = pytz.timezone("Europe/Paris")
    now = timezone1.localize(d)
    now = now.astimezone(timezone2)
    data = 0
    data_arr = []
    #Obtenim hora actual
    current_time = now.strftime("%H:00:00")
    db = sqlalchemy.create_engine('mysql+pymysql://root:ssmm2020@localhost/ssmm_transport')

    #Connexio bd
    with db.connect() as conn:

        #Eliminem les dades de densitat(no els trams amb lat i lng) de la hora/hores anteriors
        q = "DELETE FROM hores_tram WHERE hores_tram.hora < '2000-01-01 "+str(current_time)+"';"
        conn.execute(q)

        #Seleccionem les rutes que tinguin planificat sortir a aquesta hora
        q = "SELECT * FROM rutas WHERE rutas.hora_sortida = '2000-01-01 "+current_time+"';"
        data = pd.read_sql(q,con=conn)

        #Per cada ruta del dataset
        for ruta in data.values:

            #Obtenim indicacions de la api de maps
            indications = gmaps.directions([ruta[1],ruta[2]],[ruta[3],ruta[4]],mode='transit',departure_time=now)


            if len(indications)>0:
                indications = indications[0]
                #si walking o en transit
                tram_types = []
                #indica on comença i on acaba el tram en la llista de coord
                tram_bounds = []

                coords = []

                #Per a cada leg(pas) de la ruta extreiem coordenades
                for leg in indications['legs']:
                    get_steps(leg,coords,tram_types,tram_bounds)

                coords = np.array(coords)
                #coords = coords[np.where(tram_types != 'WALKING')]

                #Calculem amb un percentatge el nombre de trams que es calcularàn per la ruta(a millorar en un futur)
                if coords.shape[0]>10:
                    n_trams = int(coords.shape[0]*0.3)
                else:
                    n_trams= coords.shape[0]

                #Calculem el espai que deixar entre trams a partir del nombre calculat
                espai_tram = int(coords.shape[0]/n_trams)
                pre_trams = []
                #Recorrem les coordenades recollint el nombre de trams calculat
                for i in range(espai_tram-int(espai_tram/2),coords.shape[0],espai_tram):
                    pre_trams.append(coords[i])

                pre_trams=np.array(pre_trams)

                #Per cada tram calculem el seu centre(end-start)
                for coord in pre_trams:
                    start= coord[0]
                    end = coord[1]
                    tram_lat = (end['lat']-start['lat'])/2+start['lat']
                    tram_lng  =(end['lng']-start['lng'])/2+start['lng']

                    #Busquem a la bd trams similars
                    q = "SELECT * FROM tram WHERE"
                    q = q + " tram.lat > "+str(tram_lat-tol_lat)
                    q = q + " AND tram.lat <= "+str(tram_lat+tol_lat)
                    q = q + " AND tram.lng > "+str(tram_lng-tol_lng)
                    q = q + " AND tram.lng <= "+str(tram_lng+tol_lng)+" ;"

                    #Llista trams candidats
                    candidates = pd.read_sql(q,con=conn)

                    #Si hi ha candidat hem de sumarli a la seva densitat
                    if candidates.values.shape[0]>0:

                        for cand in candidates.values:
                            #Seleccionem el tram per obtenir la densitat d'aquest
                            q = "SELECT * from hores_tram WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                            cand_dens = conn.execute(q).fetchall()
                            #Si el tram té densitat(ja ha estat insertat aquesta hora) li sumem un a la seva densitat
                            if (len(cand_dens)>0):
                                cand_dens = cand_dens[0]
                                cand_dens = cand_dens[2]
                                q = "UPDATE hores_tram SET hores_tram.densitat = '"+str(cand_dens+1)+"' WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                                conn.execute(q)
                            #Si no la te es que existeix d'una hora anterior
                            else:
                                id_insert = cand[0]
                                q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert)+"');"
                                conn.execute(q)
                    #Si no hi ha candidat creem el tram e inicialitzem la densitat a 1
                    else:
                        q = "INSERT INTO tram (lat,lng) VALUES ('"+str(tram_lat)+"','"+str(tram_lng)+"');"
                        conn.execute(q)
                        q = "SELECT LAST_INSERT_ID();"
                        id_insert = conn.execute(q).fetchall()
                        q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert[0][0])+"');"
                        conn.execute(q)






hora_tramo([0])