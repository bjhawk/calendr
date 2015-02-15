from flask import render_template, url_for, jsonify, request
from datetime import datetime
from app import app
import api


@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return "Hallo Werld!"

@app.route('/calendar')
@app.route('/calendar/<year>/<month>')
def calendr(year = None, month = None):
    if not (year and month):
        dt = datetime.now()
        year = dt.year
        month = dt.month
    return api.build_calendar(year, month)
    # api forms JSON of calendar data, display with REACT
    return render_template('calendar.html', year = year, month = month)

@app.route('/manage')
def manage(action=None):
    return render_template('manage.html')
    

@app.route('/report')
def report():
    return render_template("report.html")

@app.route('/api/<apiMethod>', methods=['GET', 'POST'])
# @app.route('/api/<apiMethod>/', methods=['GET', 'POST'])
def call_api(apiMethod):
    methodToCall = getattr(api, apiMethod)
    if methodToCall(request.form):
        status = 200
    else:
        status = 500
    return jsonify(result={"status": status})

@app.route('/testdb')
def dbtest():
    return request.method

@app.route("/test")
def htraftest():
    return render_template("htraftest.html")
