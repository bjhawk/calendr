import MySQLdb
import dbconfig

def db_connect():
    return MySQLdb.connect(dbconfig.DBHOST, dbconfig.DBUSER, dbconfig.DBPSWD, dbconfig.DBNAME) or false

def db_close(connection):
    if connection:
        return connection.close()
    else:
        return

def db_fetchAll(query, data):
    connection = db_connect()
    with connection:
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(query, data)
        result = cursor.fetchall()
        return result

def db_fetchOne(query, data):
    connection = db_connect()
    with connection:
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(query, data)
        result = cursor.fetchone()
        return result

def db_mutate(query, data):
    connection = db_connect()
    with connection:
        cursor = connection.cursor()
        cursor.execute(query, data)
        return
