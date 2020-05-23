# -*- coding: utf-8 -*-
"""
Editor de Spyder

Este es un archivo temporal.
"""
import requests
import pandas as pd
import time

df  = pd.read_csv("random_user_data.csv")
for  data in df.values:
    d = {"olat": str(data[1]),"olng": str(data[2]),"dlat": str(data[3]),"dlng": str(data[4]),"hora": "2000-01-01 "+data[6],"mode": data[5],"user_id": str(data[0])}
    response = requests.post('https://us-central1-ssmm-transport-python.cloudfunctions.net/insertrut', json=d)
    print(response.status_code)
