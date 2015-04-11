import os
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

if (INPUT_PATH==None):
	INPUT_PATH = input("Give name of directory with the html-messages: ")
	
if (OUTPUT_PATH==None):
	OUTPUT_PATH = input("Give path where the JSON-files must be stored: ")

allFiles = os.listdir(INPUT_PATH)

try:
    os.stat(OUTPUT_PATH)
except:
    os.mkdir(OUTPUT_PATH) 

for f in allFiles:
	fin = open(os.path.join(INPUT_PATH, f), 'r')
	s = fin.readline()
	if ("200 OK" in s):
		fout = open(os.path.join(OUTPUT_PATH, f), 'w')
		s = fin.readline()
		while not ("{" in s):
			s = fin.readline()
		fout.write(s)
		rest = fin.read()
		fout.write(rest)