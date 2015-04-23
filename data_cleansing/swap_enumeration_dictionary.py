import os
import io
import json
import math
import string
import sys
import getopt

INPUT_PATH = None
OUTPUT_PATH = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a

if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the extracted attributes: ")
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path where the enumeration dictionary must be stored: ")

file = open(INPUT_PATH, "r")
foward_dict = json.load(file)
file.close()

rev_dict = len(foward_dict)*[None]
for element in foward_dict:
	rev_dict[foward_dict[element]] = {"name": element, "nr": foward_dict[element]}

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(rev_dict, outfile, ensure_ascii = False, indent = 1)