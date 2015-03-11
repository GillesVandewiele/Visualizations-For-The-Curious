import os

INPUT_PATH = "verkeerstijden/"
OUTPUT_PATH = "temp_verkeerstijden/"

allFiles = os.listdir(INPUT_PATH)

for f in allFiles:
	fin = open(INPUT_PATH + f, 'r')
	s = fin.readline()
	if ("200 OK" in s):
		fout = open(OUTPUT_PATH + f, 'w')
		s = fin.readline()
		while not ("{" in s):
			s = fin.readline()
		fout.write(s)
		rest = fin.read()
		fout.write(rest)
	else:
		print f
