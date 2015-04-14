import os
import io
import json
import math
import string
from geopy.geocoders import Nominatim
import requests
import getopt
import sys
		
def upgrade_location(location):
	if ("extraInfo" in location and (not location["extraInfo"] == None)):
		long_name = location["name"] + " " + location["extraInfo"]
	else:
		long_name = location["name"]
	correct = False
	query = location["name"]
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
	location["lat"] = loc.latitude
	location["long"] = loc.longitude
	return location

INPUT_PATH = None
REPO_PATH = None
	
optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		REPO_PATH = a
	
if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the location dictionary: ")
if (REPO_PATH == None):
	REPO_PATH = input("Give path where the upgraded location dictionary must be stored: ")

file = open(INPUT_PATH, "r")
locations = json.load(file)
file.close()

for i in range(len(locations)):
	locations[i] = upgrade_location(locations[i])
	
with open(REPO_PATH, 'w') as outfile:
    json.dump(locations, outfile, ensure_ascii = False, indent = 1)