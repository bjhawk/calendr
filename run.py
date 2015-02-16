#!/flask/bin/python
from gevent.wsgi import WSGIServer
from app import app

if __name__ == '__main__':
    app.debug = False
    
    # Flask Dev Server
    if app.debug:
        app.run(host='0.0.0.0', port=80)
    else:
        # Gevent Server
        http_server = WSGIServer(('', 80), app)
        http_server.serve_forever()
