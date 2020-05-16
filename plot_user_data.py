# -*- coding: utf-8 -*-
import pandas as pd
import pylab as plt

df = pd.read_csv("random_user_data.csv")

plt.figure()
for d in df.values:
    #crop outliers
    if (d[2] > 2.0497 and d[2]<2.2658)and (d[4] > 2.0497 and d[4]<2.2658):
        if (d[1] >41.33399 and d[1] < 41.461) and (d[3] >41.33399 and d[3] < 41.461):
            plt.plot([d[2],d[4]],[d[1],d[3]])

plt.ylim(41.33399,41.461)
plt.xlim(2.0497,2.2658)
plt.show()
