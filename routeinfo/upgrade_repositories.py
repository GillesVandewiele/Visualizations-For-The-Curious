import os
import io
import json
import string
import requests

# This is one route
class Route(object):
	fullName = None # The original route name
	start = None
	startLoc = None
	stop = None
	stopLoc = None
	extra_info = None
	nr = -1
	roads = []
	coordinates = None # All coordinates
	
	def __init__(self, dictionary):
		self.fullName = dictionary["fullname"]
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
			route_points = decode(response["route_geometry"]) # All route points (2D array)
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
		return {"fullname": self.fullName, "start": self.start_loc.nr, "stop": self.stop_loc.nr, "nr": self.nr, "coordinates": self.coordinates}

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
				print("Fail: " + route.fullName + " - The route took too long to calculate, move the coordinates of the involved cities closer to a highway (in the location repository) and retry.")
		
	def to_JSON(self):
		out = list()
		for route in self.routes:
			out.insert(route.nr, route.to_JSON())
		return out
		
class Location(object):
	address = None
	nr = -1
	lat = -1
	long = -1
	routes = None
	highway_connection = dict()

	def __init__(self, dictionary):
		self.address = dictionary["address"]
		self.lat = dictionary["lat"]
		self.long = dictionary["long"]
		self.nr = dictionary["nr"]
		self.routes = dictionary["routes"]
		self.highway_connection = dict()
		
	def to_JSON(self):
		return {"address": self.address, "lat":  self.lat, "long": self.long, "nr": self.nr, "routes": self.routes}
		
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
		out = list()
		for loc_name in self.locationDict:
			location = self.locationDict[loc_name]
			out.insert(location.nr, location.to_JSON())
		return out
		
#From Google	
def decode(point_str):
    '''Decodes a polyline that has been encoded using Google's algorithm
    http://code.google.com/apis/maps/documentation/polylinealgorithm.html
    
    This is a generic method that returns a list of (latitude, longitude) 
    tuples.
    
    :param point_str: Encoded polyline string.
    :type point_str: string
    :returns: List of 2-tuples where each tuple is (latitude, longitude)
    :rtype: list
    '''
            
    # sone coordinate offset is represented by 4 to 5 binary chunks
    coord_chunks = [[]]
    for char in point_str:
        
        # convert each character to decimal from ascii
        value = ord(char) - 63
        
        # values that have a chunk following have an extra 1 on the left
        split_after = not (value & 0x20)         
        value &= 0x1F
        
        coord_chunks[-1].append(value)
        
        if split_after:
                coord_chunks.append([])
        
    del coord_chunks[-1]
    
    coords = []
    
    for coord_chunk in coord_chunks:
        coord = 0
        
        for i, chunk in enumerate(coord_chunk):                    
            coord |= chunk << (i * 5) 
        
        #there is a 1 on the right if the coord is negative
        if coord & 0x1:
            coord = ~coord #invert
        coord >>= 1
        coord /= 100000.0
                    
        coords.append(coord)
    
    # convert the 1 dimensional list to a 2 dimensional list and offsets to 
    # actual values
    points = []
    prev_x = 0
    prev_y = 0
    for i in range(0, len(coords) - 1, 2):
        if coords[i] == 0 and coords[i + 1] == 0:
            continue
        
        prev_x += coords[i + 1]
        prev_y += coords[i]
        # a round to 6 digits ensures that the floats are the same as when 
        # they were encoded
        points.append((round(prev_y, 6)/10, round(prev_x, 6)/10))
    
    return points    

# Get input path
ROUTE_PATH = input("Give file with the route repository: ")
LOCATION_PATH = input("Give file with the location repository: ")
ROUTEU_PATH = input("Give path the upgraded route repository must be stored: ")
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