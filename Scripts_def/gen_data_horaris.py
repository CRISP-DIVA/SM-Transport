# -*- coding: utf-8 -*-
from datetime import datetime
import json
import pandas as pd
import math
import numpy as np
import pylab as plt

#Importem dades traffic
df = pd.read_csv("2020_01_Gener_TRAMS_TRAMS.csv")
df['data'] = pd.to_datetime(df['data'],format="%Y%m%d%H%M%S")

print(df[df['estatActual'] != 0])
df = df.set_index("data")
estats_mitja = []

#Per cada hora del dataset
for hora in range(24):
    #Extreure files
    data_hora = df.between_time(str(hora)+":00",str(hora)+":58")

    count_estats = []
    estat_mitja = 0
    #Per cada estat de trafic es compta quantes arees del barri estan en aquell estat
    for estat in range(1,6):
        data_estat = data_hora[data_hora['estatActual']==estat]
        count_estats.append(data_estat.shape[0])
    #Es sumen els counts
    total_trams = np.sum(np.array(count_estats))

    #Es fa la mitjana del tràfic d'aquella hora
    for estat in range(1,6):
        estat_mitja = estat_mitja + estat*(count_estats[estat-1]/total_trams)




    estats_mitja.append(estat_mitja)

#Obtenim max per normalitzar
estatmax = np.max(np.array(estats_mitja))
estats_norm = []

#Creem dataset
file = open("densitat_hores_bcn.csv","w")
file.write("Hora,Densitat\n")
hora = 0
for estat in estats_mitja:
    #Normalitzacio
    estat = estat/estatmax
    estats_norm.append(estat)
    if hora < 10:
        file.write("0"+str(hora)+":00:00,"+str(estat)+"\n")
    else:
        file.write(str(hora)+":00:00,"+str(estat)+"\n")
    hora = hora + 1

file.close()
plt.figure()
plt.plot(estats_norm)
plt.show()