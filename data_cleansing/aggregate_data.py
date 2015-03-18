import os
import io
import json
import math

#Contains necessary information to parse the data
class JsonFileInfo(object):
	name = None
	collectionNames = None
	objectFieldNames = None

	def __init__(self, name=None, collectionNames=None, objectFieldNames=None):
		self.name = name
		self.collectionNames = collectionNames
		self.objectFieldNames = objectFieldNames

class AggregationInfo(object):
	objectFieldAggr = None

	def __init__(self, objectFieldAggr=None):
		self.objectFieldAggr = objectFieldAggr


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

#Ask user for keys used in json file
def get_json_info():
	jsonFileInfo = JsonFileInfo()
	jsonFileInfo.name = input("Input name of dataset: ")
	jsonFileInfo.collectionNames = []
	jsonFileInfo.objectFieldNames = []

	i = 0
	s = input(str("Input collection name " + str(i+1) + ": "))
	while not (s == ""):
		jsonFileInfo.collectionNames.append(s)

		j = 0
		objectFieldNames = []
		r = input(str("Input collection object field " + str(j+1) + ": "))
		while not (r == ""):
			objectFieldNames.append(r)
			j = j + 1
			r = input(str("Input collection object field " + str(j+1) + ": "))

		jsonFileInfo.objectFieldNames.append(objectFieldNames)
		i = i + 1
		s = input(str("Input collection name " + str(i+1) + ": "))

	return jsonFileInfo


def load_into_datastructure(jsonFileInfo, INPUT_PATH):
	allJSONs = []
	e = 0

	allFiles = os.listdir(INPUT_PATH)

	# Process object per object
	for j in allFiles:	
		json_data = open(INPUT_PATH + j, "r")
		data = json.load(json_data)


		oneJSON = Header(data['thisversionrun'], data['frequency'])
		collection=[]

		results = data['results']

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
		
	return allJSONs


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


def cmp_to_key(mycmp):
    'Convert a cmp= function into a key= function'
    class K(object):
        def __init__(self, obj, *args):
            self.obj = obj
        def __lt__(self, other):
            return mycmp(self.obj, other.obj) < 0
        def __gt__(self, other):
            return mycmp(self.obj, other.obj) > 0
        def __eq__(self, other):
            return mycmp(self.obj, other.obj) == 0
        def __le__(self, other):
            return mycmp(self.obj, other.obj) <= 0  
        def __ge__(self, other):
            return mycmp(self.obj, other.obj) >= 0
        def __ne__(self, other):
            return mycmp(self.obj, other.obj) != 0
    return K


def write_all_JSONs(allJSONs, jsonFileInfo, OUTPUT_PATH):
	output = OUTPUT_PATH + jsonFileInfo.name +".json"
	json_data_clean = io.open(output, "w")
	json_data_clean.write("{\n\t\"" + jsonFileInfo.name + "\":  [\n")
	firstObject = True	

	for oneJSON in allJSONs:
		if firstObject:
			json_data_clean.write("\n\t\t{\n")
			firstObject = False
		else:
			json_data_clean.write(",\n\t\t{\n")

		json_data_clean.write("\t\t\t\"Time\": \""+oneJSON.time+"\",\n")
		json_data_clean.write("\t\t\t\"Frequency\": \""+oneJSON.frequency+"\",\n")
		json_data_clean.write("\t\t\t\"Collections\": { \n")
		firstCollection = True
		j = 0
		for collection in oneJSON.collection:
			if firstCollection:
				json_data_clean.write("\t\t\t\t\"" + jsonFileInfo.collectionNames[j] + "\": [ \n")
				firstCollection = False
			else:
				json_data_clean.write(",\n\t\t\t\t\"" + jsonFileInfo.collectionNames[j] + "\": [ \n")
			
			#Write all object in a collection
			firstObject = True
			for collectionObject in collection:
				if firstObject:
					json_data_clean.write("\t\t\t\t\t{\n")
					firstObject = False
				else:
					json_data_clean.write(",\n\t\t\t\t\t{\n")
				
				firstField = True
				i = 0
				for objectField in collectionObject:
					if firstField:
						json_data_clean.write("\t\t\t\t\t\t\"" + jsonFileInfo.objectFieldNames[j][i] + "\": \"" + objectField + "\"")
						firstField = False
					else:
						json_data_clean.write(",\n\t\t\t\t\t\t\"" + jsonFileInfo.objectFieldNames[j][i] + "\": \"" + objectField + "\"")
					i = i + 1

				json_data_clean.write("\n\t\t\t\t\t}")

			json_data_clean.write("\n\t\t\t\t]")
			j = j + 1
		
		json_data_clean.write("\n\t\t\t}")
		json_data_clean.write("\n\t\t}")
	
	json_data_clean.write("\n\t]\n}\n")


def aggregation_info(jsonFileInfo):
	aggrInfo = AggregationInfo()
	aggrInfo.objectFieldAggr = []

	#for each field ask how to aggregate
	for i in range(0, len(jsonFileInfo.collectionNames)):
		temp = []
		for fieldName in jsonFileInfo.objectFieldNames[i]:
			temp.append(input("How to aggregate " + fieldName +": "));
		aggrInfo.objectFieldAggr.append(temp)

	return aggrInfo


