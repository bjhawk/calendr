##
#Common functions - currently only DB functions, but could be much expanded as project progresses
#TODO: DB could be a class, rather than a set of functions
##

import MySQLdb
import dbconfig

#Connect to DB and return connection object
def db_connect():
    return MySQLdb.connect(dbconfig.DBHOST, dbconfig.DBUSER, dbconfig.DBPSWD, dbconfig.DBNAME) or False

#Manually Close a DB connection object
def db_close(connection):
    if connection:
        return connection.close()
    else:
        return

#Create db connection, cursor, execute query, return all rows as result
def db_fetchAll(query, data):
    connection = db_connect()
    with connection:
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(query, data)
        result = cursor.fetchall()
        return result

#Create db connection, cursor, execute query, return a single row as result
def db_fetchOne(query, data):
    connection = db_connect()
    with connection:
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(query, data)
        result = cursor.fetchone()
        return result

#Create db connection, cursor, execute query that will mutate date in table.
def db_mutate(query, data):
    connection = db_connect()
    with connection:
        cursor = connection.cursor()
        return cursor.execute(query, data) or False
