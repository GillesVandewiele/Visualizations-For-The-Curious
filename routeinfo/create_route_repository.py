import os
import io
import json
import math
import string

# This is one route
class Route(object):
	fullName = None # The original route name
	start = None
	stop = None
	extra_info = None
	nr = -1
	roads = []

	def __init__(self, name, nr, routeFromStartSep, startFromStopSep):
		self.fullName = name
		self.nr = nr
		split1 = route_name.split(" " + routeFromStartSep + " ", 1);
		split2 = split1[1].split(" " + startFromStopSep + " ", 1);
		self.start = split2[0].strip(); # Start city name
		self.stop = split2[1].strip(); # Stop city name
		self.roads = split1[0].strip().split("/"); # Names of the roads in question
		if (' ' in self.roads[len(self.roads)-1]):
			lastEl = self.roads.pop();
			spacePos = lastEl.find(' ')
			self.roads.append(lastEl[0:spacePos])
			self.extra_info = lastEl[spacePos+1:]
		else:
			self.extra_info = None
		
	def to_JSON(self):
		return {"fullname": self.fullName, "start": self.start, "stop": self.stop, "roads": self.roads, "extra_info": self.extra_info, "nr": self.nr}
		
class RouteRespository(object):
	routes = list()
	routeFromStartSep = None
	startFromStopSep = None
	def __init__(self, routeFromStartSep, startFromStopSep):
		self.routeFromStartSep = routeFromStartSep
		self.startFromStopSep = startFromStopSep
		
	def add_route(self, name):
		self.routes.append(Route(name, len(self.routes), self.routeFromStartSep, self.startFromStopSep))
		
	def to_JSON(self):
		out = list()
		for route in self.routes:
			out.append(route.to_JSON())
		return out
	
# Return a list with the different values of the searched attribute
def extract_attribute(INPUT_PATH, attributeName):
	file = open(INPUT_PATH, "r")
	data = json.load(file)
	values = set()
	search_recursive(attributeName, data, values)
	file.close()
	return list(values)
	
def search_recursive(to_find, to_iterate, setOfFounds):
	if (isinstance(to_iterate, list)): # Check for array
		for i in to_iterate:
			search_recursive(to_find, i, setOfFounds)
	else: # It must be a dictionary
		for attrName in to_iterate:
			currentAttribute = to_iterate[attrName]
			if (attrName == to_find):
				setOfFounds.add(currentAttribute)
			else:
				if (isinstance(currentAttribute, dict) or isinstance(currentAttribute, list)):
					search_recursive(to_find, currentAttribute, setOfFounds)

# Get input path
INPUT_PATH = input("Give file with aggregated traffic: ")

# Get output path
OUTPUT_PATH = input("Give path where the route repository must be stored: ")

rs_sep = input("Give the road-start separator (ex.: 'from'): ")
sd_sep = input("Give the start-destination separator (ex.: 'to'): ")

routes_names = extract_attribute(INPUT_PATH, "Route")

routes = RouteRespository(rs_sep, sd_sep)
for route_name in routes_names:
	routes.add_route(route_name)

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(routes.to_JSON(), outfile, ensure_ascii = False, indent = 1)