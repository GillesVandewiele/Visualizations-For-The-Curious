import json
import getopt
import sys

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

attrValues = extract_attribute(INPUT_PATH, ATTR_NAME)

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(attrValues, outfile, ensure_ascii = False, indent = 1)