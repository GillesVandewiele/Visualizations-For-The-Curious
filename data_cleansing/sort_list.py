import json
import getopt
import sys


INPUT_PATH = None
OUTPUT_PATH = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a

if (INPUT_PATH == None):
	INPUT_PATH = input("Give list which has to be sorted: ")
	
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path were the sorted list must be stored: ")

file = open(INPUT_PATH, "r")
data = json.load(file)
file.close()

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(sorted(data), outfile, ensure_ascii = False, indent = 1)