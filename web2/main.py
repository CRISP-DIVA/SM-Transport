# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import requests
import pandas as pd
import time
import sqlalchemy
import os
import pymysql
# [START gae_python37_app]
from flask import Flask,render_template

db_user = os.environ.get('CLOUD_SQL_USERNAME')
db_password = os.environ.get('CLOUD_SQL_PASSWORD')
db_name = os.environ.get('CLOUD_SQL_DATABASE_NAME')
db_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME')
# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

@app.route('/')

def root():
    # For the sake of example, use static information to inflate the template.
    # This will be replaced with real information in later steps.
   
    return render_template("web/index.php")
	


@app.route('/addUser')	
def addUser():
    d = {"olat": "1","olng": "1","dlat": "1","dlng": "1","hora": "2000-01-01 00:00:00","mode": "trans","user_id": "2"}
    response = requests.post('https://us-central1-ssmm-safe-transportation.cloudfunctions.net/InsertRuta2', json=d)
    print(response.status_code)
    time.sleep(0.5)
    return 'OK'

@app.route('/addRoute')
def addRoute():
    d = {"olat": "1","olng": "1","dlat": "1","dlng": "1","hora": "2000-01-01 00:00:00","mode": "trans","user_id": "2"}
    response = requests.post('https://us-central1-ssmm-safe-transportation.cloudfunctions.net/InsertRuta2', json=d)
    print(response.status_code)
    time.sleep(0.5)
    return 'OK'


@app.route('/getTrams')
def getTrams():

    if os.environ.get('GAE_ENV') == 'standard':
        # If deployed, use the local socket interface for accessing Cloud SQL
        unix_socket = '/cloudsql/{}'.format(db_connection_name)
        cnx = pymysql.connect(user=db_user, password=db_password,
                              unix_socket=unix_socket, db=db_name)
    else:
        # If running locally, use the TCP connections instead
        # Set up Cloud SQL Proxy (cloud.google.com/sql/docs/mysql/sql-proxy)
        # so that your application can use 127.0.0.1:3306 to connect to your
        # Cloud SQL instance
        host = '127.0.0.1'
        cnx = pymysql.connect(user="root", password="vilarinyoputoamoenrobotica2020",
                              host=host, db="ssmm_database")

    with cnx.cursor() as cursor:
        cursor.execute('SELECT * from rutas;')
        result = cursor.fetchall()
        current_time = result[0][0]
        print(result)
    cnx.close()
    return 'OK'



if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)