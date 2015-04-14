import os
import io
import json
import math
import getopt
import sys
import ast
import types

def compress(input_file, output_file, prime_order, second_order):
	input_file = open(input_file, 'r')
	uncompressed = json.load(input_file)
	input_file.close()
	
	compressed = list()
	for prime_level in uncompressed:
		pl_compressed = list()
		for element in prime_order:
			pl_compressed.append(prime_level[element])
			
		if (not second_order == None):
			data = prime_level["data"]
			pl_backpart = list()
			for second_level in data:
				sl_compressed = list()
			
				for element in second_order:
					sl_compressed.append(second_level[element])
		
				pl_backpart.append(sl_compressed)	
			pl_compressed.append(pl_backpart)
		
		compressed.append(pl_compressed)

	return compressed

INPUT_PATH = None
OUTPUT_PATH = None
PRIME = None
SECOND = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out=", "prime_order=", "second_order="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a
	elif o == "--prime_order":
		PRIME = ast.literal_eval(a)
	elif o == "--second_order":
		SECOND = ast.literal_eval(a)

compressed = compress(INPUT_PATH, OUTPUT_PATH, PRIME, SECOND)

with open(OUTPUT_PATH, 'w') as outfile:
	json.dump({"data" : compressed}, outfile, separators=(',', ':'))