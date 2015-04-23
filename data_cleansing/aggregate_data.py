import os
import io
import json
import math
import getopt
import sys
import ast
import types

def load_into_datastructure(INPUT_PATH):
	allJSONs = []

	allFiles = os.listdir(INPUT_PATH)

	# Process object per object
	for j in allFiles:	
		file = open(os.path.join(INPUT_PATH, j), "r")
		data = json.load(file)
		file.close()
			
		allJSONs.append(data)
		
	return allJSONs
	
INPUT_PATH = None
OUTPUT_PATH = None
EXTRA = []

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a

if (INPUT_PATH==None):
	INPUT_PATH = input("Give name of directory with the clean json files: ")
	
if (OUTPUT_PATH==None):
	OUTPUT_PATH = input("Give path were aggregated data must be stored: ")

allJSONs = load_into_datastructure(INPUT_PATH)

with open(OUTPUT_PATH, 'w') as outfile:
	json.dump(allJSONs, outfile, ensure_ascii = False, indent = 1)