def aggregate_per_day(allJSONsSorted, jsonFileInfo, aggrInfo, OUTPUT_PATH):
	jsonPerDay = []
	jsonToday = []
	numJSON = 1	

	jsonFileInfo.name = jsonFileInfo.name + "_daily"

	loopday = ""

	for oneJSON in allJSONsSorted:
		today = oneJSON.time[:15]
		if not (loopday == today):	
			numJSON = 2	
			if not jsonToday == []:
				jsonPerDay.append(jsonToday)
			
			loopday = today
			jsonToday = oneJSON
			jsonToday.time = today
			jsonToday.frequency = "Daily"
		else:
			#iterate over all collections of today
			for i in range(0,len(jsonToday.collection)):
				#iterate over all collectionobjects a certain collection
				if(len(jsonToday.collection[i]) > 1):
					for j in range(0,len(jsonToday.collection[i])):
						#find the index of the key
						keyIndex = aggrInfo.objectFieldAggr[i].index('key')
						#for every collectionobject of oneJSON cmp with every collectionobject in jsonToday
						for collectionObject in oneJSON.collection[i]:
							for k in range(0, len(jsonToday.collection[i][j])):
								if(jsonToday.collection[i][j][keyIndex] == collectionObject[keyIndex]):
									if not (collectionObject[k] == "-"):
										if (jsonToday.collection[i][j][k] == "-"):
											jsonToday.collection[i][j][k] = collectionObject[k]
										else:	
											if aggrInfo.objectFieldAggr[i][k] == "mean":
												jsonToday.collection[i][j][k] = str(round((float(jsonToday.collection[i][j][k])*(numJSON-1) + float(collectionObject[k]))/numJSON,1))
											elif aggrInfo.objectFieldAggr[i][k] == "sum":
												jsonToday.collection[i][j][k] = int(jsonToday.collection[i][j][k]) + int(collectionObject[k])
											elif aggrInfo.objectFieldAggr[i][k] == "max":
												if int(jsonToday.collection[i][j][k]) < int(collectionObject[k]):
													jsonToday.collection[i][j][k] = collectionObject[k]
											elif aggrInfo.objectFieldAggr[i][k] == "min":
												if int(jsonToday.collection[i][j][k]) > int(collectionObject[k]):
													jsonToday.collection[i][j][k] = collectionObject[k]
											elif aggrInfo.objectFieldAggr[i][k] == "count": #for textual fields
												pass
				else:
					for k in range(0, len(jsonToday.collection[i][0])):
						if not (oneJSON.collection[i][0][k] == "-"):
							if (jsonToday.collection[i][0][k] == "-"):
								jsonToday.collection[i][0][k] = oneJSON.collection[i][0][k]
							else:	
								#there probably will be no key, and if there would be one, he would not matter
								if aggrInfo.objectFieldAggr[i][k] == "mean":
									jsonToday.collection[i][0][k] = str(round((float(jsonToday.collection[i][0][k])*(numJSON-1) + float(oneJSON.collection[i][0][k]))/numJSON,1))
								elif aggrInfo.objectFieldAggr[i][k] == "sum":
									jsonToday.collection[i][0][k] = int(jsonToday.collection[i][0][k]) + int(oneJSON.collection[i][0][k])
								elif aggrInfo.objectFieldAggr[i][k] == "max":
									if int(jsonToday.collection[i][0][k]) < int(oneJSON.collection[i][0][k]):
										jsonToday.collection[i][0][k] = oneJSON.collection[i][0][k]
								elif aggrInfo.objectFieldAggr[i][k] == "min":
									if int(jsonToday.collection[i][0][k]) > int(oneJSON.collection[i][0][k]):
										jsonToday.collection[i][0][k] = oneJSON.collection[i][0][k]
								elif aggrInfo.objectFieldAggr[i][k] == "count": #for textual fields
									pass

			numJSON = numJSON + 1

	write_all_JSONs(jsonPerDay, jsonFileInfo, OUTPUT_PATH)

#get input path
INPUT_PATH = input("Give path with clean json files: ")

#get output path
OUTPUT_PATH = input("Give path were aggregated data must be stored: ")

#get the keys by userinteraction
jsonFileInfo = get_json_info()

#or get the keys automatically... (possible?)
#maybe with regex

#when aggregating the maximum of certain keys must be taken, for other keys, the minimum would be more suitable
#mean value is also possible
#also when a data field is text: the must occurring text could be usesd but also the worst case when considering weather
#let the user decide!!
allJSONs = load_into_datastructure(jsonFileInfo, INPUT_PATH)
allJSONsSorted = sorted(allJSONs,  key=cmp_to_key(date_compare))

#writing all JSONS (aggregating over 15 minutes)
write_all_JSONs(allJSONsSorted, jsonFileInfo, OUTPUT_PATH)


#ask user how to aggregate the data
aggrInfo = aggregation_info(jsonFileInfo)

aggregate_per_day(allJSONsSorted, jsonFileInfo, aggrInfo, OUTPUT_PATH)






	
