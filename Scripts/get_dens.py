import json
import pandas as pd
import numpy as np
import sqlalchemy
from datetime import datetime
import pytz
from urllib.request import urlopen


#Funcio que retorna les densitats dels trams d'una ruta
def get_dens(request):

    #Obtenim dades request
    df = request.get_json()

    #Obtenim hora actual
    d = datetime.now()
    timezone1 = pytz.timezone('ETC/GMT')
    timezone2 = pytz.timezone('Europe/Madrid')
    now2 = timezone1.localize(d)
    now = now2.astimezone(timezone2)
    actual_time = now.strftime("%H:00:00")


    d_time = df['departure_time']
    #Obtenim Hora de la ruta
    current_time = str(d_time['hora'])+":00:00"
    #current_time = "17:00:00"
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

    db = sqlalchemy.create_engine(
    # Equivalent URL:
    # mysql+pymysql://<db_user>:<db_pass>@/<db_name>?unix_socket=/cloudsql/<cloud_sql_instance_name>
    sqlalchemy.engine.url.URL(
        drivername="mysql+pymysql",
        username="",
        password="",
        database="",
        query={"unix_socket": "/cloudsql/{}".format("")},
    ),
    # ... Specify additional properties here.
    # [START_EXCLUDE]
    # [START cloud_sql_mysql_sqlalchemy_limit]
    # Pool size is the maximum number of permanent connections to keep.
    pool_size=5,
    # Temporarily exceeds the set pool_size if no connections are available.
    max_overflow=2,
    # The total number of concurrent connections for your application will be
    # a total of pool_size and max_overflow.
    # [END cloud_sql_mysql_sqlalchemy_limit]
    # [START cloud_sql_mysql_sqlalchemy_backoff]
    # SQLAlchemy automatically uses delays between failed connection attempts,
    # but provides no arguments for configuration.
    # [END cloud_sql_mysql_sqlalchemy_backoff]
    # [START cloud_sql_mysql_sqlalchemy_timeout]
    # 'pool_timeout' is the maximum number of seconds to wait when retrieving a
    # new connection from the pool. After the specified amount of time, an
    # exception will be thrown.
    pool_timeout=30,  # 30 seconds
    # [END cloud_sql_mysql_sqlalchemy_timeout]
    # [START cloud_sql_mysql_sqlalchemy_lifetime]
    # 'pool_recycle' is the maximum number of seconds a connection can persist.
    # Connections that live longer than the specified amount of time will be
    # reestablished
    pool_recycle=1800,  # 30 minutes
    # [END cloud_sql_mysql_sqlalchemy_lifetime]
    # [END_EXCLUDE]
    )

    #Conect DB

    with db.connect() as conn:

        #Agafem la densitat màxima de la bd per a comparar
        q = "SELECT max(hores_tram.densitat) FROM hores_tram WHERE hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
        dens_max = conn.execute(q).fetchall()
        dens_max = dens_max[0]
        if dens_max[0] != None:
            dens_max = dens_max[0]
        else:
            dens_max = 0

        #Per a cada Ruta
        for ruta in steps:
            densitats = []
            #Per a cada pas a la ruta
            for step in ruta:

                travel_modes.append(step[0]['travel_mode'])
                coords = step[0]['path']
                coords = np.array(coords)

                densitats_tram = []
                #Escollim el nombre de trams amb un percentatge de les coordenades del tram(possible millora)
                if coords.shape[0]>10:
                    n_trams = int(coords.shape[0]*0.04)
                    if n_trams <10:
                        n_trams = 10
                else:
                    n_trams= coords.shape[0]

                #Calculem l'espai entre els trams al vector de coordenades
                espai_tram = int(coords.shape[0]/n_trams)

                pre_trams = []
                #Recorrem les coordenades agafant trams cada espai_tram
                for i in range(espai_tram-int(espai_tram/2),coords.shape[0],espai_tram):
                    pre_trams.append(coords[i])

                pre_trams=np.array(pre_trams)

                #Per a cada tram creat
                for tram in pre_trams:
                    #Escollim trams que s'assemblin amb la tolerància
                    q = "SELECT * FROM tram WHERE"
                    q = q + " tram.lat > "+str(float(tram['latitud'])-tol_lat)
                    q = q + " AND tram.lat <= "+str(float(tram['latitud'])+tol_lat)
                    q = q + " AND tram.lng > "+str(float(tram['longitud'])-tol_lng)
                    q = q + " AND tram.lng <= "+str(float(tram['longitud'])+tol_lng)+" ;"

                    candidates = pd.read_sql(q,con=conn)
                    #Si hi ha candidats
                    if candidates.values.shape[0]>0:

                        for cand in candidates.values:

                            #Obtenim la seva densitat
                            q = "SELECT * from hores_tram WHERE hores_tram.tram_id = '"+str(cand[0])+"' AND hores_tram.hora = '"+"2000-01-01 "+current_time+"';"
                            cand_dens = conn.execute(q).fetchall()

                            if (len(cand_dens)>0):
                                cand_dens = cand_dens[0]
                                cand_dens = cand_dens[2]

                                if dens_max != 0:
                                    #Si tenen densitat es fa append de la seva densitat amb la màxima
                                    densitats_tram.append(cand_dens/dens_max)
                                else:
                                    densitats_tram.append(0)
                            #Si no hi ha densitat es calcula la seva densitat com a 1/maxima
                            else:
                                id_insert = cand[0]

                                if dens_max != 0:
                                    densitats_tram.append(1/dens_max)
                                else:
                                    densitats_tram.append(0)



                    else:

                        #Si no hi ha candidats es calcula la seva densitat com a 1/maxima
                        if dens_max != 0:
                            densitats_tram.append(1/dens_max)
                        else:
                            densitats_tram.append(0)



                #Es fa avg de les densitats de cada tram i es fa append a una llista de la ruta
                dens_tram_avg = np.average(np.array(densitats_tram))
                densitats.append(dens_tram_avg)
            #Append a la llista general
            densitats_rutes.append(densitats)


        #Categorització de les rutes segons la densitat
        dens_final = []
        for ruta in densitats_rutes:
            dens_tram_final = []
            for dens_tram in ruta:
                #green
                if dens_tram <= 0.10:
                    dens_tram_final.append(0)
                #yellow
                elif dens_tram <= 0.4:
                    dens_tram_final.append(1)
                #orange
                elif dens_tram <= 0.8:
                    dens_tram_final.append(2)
                #red
                elif not np.isnan(dens_tram):
                    dens_tram_final.append(3)
                #green(outliers/no data)
                else:
                    dens_tram_final.append(0)

            dens_final.append(dens_tram_final)

        #Creació JSON per enviar
        j = 0
        ruta_count = 0
        out = '{'
        for densitats in dens_final:
            out = out +'"densitats'+str(ruta_count)+'": ['
            j = 0
            for d in densitats:
                out = out +'{"'+ str(j)+'": '
                out = out + '"'+str(d)
                out = out + '"},'
                j = j + 1
            ruta_count = ruta_count +1
            out = out[:-1] + "],"
        out = out[:-1] + '}'
    return out