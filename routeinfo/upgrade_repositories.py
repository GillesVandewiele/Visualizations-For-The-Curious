import os
import io
import json
import string
import requests
from polyline.codec import PolylineCodec
import getopt
import sys

# This is one route
class Route(object):
	name = None # The original route name
	start = None
	startLoc = None
	stop = None
	stopLoc = None
	extra_info = None
	nr = -1
	roads = []
	coordinates = None # All coordinates
	
	def __init__(self, dictionary):
		self.name = dictionary["name"]
		self.start = dictionary["start"]
		self.stop = dictionary["stop"]
		self.roads = dictionary["roads"]
		self.extra_info = dictionary["extra_info"]
		self.nr = dictionary["nr"]

	def collect_coordinates(self, locationRep):
		self.start_loc = locationRep.get_location(self.start) # Start city
		startCoord = self.start_loc.get_connection(self.roads)
		self.stop_loc = locationRep.get_location(self.stop) # Stop city
		stopCoord = self.stop_loc.get_connection(self.roads)
		try:
			# Request the route
			response = self.get_route(startCoord[0], startCoord[1], stopCoord[0], stopCoord[1])
			route_points = PolylineCodec().decode(response["route_geometry"]) # All route points (2D array)
			route_points[:] = [[x[0]/10, x[1]/10] for x in route_points] # OSRM returns the coordinates ten times too big
			route_description = response["route_instructions"]
		except:
			self.coordinates = "ERROR: " + str(response)
			return False
			
		route_description.append(["","",1,len(route_points),1,"1","1",1]) # Add sentinel
		first_pos = self.search_for_route(route_description, 0, 1) # Position where one of the route names is first mentioned
		last_pos = self.search_for_route(route_description, len(route_description)-1, -1) # Position where one of the route names is last mentioned
		if (first_pos == -1 or last_pos == -1):
			self.coordinates = "ERROR: None of the routes are not on the shortest part from start to destination!\
				You can manually fix the file using http://map.project-osrm.org/ (click on 'generate link'\
				and the coordinates are in the URL)and\
				http://osrm.mapzen.com/car/viaroute?loc=LAT_START,LONG_START&loc=LAT_STOP,LONG_STOP (copy the 'route_geometry' field)"
			return False
		else:
			#standard
			first_indx = route_description[first_pos][3]
			if (first_indx>5):
				self.start_loc.add_connection(route_description[first_pos][1], route_points[first_indx-5])
			last_indx = route_description[last_pos+1][3]-1
			if (last_indx<len(route_points)-5):
				self.stop_loc.add_connection(route_description[last_pos][1], route_points[last_indx+5])
			self.coordinates = route_points[first_indx:last_indx]
			return True
			
	def get_route(self, start_lat, start_lon, stop_lat, stop_lon):
		url = "http://osrm.mapzen.com/car/viaroute?" + \
			"loc=" + str(start_lat) + "," + str(start_lon) + "&" + \
			"loc=" + str(stop_lat) + "," + str(stop_lon) + "&instructions=true&alt=false"
		return requests.get(url).json()
		
	def search_for_route(self, route_description, start, step):
		pos = start
		while (0<=pos and pos<len(route_description)):
			current_street = route_description[pos][1]
			for road in self.roads:
				if (road in current_street):
					return pos
			pos = pos + step
		return -1
		
	def to_JSON(self):
		return {"name": self.name, "start": self.start_loc.nr, "stop": self.stop_loc.nr, "nr": self.nr, "coordinates": PolylineCodec().encode(self.coordinates)}

class RouteRespository(object):
	routes = list()
	to_upgrade = list()

	def __init__(self, array):
		for route in array:
			self.routes.append(Route(route))
		self.to_upgrade = self.routes
		
	def add_route(self, name):
		self.routes.append(Route(name, len(self.routes), self.routeFromStartSep, self.startFromStopSep))
		
	def collect_coordinates(self, location_repo):
		change = True
		while (change):
			change = False
			fails = list()
			for route in self.to_upgrade:
				success = route.collect_coordinates(location_repo)
				if (not success):
					fails.append(route)
				else:
					change = True
			self.to_upgrade = fails
					
		if (not len(fails) == 0):
			for route in fails:
				print("Fail: " + route.name + " - The route took too long to calculate, move the coordinates of the involved cities closer to a highway (in the location repository) and retry.")
		
	def to_JSON(self):
		out = len(self.routes)*[None]
		for route in self.routes:
			out[route.nr] = route.to_JSON()
		return out
		
class Location(object):
	name = None
	nr = -1
	lat = -1
	long = -1
	routes = None
	highway_connection = dict()

	def __init__(self, dictionary):
		self.name = dictionary["name"]
		self.lat = dictionary["lat"]
		self.long = dictionary["long"]
		self.nr = dictionary["nr"]
		self.routes = dictionary["routes"]
		self.highway_connection = dict()
		
	def to_JSON(self):
		return {"name": self.name, "lat":  self.lat, "long": self.long, "nr": self.nr, "routes": self.routes}
		
	def get_connection(self, route_names):
		for routename in route_names:
			if (routename in self.highway_connection):
				return self.highway_connection[routename]
		return [self.lat, self.long]
		
	def add_connection(self, route_name, coordinates):
		self.highway_connection[route_name] = coordinates
		
class LocationRepository(object):
	locationDict = dict()
	
	def __init__(self, dictionary):
		for location_name in dictionary:
			self.locationDict[location_name] = Location(dictionary[location_name])
		
	def get_location(self, name):
		return self.locationDict[name]
		
	def __len__(self):
		return len(self.locationDict)
		
	def to_JSON(self):
		out = len(self.locationDict)*[None]
		for loc_name in self.locationDict:
			location = self.locationDict[loc_name]
			out[location.nr] = location.to_JSON()
		return out

ROUTE_PATH = None
LOCATION_PATH = None
ROUTEU_PATH = None
LOCATIONU_PATH = None
	
optlist, args = getopt.getopt(sys.argv[1:], "", ["route_rep=", "loc_rep=", "route_rep_up=", "loc_rep_up="])
for o, a in optlist:
	if o == "--route_rep":
		ROUTE_PATH = a
	elif o == "--loc_rep":
		LOCATION_PATH = a
	elif o == "--route_rep_up":
		ROUTEU_PATH = a
	elif o == "--loc_rep_up":
		LOCATIONU_PATH = a
	
# Get input path
if (ROUTE_PATH == None):
	ROUTE_PATH = input("Give file with the route repository: ")
if (LOCATION_PATH == None):
	LOCATION_PATH = input("Give file with the location repository: ")
if (ROUTEU_PATH == None):
	ROUTEU_PATH = input("Give path the upgraded route repository must be stored: ")
if (LOCATIONU_PATH == None):
	LOCATIONU_PATH = input("Give path the upgraded location repository must be stored: ")

route_file = open(ROUTE_PATH, "r")
route_repo = RouteRespository(json.load(route_file))
route_file.close()

location_file = open(LOCATION_PATH, "r")
location_repo = LocationRepository(json.load(location_file))
location_file.close()

route_repo.collect_coordinates(location_repo)
	
with open(ROUTEU_PATH, 'w') as outfile:
    json.dump({"routes": route_repo.to_JSON()}, outfile, ensure_ascii = False, indent = 1)
	
with open(LOCATIONU_PATH, 'w') as outfile:
    json.dump({"locations": location_repo.to_JSON()}, outfile, ensure_ascii = False, indent = 1)