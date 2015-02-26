import os
import json
import re
import io
import operator
from pprint import pprint
from operator import attrgetter

TEMP_FILE_PATH = 'temp.json'
INPUT_FILE_DIR = ''
OUTPUT_FILE_DIR = ''

#Contains necessary information to parse the data
class JsonFileInfo(object):
	name = None
	collectionNames = None
	objectFieldNames = None

	def __init__(self, name=None, collectionNames=None, objectFieldNames=None):
		self.name = name
		self.collectionNames = collectionNames
		self.objectFieldNames = objectFieldNames


#Header containing header fields and the names of all elements of the json
class Header(object):
	time = None
	frequency = None
	collection = None
	
	def __init__(self, time=None, frequency=None, collection=None):
		self.time = time
		self.frequency = frequency
		self.collection = collection
		
	def __iter__(self):
		for x in range(self.n):
			yield x

#comparator for comparing dates
def date_compare(x,y):
	x = x.time
	y = y.time
	months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	if(x[11:15] == y[11:15]):
		if(months.index(x[4:7]) == months.index(y[4:7])):
			if(x[8:10] == y[8:10]):
				if(x[16:24] < y[16:24]):
					return -1
				else:
					return 1
			elif(x[8:10] < y[8:10]):
				return -1
			else:
				return 1

		elif(months.index(x[4:7]) < months.index(y[4:7])):
			return -1
		else:
			return 1

	elif(x[11:15] < y[11:15]):
		return -1
	else:
		return 1

def get_json_info():
	#Ask user for more information on the Json
	jsonFileInfo = JsonFileInfo()
	jsonFileInfo.name = raw_input("Input name of dataset: ")
	jsonFileInfo.collectionNames = []
	jsonFileInfo.objectFieldNames = []

	i = 0
	s = raw_input(str("Input collection name " + str(i+1) + ": "))
	while not (s == ""):
		jsonFileInfo.collectionNames.append(s)

		j = 0
		objectFieldNames = []
		r = raw_input(str("Input collection object field " + str(j+1) + ": "))
		while not (r == ""):
			objectFieldNames.append(r)
			j = j + 1
			r = raw_input(str("Input collection object field " + str(j+1) + ": "))

		jsonFileInfo.objectFieldNames.append(objectFieldNames)
		i = i + 1
		s = raw_input(str("Input collection name " + str(i+1) + ": "))

	return jsonFileInfo

def extract_usable_data():
	print "Extracting usable data to " + TEMP_FILE_PATH
	allFiles = os.listdir(INPUT_FILE_DIR)
	if os.path.isfile(TEMP_FILE_PATH):
		os.remove(TEMP_FILE_PATH)
	fout = open(TEMP_FILE_PATH, "a")
	fout.write("{\n\"objects\":  [\n")

	rest = None

	# Create JSON-file with all temp
	for f in allFiles:
		fin = open(INPUT_FILE_DIR + f,  "r")
		
		if ("200 OK" in fin.readline()):	
			# First we got to remove the header added by the kimono application
			while not ('{' in fin.readline()):	
				pass
		
			# rest will be None in the first file (don't put a comma)
			if not (rest is None):	
				rest = ",\n{\n" + fin.read()
			else:
				rest = "{\n" + fin.read()

			fout.write(rest)
		else:
			pass
			#print f + " does not have the correct format"
		
	fout.write("\n]\n}\n")
	fout.close()
	print "Extraction to " + TEMP_FILE_PATH + " complete."

def load_into_datastructure(jsonFileInfo):
	print "Loading " + TEMP_FILE_PATH + " into datastructure"
	json_data_dirty = open(TEMP_FILE_PATH, "r")
	data_dirty = json.load(json_data_dirty)
	
	#trafficDelays = []
	allJSONs = []

	e = 0

	# Process object per object
	for json_object in data_dirty['objects']:
		oneJSON = Header(json_object['thisversionrun'], json_object['frequency'])
		collection=[]

		results = json_object['results']
		
		correctJSON = True
		i = 0
		#iterate over all collections
		for inputCollection in jsonFileInfo.collectionNames:
			if inputCollection in results:
				objects = []
				#iterate over all objects in a collection
				for collectionObject in results[inputCollection]:
					#iterate over all fields in an object
					objectFields = []
					for collectionObjectName in jsonFileInfo.objectFieldNames[i]:
						objectFields.append(collectionObject[collectionObjectName])

					objects.append(objectFields)

				collection.append(objects)
				i = i + 1
			else:
				incorrectJSON = False
				break
		
		if correctJSON:
			oneJSON.collection = collection			
			allJSONs.append(oneJSON)
		
	print "Loading complete."
	return allJSONs

