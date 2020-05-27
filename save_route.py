# -*- coding: utf-8 -*-
"""
Created on Sun May 24 20:58:22 2020

@author: mique
"""


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



def save_route():
    d = datetime.now()
    #timezone1 = pytz.timezone('ETC/GMT')
    #timezone2 = pytz.timezone('Europe/Madrid')
    #now2 = timezone1.localize(d)
    #now = now2.astimezone(timezone2)
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
    d_time = df['departure_time']
    current_time = str(d_time['hora'])+":00:00"
    travel_modes = []
    
    tol_lat = 0.001
    tol_lng = 0.001
    densitats_rutes = []
    
    db = sqlalchemy.create_engine('mysql+pymysql://root:ssmm2020@localhost/ssmm_transport')
        
    with db.connect() as conn:
        q = "INSERT INTO rutas (originlat,originlng,destlat,destlng,hora_sortida,trans_mode,user_id) VALUES ('"+start[0][1:-1]+"','"+start[1][:-1]+"','"+end[0][1:-1]+"','"+end[1][:-1]+"','"+"2000-01-01 "+current_time+"','transit','2');"
        conn.execute(q)
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
                        q = "INSERT INTO tram (lat,lng) VALUES ('"+str(tram['latitud'])+"','"+str(tram['longitud'])+"');"
                        conn.execute(q)
                        q = "SELECT LAST_INSERT_ID();"
                        id_insert = conn.execute(q).fetchall()
                        q = "INSERT INTO hores_tram (hora,densitat,tram_id) VALUES ('"+"2000-01-01 "+current_time+"','"+str(1)+"','"+str(id_insert[0][0])+"');"
                        conn.execute(q)
               
        
        
    return 'OK'
                        
out = save_route()
print(out)            
        

