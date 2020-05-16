# -*- coding: utf-8 -*-
from datetime import datetime
import json
import pandas as pd
import math 
import numpy as np
import pylab as plt

df = pd.read_csv("2020_01_Gener_TRAMS_TRAMS.csv")
df['data'] = pd.to_datetime(df['data'],format="%Y%m%d%H%M%S")

print(df[df['estatActual'] != 0])
df = df.set_index("data")
estats_mitja = []
for hora in range(24):
    data_hora = df.between_time(str(hora)+":00",str(hora)+":58")
    
    count_estats = []
    estat_mitja = 0
    
    for estat in range(1,6):
        data_estat = data_hora[data_hora['estatActual']==estat]
        count_estats.append(data_estat.shape[0])
    
    total_trams = np.sum(np.array(count_estats))
    
    for estat in range(1,6):
        estat_mitja = estat_mitja + estat*(count_estats[estat-1]/total_trams)
    
    
    
    
    estats_mitja.append(estat_mitja)
    

estatmax = np.max(np.array(estats_mitja))
estats_norm = []

file = open("densitat_hores_bcn.csv","w")
file.write("Hora,Densitat\n")
hora = 0
for estat in estats_mitja:
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