def write_all_JSONs(allJSONs, jsonFileInfo):
	output = OUTPUT_FILE_DIR + jsonFileInfo.name +".json"
	print "Writing to " + output
	#utf8 necessary for writing names of wallon cities
	#as a result, all strings must be cast to unicode
	json_data_clean = io.open(output, "w", encoding="utf-8")
	json_data_clean.write(unicode("{\n\t\"" + jsonFileInfo.name + "\":  [\n"))
	firstObject = True	

	for oneJSON in allJSONs:
		if firstObject:
			json_data_clean.write(unicode("\n\t\t{\n"))
			firstObject = False
		else:
			json_data_clean.write(unicode(",\n\t\t{\n"))

		json_data_clean.write(unicode("\t\t\t\"Time\": \""+oneJSON.time+"\",\n"))
		json_data_clean.write(unicode("\t\t\t\"Frequency\": \""+oneJSON.frequency+"\",\n"))
		json_data_clean.write(unicode("\t\t\t\"Collections\": [ \n"))
		firstCollection = True
		j = 0
		for collection in oneJSON.collection:
			if firstCollection:
				json_data_clean.write(unicode("\t\t\t\t\"" + jsonFileInfo.collectionNames[j] + "\": [ \n"))
				firstCollection = False
			else:
				json_data_clean.write(unicode(",\n\t\t\t\t\"" + jsonFileInfo.collectionNames[j] + "\": [ \n"))
			
			#Write all object in a collection
			firstObject = True
			for collectionObject in collection:
				if firstObject:
					json_data_clean.write(unicode("\t\t\t\t\t{\n"))
					firstObject = False
				else:
					json_data_clean.write(unicode(",\n\t\t\t\t\t{\n"))
				
				firstField = True
				i = 0
				for objectField in collectionObject:
					if firstField:
						json_data_clean.write(unicode("\t\t\t\t\t\t\"" + jsonFileInfo.objectFieldNames[j][i] + "\": \"" + objectField + "\""))
						firstField = False
					else:
						json_data_clean.write(unicode(",\n\t\t\t\t\t\t\"" + jsonFileInfo.objectFieldNames[j][i] + "\": \"" + objectField + "\""))
					i = i + 1

				json_data_clean.write(unicode("\n\t\t\t\t\t}"))

			json_data_clean.write(unicode("\n\t\t\t\t]"))
			j = j + 1
		
		json_data_clean.write(unicode("\n\t\t\t]"))	
		json_data_clean.write(unicode("\n\t\t}"))
	
	json_data_clean.write(unicode("\n\t]\n}\n"))
	print "Writing complete"




# The directory where the JSON files are at and the path for the dirty and cleansed data file
#INPUT_FILE_DIR = "trafficdataset/verkeerstijden/"
INPUT_FILE_DIR = raw_input("Directory with input files: ")
if INPUT_FILE_DIR[-1:] != '/':
	INPUT_FILE_DIR = INPUT_FILE_DIR + '/'
OUTPUT_FILE_DIR = "output/"
#OUTPUT_FILE_DIR = raw_input("Directory with input files: ")
if OUTPUT_FILE_DIR[-1:] != "/":
	OUTPUT_FILE_DIR = OUTPUT_FILE_DIR + "/"


# Let user input necessary json file info
jsonFileInfo = get_json_info()
"""
jsonFileInfo = JsonFileInfo()
jsonFileInfo.name = "test"
jsonFileInfo.collectionNames = []
jsonFileInfo.objectFieldNames = []
jsonFileInfo.objectFieldNames.append([])

jsonFileInfo.collectionNames.append("Reistijden")
jsonFileInfo.objectFieldNames[0].append("Route")
jsonFileInfo.objectFieldNames[0].append("Vertraging")
"""
print jsonFileInfo.objectFieldNames

#Time to load the data into the datastructure
#Clean the first 12 lines of every file and save them
#First 12 lines contain information of the screenscraper and is not usable as data for us

extract_usable_data()


#Use the temp file to construct a clean Json file
#First load all data into the datastructure
allJSONs = load_into_datastructure(jsonFileInfo)

#We would like a sorted list
allJSONsSorted = sorted(allJSONs,  cmp=date_compare)

#Write to output path
write_all_JSONs(allJSONsSorted,jsonFileInfo)




