###
#Calendr - Main view routing.
#
#TODO: login page and cookie handling, user management(?)
###
#
from flask import render_template, jsonify, request
from datetime import datetime
from app import app
import api


#Main view, index redirecting to calendar view for now
#TODO: index should be splash page, login, etc.
@app.route('/')
@app.route('/index')
@app.route('/index.html')
@app.route('/calendar')
@app.route('/calendar/')
@app.route('/calendar/<year>/<month>')
def calendr(year = None, month = None):
    # Default to current year and month
    if not (year and month):
        dt = datetime.now()
        year = dt.year
        month = dt.month
    else:
        year = int(year)
        month = int(month)
    #return calendar with data built by API
    return render_template('calendar.html', rulesCalendar = api.build_calendar(year, month))

#View to add/remove Rules
#TODO: edit rules
@app.route('/manage')
def manage(action=None):
    return render_template('manage.html')
    
#HTRAF-based charts
#TODO: expand charts, currently only breaks down debits by category
@app.route('/report')
def report():
    return render_template("report.html")

#API endpoint for ajax calls.
#Current methods used are add_rule and delete_rule
#TODO: some sort of authentication, does the trailing slash need to be supported in this route?
@app.route('/api/<apiMethod>', methods=['GET', 'POST'])
# @app.route('/api/<apiMethod>/', methods=['GET', 'POST'])
def call_api(apiMethod):
    #get function as an object from api 
    methodToCall = getattr(api, apiMethod)
    #if function call returns anything but false, status 200 Success, else 500 Internal Server Error
    if methodToCall(request.form):
        status = 200
    else:
        status = 500
    return jsonify(result={"status": status})

#Debug route for testing DB connectivity
# @app.route('/testdb')
# def dbtest():
#     return request.method

#Debug route for testing HTRAF rendering
# @app.route("/test")
# def htraftest():
#     return render_template("htraftest.html")

#Debug route - original static mockup of Calendar view
# @app.route("/calmock")
# def calmock():
#     return render_template("calmock.html")
