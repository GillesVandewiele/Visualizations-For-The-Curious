import os
import io
import json
import math
import string
from geopy.geocoders import Nominatim
import requests
import getopt
import sys

class Location(object):
	name = None
	nr = -1
	lat = -1
	long = -1
	routes = None

	def __init__(self, name, lat, long, nr):
		self.name = name
		self.lat = lat
		self.long = long
		self.nr = nr
		self.routes = list()
		
	def add_route(self, route_nr):
		self.routes.append(route_nr)
				
	def to_JSON(self):
		return {"name": self.name, "lat":  self.lat, "long": self.long, "nr": self.nr, "routes": self.routes}
		
class LocationRepository(object):
	locationDict = dict()
		
	def add_location(self, name, extraInfo, nr):
		if (not (name in self.locationDict)):
			if (extraInfo!=None):
				long_name = name + " " + extraInfo
			else:
				long_name = name
			correct = False
			query = name
			while (not correct):
				try:
					loc = Nominatim().geocode(query)
					querySuccess = True
					result = loc.address
				except:
					querySuccess = False
					result = "No address found!"
					pass
				print("Searched: " + long_name)
				print("Found:    " + result)
				if (querySuccess):
					print("Is this address ok? Enter = yes, if no, enter another query.")
				else:
					print("Query failed. Enter another query.")
				query = input()
				correct = ((query == "") and querySuccess)
			self.locationDict[name] = Location(loc.address, loc.latitude, loc.longitude, len(self.locationDict))
		self.locationDict[name].add_route(nr)
			
	def __len__(self):
		return len(self.locationDict)
		
	def to_JSON(self):
		output = dict()
		for loc in self.locationDict:
			output[loc] = self.locationDict[loc].to_JSON()
		return output

INPUT_PATH = None
REPO_PATH = None
	
optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		REPO_PATH = a
	
if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the route repository: ")
if (REPO_PATH == None):
	REPO_PATH = input("Give path where the location repository must be stored: ")

file = open(INPUT_PATH, "r")
routes_as_string = json.load(file)
file.close()
	
locationRep = LocationRepository()
for route in routes_as_string:
	locationRep.add_location(route["start"], route["extra_info"], route["nr"])
	locationRep.add_location(route["stop"], route["extra_info"], route["nr"])
	
with open(REPO_PATH, 'w') as outfile:
    json.dump(locationRep.to_JSON(), outfile, ensure_ascii = False, indent = 1)