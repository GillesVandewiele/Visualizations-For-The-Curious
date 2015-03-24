import os
import io
import json
import math
import string

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

#get input path
INPUT_PATH = input("Give file with aggregated traffic: ")

#get input path
attributeToCorrect = input("Give the name of the attribute which has to be corrected: ")

#get output path
OUTPUT_PATH = input("Give path were the cleaned data must be stored: ")

attrValues = extract_attribute(INPUT_PATH, attributeToCorrect)
correcting_dictionary = get_correcting_dict(attrValues)
corrected = correct_attribute(INPUT_PATH, attributeToCorrect, correcting_dictionary)

with open(OUTPUT_PATH, 'w') as outfile:
    json.dump(corrected, outfile, ensure_ascii = False, indent = 1)