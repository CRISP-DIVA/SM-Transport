# -*- coding: utf-8 -*-
"""
Created on Sat May 23 16:13:54 2020

@author: mique
"""

import pandas as pd
import json
import numpy as np
import sqlalchemy
from datetime import datetime
import pytz
from urllib.request import urlopen



def get_dens():

    d = datetime.now()

    current_time = d.strftime("%H:00:00")

    file = open("web2/json_ruta_prova.txt",'r')
    string_data = file.readline()
    df = json.loads(string_data)

    start = df['start_location']
    end = df['end_location']
    duration = df['duration']
    steps = df['steps']
    start = start.split()
    end = end.split()

    travel_modes = []

    tol_lat = 0.001
    tol_lng = 0.001
    densitats_rutes = []

    db = sqlalchemy.create_engine('mysql+pymysql://root:ssmm2020@localhost/ssmm_transport')

    with db.connect() as conn:
        for ruta in steps:
            densitats = []



            for step in ruta:
                travel_modes.append(step[0]['travel_mode'])
                coords = step[0]['path']
                coords = np.array(coords)
                densitats_tram = []
                if coords.shape[0]>10:
                    n_trams = int(coords.shape[0]*0.04)
                    if n_trams <10:
                        n_trams = 10
                else:
                    n_trams= coords.shape[0]

                pre_trams = []
                for i in range(n_trams):
                    pre_trams.append(coords[np.random.randint(0,coords.shape[0])])
                pre_trams=np.array(pre_trams)

                for tram in pre_trams:
                    q = "SELECT * FROM tram WHERE"
                    q = q + " tram.lat > "+str(float(tram['latitud'])-tol_lat)
                    q = q + " AND tram.lat <= "+str(float(tram['latitud'])+tol_lat)
                    q = q + " AND tram.lng > "+str(float(tram['longitud'])-tol_lng)
                    q = q + " AND tram.lng <= "+str(float(tram['longitud'])+tol_lng)+" ;"

                    candidates = pd.read_sql(q,con=conn)
                    q = "SELECT sum(hores_tram.densitat) from hores_tram WHERE hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                    avg_dens = conn.execute(q).fetchall()
                    if (len(avg_dens)>0):
                        avg_dens = avg_dens[0]
                        avg_dens = avg_dens[0]

                    if candidates.values.shape[0]>0:

                                for cand in candidates.values:
                                    q = "SELECT * from hores_tram WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                                    cand_dens = conn.execute(q).fetchall()


                                    if (len(cand_dens)>0):
                                        cand_dens = cand_dens[0]
                                        cand_dens = cand_dens[2]
                                        q = "UPDATE hores_tram SET hores_tram.densitat = '"+str(cand_dens+1)+"' WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                                        conn.execute(q)
                                        densitats_tram.append((cand_dens+1)/avg_dens)
                                    else:
                                        id_insert = cand[0]
                                        densitats_tram.append(1/avg_dens)
                                        q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert)+"');"
                                        conn.execute(q)
                    else:
                        q = "INSERT INTO tram (lat,lng) VALUES ('"+str(tram['latitud'])+"','"+str(tram['longitud'])+"');"
                        conn.execute(q)
                        q = "SELECT LAST_INSERT_ID();"
                        id_insert = conn.execute(q).fetchall()
                        densitats_tram.append(1/avg_dens)
                        q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert[0][0])+"');"

                        conn.execute(q)
                dens_tram_avg = np.average(np.array(densitats_tram))
                densitats.append(dens_tram_avg)

            densitats_rutes.append(densitats)

        j = 0
        ruta_count = 0
        out = '{'
        for densitats in densitats_rutes:
            out = out +'"densitats'+str(ruta_count)+'": ['
            j = 0
            for d in densitats:
                out = out +'"'+ str(j)+'": '
                out = out + '"'+str(d)
                out = out + '",'
                j = j + 1
            ruta_count = ruta_count +1
            out = out[:-1] + "],"
        out = out[:-1] + "}"
    return out

out = get_dens()
print(out)


