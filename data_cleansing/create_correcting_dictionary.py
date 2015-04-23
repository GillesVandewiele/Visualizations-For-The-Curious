import getopt
import sys
import json
import string

# Returns a dictionary with for each found attribute name a mapping to the correct attribute name
def get_correcting_dict(roads):
	# Create a dictionary with as key a word without ascii chars,
	# and as values the different occurences of the word
	words = dict()
	for road in roads:
		word_array = road.split(' ')
		for word in word_array:
			clean_word = ''.join(filter(lambda x: x in string.printable, word))
			if (clean_word in words):
				words[clean_word].add(word)
			else:
				aliasses = set()
				aliasses.add(word)
				words[clean_word] = aliasses
	# Ask the user to correct each confusing word and construct
	# a dictionary from incorrect to correct words
	aliasToCorrect = dict()
	for clean_word in words:
		aliasses = words[clean_word]
		if len(aliasses)!=1 or clean_word != list(aliasses)[0]:
			correct_word = input("Which word corresponds to " + str(aliasses) + ", short: " + str(clean_word) + ": ")
			for alias in aliasses:
				aliasToCorrect[alias] = correct_word
	# Construct a dictionary from the found attribute name to the correct attribute name
	correcting_road_dict = dict()
	for road in roads:
		word_array = road.split(' ')
		for i in range(len(word_array)):
			if (word_array[i] in aliasToCorrect):
				word_array[i] = aliasToCorrect[word_array[i]]
		correct_road = ' '.join(word_array)
		correcting_road_dict[road] = correct_road
	return correcting_road_dict
	
INPUT_PATH = None
DICT_PATH = None
ATTR_PATH = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "updated_attr=", "dict="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--dict":
		DICT_PATH = a
	elif o == "--updated_attr":
		ATTR_PATH = a

if (INPUT_PATH==None):
	INPUT_PATH = input("Give file with the extracted attributes: ")
	
if (DICT_PATH==None):
	DICT_PATH = input("Give path where the correcting dictionary must be stored: ")
	
if (ATTR_PATH==None):
	ATTR_PATH = input("Give path where the updated attributes must be stored: ")

file = open(INPUT_PATH, "r")
attr_array = json.load(file)
file.close()

correcting_dictionary = get_correcting_dict(attr_array)

updated_attributes = set()
for old_name in correcting_dictionary:
	updated_attributes.add(correcting_dictionary[old_name])
updated_attributes = list(updated_attributes)

with open(DICT_PATH, 'w') as outfile:
    json.dump(correcting_dictionary, outfile, ensure_ascii = False, indent = 1)
	
with open(ATTR_PATH, 'w') as outfile:
    json.dump(updated_attributes, outfile, ensure_ascii = False, indent = 1)