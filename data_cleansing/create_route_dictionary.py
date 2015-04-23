import os
import io
import json
import math
import string
import getopt
import sys

# This is one route
class Route(object):
	name = None # The original route name
	start = None
	stop = None
	extra_info = None
	nr = -1
	roads = []

	def __init__(self, name, nr, routeFromStartSep, startFromStopSep):
		self.name = name
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
		return {"name": self.name, "start": self.start, "stop": self.stop, "roads": self.roads, "extra_info": self.extra_info, "nr": self.nr}
		
class RouteRespository(object):
	routes = list()
	routeFromStartSep = None
	startFromStopSep = None
	def __init__(self, routeFromStartSep, startFromStopSep):
		self.routeFromStartSep = routeFromStartSep
		self.startFromStopSep = startFromStopSep
		
	def add_route(self, name, nr):
		self.routes.append(Route(name, nr, self.routeFromStartSep, self.startFromStopSep))
		
	def to_JSON(self):
		out = len(self.routes)*[None]
		for route in self.routes:
			out[route.nr] = route.to_JSON()
		return out

INPUT_PATH = None
OUTPUT_PATH = None
RS_SEP = None
SD_SEP = None
	
optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out=", "rs=", "sd="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a
	elif o == "--rs":
		RS_SEP = a
	elif o == "--sd":
		SD_SEP = a

if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the route dictionary: ")
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path where the route repository must be stored: ")
if (RS_SEP == None):
	RS_SEP = input("Give the road-start separator (ex.: 'from'): ")
if (SD_SEP == None):
	SD_SEP = input("Give the start-destination separator (ex.: 'to'): ")

file = open(INPUT_PATH, "r")
route_dict = json.load(file)
file.close()

routes = RouteRespository(RS_SEP, SD_SEP)
for route_name in route_dict:
	routes.add_route(route_name, route_dict[route_name])

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(routes.to_JSON(), outfile, ensure_ascii = False, indent = 1)