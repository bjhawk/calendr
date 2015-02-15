#!/flask/bin/python
import os
# activate_this = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'venv/bin/activate_this.py')
# execfile(activate_this, dict(__file__=activate_this))
# del activate_this

from gevent.wsgi import WSGIServer
from app import app

if __name__ == '__main__':
    app.debug = True
    
    # Flask Dev Server
    if app.debug:
        app.run(host='0.0.0.0', port=5001)
    else:
        # Gevent Server
        http_server = WSGIServer(('', 5001), app)
        http_server.serve_forever()
