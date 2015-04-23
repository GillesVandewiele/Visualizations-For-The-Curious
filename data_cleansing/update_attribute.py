import os
import io
import json
import math
import string
import getopt
import sys

# Return an object with the corrected values of the gived attribute
def correct_attribute(INPUT_PATH, attributeName, correcting_dict):
	file = open(INPUT_PATH, "r")
	data = json.load(file)
	correct_recursive(attributeName, data, correcting_dict)
	file.close()
	return data
	
def correct_recursive(to_find, to_iterate, correcting_dict):
	if (isinstance(to_iterate, list)): # Check for array
		for i in to_iterate:
			correct_recursive(to_find, i, correcting_dict)
	else: # It must be a dictionary
		for attrName in to_iterate:
			currentAttribute = to_iterate[attrName]
			if (attrName == to_find):
				to_iterate[attrName] = correcting_dict[to_iterate[attrName]]
			else:
				if (isinstance(currentAttribute, dict) or isinstance(currentAttribute, list)):
					correct_recursive(to_find, currentAttribute, correcting_dict)

INPUT_PATH = None
OUTPUT_PATH = None
DICT_PATH = None
ATTR_NAME = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["to_update=", "dict=", "updated=", "attr_name="])
for o, a in optlist:
	if o == "--to_update":
		INPUT_PATH = a
	elif o == "--updated":
		OUTPUT_PATH = a
	elif o == "--dict":
		DICT_PATH = a
	elif o == "--attr_name":
		ATTR_NAME = a

#get input path
if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with aggregated traffic: ")

#get dictionary path
if (DICT_PATH == None):
	DICT_PATH = input("Give file with the attribute repository: ")

#get attribute name
if (ATTR_NAME == None):
	ATTR_NAME = input("Give the name of the attribute which has to be corrected: ")

#get output path
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path were the cleaned data must be stored: ")

file = open(DICT_PATH, "r")
correcting_dictionary = json.load(file)
file.close()

corrected = correct_attribute(INPUT_PATH, ATTR_NAME, correcting_dictionary)

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(corrected, outfile, ensure_ascii = False, indent = 1)