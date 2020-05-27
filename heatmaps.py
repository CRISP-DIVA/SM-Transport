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


def save_route():
    d = datetime.now()
    #timezone1 = pytz.timezone('ETC/GMT')
    #timezone2 = pytz.timezone('Europe/Madrid')
    #now2 = timezone1.localize(d)
    #now = now2.astimezone(timezone2)
    current_time = d.strftime("%H:00:00")
    
  
    
   
    current_time = "09:00:00"
    
    
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
        
       
        
        
        
        
    
        

save_route()