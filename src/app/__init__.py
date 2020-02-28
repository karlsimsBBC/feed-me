# -*- coding: utf-8 -*-
from flask import Flask

# Initialize the app
app = Flask(__name__, instance_relative_config=True)

# # Load the views
from src.app import views

# Load the config file
app.config.from_object('config')