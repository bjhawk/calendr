from flask import Flask

# Create Flask app object
app = Flask(__name__)
from app import views
