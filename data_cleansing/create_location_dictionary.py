import os
import io
import json
import math
import string
from geopy.geocoders import Nominatim
import requests
import getopt
import sys

class LocationRepository(object):
	locationDict = dict()
	locations = list()
		
	def add_location(self, name, extraInfo, nr):
		if (not (name in self.locationDict)):
			self.locationDict[name] = len(self.locations)
			self.locations.append({"name": name, "extraInfo": extraInfo, "nr": len(self.locations), "routes": list()})
		self.locations[self.locationDict[name]]["routes"].append(nr)
		return self.locationDict[name]
			
	def __len__(self):
		return len(self.locationDict)
		
	def to_JSON(self):
		return self.locations

INPUT_PATH = None
LOC_REPO_PATH = None
ROUTE_REPO_PATH = None
	
optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "loc_rep=", "route_rep="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--loc_rep":
		LOC_REPO_PATH = a
	elif o == "--route_rep":
		ROUTE_REPO_PATH = a
		
	
if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the route repository: ")
if (LOC_REPO_PATH == None):
	LOC_REPO_PATH = input("Give path where the location repository must be stored: ")
if (ROUTE_REPO_PATH == None):
	ROUTE_REPO_PATH = input("Give path where the updated route repository must be stored: ")

file = open(INPUT_PATH, "r")
routes = json.load(file)
file.close()
	
locationRep = LocationRepository()
for route in routes:
	route["start"] = locationRep.add_location(route["start"], route["extra_info"], route["nr"])
	route["stop"] = locationRep.add_location(route["stop"], route["extra_info"], route["nr"])
	
with open(LOC_REPO_PATH, 'w') as outfile:
    json.dump(locationRep.to_JSON(), outfile, ensure_ascii = False, indent = 1)
	
with open(ROUTE_REPO_PATH, 'w') as outfile:
    json.dump(routes, outfile, ensure_ascii = False, indent = 1)