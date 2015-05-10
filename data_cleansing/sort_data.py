import json
import getopt
import sys

# Return a list with the different values of the searched attribute
def sort_data(INPUT_PATH, attributeName):
	file = open(INPUT_PATH, "r")
	data = json.load(file)
	file.close()
	output = len(data)*[None]
	for element in data:
		output[element[attributeName]] = element
	
	return list(output)

INPUT_PATH = None
ATTR_NAME = None
OUTPUT_PATH = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out=", "attr_name="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a
	elif o == "--attr_name":
		ATTR_NAME = a

if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with aggregated traffic: ")
	
if (ATTR_NAME == None):
	ATTR_NAME = input("Give the name of the attribute which has to be found: ")
	
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path were the found values must be stored: ")

sorted = sort_data(INPUT_PATH, ATTR_NAME)

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(sorted, outfile, ensure_ascii = False, indent = 1)