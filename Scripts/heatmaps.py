# -*- coding: utf-8 -*-
"""
Created on Sun May 24 23:14:48 2020

@author: mique
"""


import pandas as pd
import json
import numpy as np
import sqlalchemy
from datetime import datetime
import pytz
from urllib.request import urlopen
import matplotlib.pyplot as plt
import googlemaps

#El script es una mescla del de les hores i del de get densitat
#per a obtenir un mapa de una hora determinada dels trams de les rutes de la bd


tol_lat = 0.001
tol_lng = 0.001

#insertar clau
gmaps = googlemaps.Client()

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


def hora_tramo(request,hora):

    d = datetime.now()
    timezone1 = pytz.timezone("ETC/GMT")
    timezone2 = pytz.timezone("Europe/Paris")
    now = timezone1.localize(d)
    now = now.astimezone(timezone2)
    data = 0
    data_arr = []
    current_time = hora
    db = sqlalchemy.create_engine('mysql+pymysql://root:ssmm2020@localhost/ssmm_transport')

    with db.connect() as conn:
        q = "DELETE FROM hores_tram WHERE hores_tram.hora < '2000-01-01 "+str(current_time)+"';"
        conn.execute(q)
        q = "SELECT * FROM rutas WHERE rutas.hora_sortida = '2000-01-01 "+current_time+"';"
        data = pd.read_sql(q,con=conn)

        for ruta in data.values:
            indications = gmaps.directions([ruta[1],ruta[2]],[ruta[3],ruta[4]],mode='transit',departure_time=now)
            if len(indications)>0:
                indications = indications[0]
                #si walking o en transit
                tram_types = []
                #indica on comença i on acaba el tram en la llista de coord
                tram_bounds = []

                coords = []

                for leg in indications['legs']:
                    get_steps(leg,coords,tram_types,tram_bounds)

                coords = np.array(coords)
                #coords = coords[np.where(tram_types != 'WALKING')]

                if coords.shape[0]>10:
                    n_trams = int(coords.shape[0]*0.3)
                else:
                    n_trams= coords.shape[0]

                espai_tram = int(coords.shape[0]/n_trams)
                pre_trams = []
                for i in range(espai_tram-int(espai_tram/2),coords.shape[0],espai_tram):
                    pre_trams.append(coords[i])

                pre_trams=np.array(pre_trams)

                for coord in pre_trams:
                    start= coord[0]
                    end = coord[1]
                    tram_lat = (end['lat']-start['lat'])/2+start['lat']
                    tram_lng  =(end['lng']-start['lng'])/2+start['lng']

                    q = "SELECT * FROM tram WHERE"
                    q = q + " tram.lat > "+str(tram_lat-tol_lat)
                    q = q + " AND tram.lat <= "+str(tram_lat+tol_lat)
                    q = q + " AND tram.lng > "+str(tram_lng-tol_lng)
                    q = q + " AND tram.lng <= "+str(tram_lng+tol_lng)+" ;"

                    candidates = pd.read_sql(q,con=conn)

                    if candidates.values.shape[0]>0:

                        for cand in candidates.values:
                            q = "SELECT * from hores_tram WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                            cand_dens = conn.execute(q).fetchall()

                            if (len(cand_dens)>0):
                                cand_dens = cand_dens[0]
                                cand_dens = cand_dens[2]
                                q = "UPDATE hores_tram SET hores_tram.densitat = '"+str(cand_dens+1)+"' WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                                conn.execute(q)
                            else:
                                id_insert = cand[0]
                                q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert)+"');"
                                conn.execute(q)
                    else:
                        q = "INSERT INTO tram (lat,lng) VALUES ('"+str(tram_lat)+"','"+str(tram_lng)+"');"
                        conn.execute(q)
                        q = "SELECT LAST_INSERT_ID();"
                        id_insert = conn.execute(q).fetchall()
                        q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert[0][0])+"');"
                        conn.execute(q)


def save_route(h):
    d = datetime.now()
    #timezone1 = pytz.timezone('ETC/GMT')
    #timezone2 = pytz.timezone('Europe/Madrid')
    #now2 = timezone1.localize(d)
    #now = now2.astimezone(timezone2)
    current_time = d.strftime(h)




    current_time = h


    db = sqlalchemy.create_engine('mysql+pymysql://root:ssmm2020@localhost/ssmm_transport')

    with db.connect() as conn:
        latituds = []
        longituds = []
        densitats = []
        q = "SELECT * FROM hores_tram WHERE hores_tram.hora='2000-01-01 "+current_time+"';"
        hores = conn.execute(q).fetchall()
        for row in hores:
            hores_id = row[0]


            tram_id = row[3]
            q = "SELECT * FROM tram WHERE tram.tram_id = '"+str(tram_id)+"';"
            tram = conn.execute(q).fetchall()[0]
            if (tram[2] > 2.0497 and tram[2]<2.2658):
                if (tram[1] >41.33399 and tram[1] < 41.461):
                    densitats.append(row[2])
                    latituds.append(tram[1])
                    longituds.append(tram[2])


        densitats = [d**2 for d in densitats]

        plt.figure()
        img = plt.imread("mapita.png")
        extent = np.min(longituds)-0.05, np.max(longituds)+0.05, np.min(latituds)-0.03, np.max(latituds)+0.01
        implot = plt.imshow(img,zorder=1,extent=extent)
        #ticks_x = [2.05,2.075,2.1,2.125,2.150,2.175,2.2,2.225]
        #ticks_y = [41.34,41.36,41.38,41.4,41.42,41.44,41.46]
        #plt.xticks(ticks_x)
        #plt.yticks(ticks_y)
        # Add trace
        plt.scatter(longituds,latituds,densitats,zorder=2)
        #plt.xlim(2.054019,2.241348)
        #plt.ylim(41.336714,41.442600)
        plt.show()






for h in range(10,24):
    hor = str(h)+":00:00"
    hora_tramo([0],hor)
    save_route(hor)