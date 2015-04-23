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

# Get input path
if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the extracted attributes: ")

# Get output path
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path where the enumeration dictionary must be stored: ")

file = open(INPUT_PATH, "r")
attr_array = json.load(file)
file.close()

attr_dict = dict()
for pos in range(len(attr_array)):
	attr_dict[attr_array[pos]] = pos

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(attr_dict, outfile, ensure_ascii = False, separators=(',', ':'))