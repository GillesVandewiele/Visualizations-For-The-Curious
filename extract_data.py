import os
import json
import re
import io
import operator
from pprint import pprint
from operator import attrgetter

# The directory where the JSON files are at and the path for the dirty and cleansed data file
INPUT_FILE_DIRECTORY = 'trafficdataset/verkeerstijden/'
OUTPUT_FILE_PATH_DIRTY = 'testmap/test_dirty.json'
OUTPUT_FILE_PATH_CLEAN = 'testmap/test_clean.json'
OUTPUT_FILE_PATH_PER_DAY = 'testmap/per_day.json'

"""
allFiles = os.listdir(INPUT_FILE_DIRECTORY)
fout = open(OUTPUT_FILE_PATH_DIRTY, "a")
fout.write("{\n\"objects\":  [\n")

rest = None


# Create JSON-file with all data_dirty
for f in allFiles:
	fin = open(INPUT_FILE_DIRECTORY+f, "r")
	
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
		print f
	
fout.write("\n]\n}\n")
fout.close()
"""

class Delay(object):
	
	delayFrom = None;
	delayTo = None;
	delayRoute = None;
	delayTime = None;
	
	def __init__(self, delayFrom=None, delayTo=None, delayRoute=None, delayTime=None):
		self.delayFrom = delayFrom;
		self.delayRoute = delayRoute;
		self.delayTo = delayTo;
		self.delayTime = delayTime;
		
	def __iter__(self): 
		for x in range(self.n):
			yield x

class TrafficDelay(object):
	
	time = None;
	frequency = None;
	delays = None;
	
	def __init__(self, time=None, frequency=None, delays=None):
		self.time = time;
		self.frequency = frequency;
		self.delays = delays;
		
	def __iter__(self):
		for x in range(self.n):
			yield x

def parse_traffic_delay_objects():
	json_data_dirty = open(OUTPUT_FILE_PATH_DIRTY, "r")
	data_dirty = json.load(json_data_dirty)
	
	trafficDelays = []
	
	# Process object per object
	for json_object in data_dirty['objects']:
		trafficDelay = TrafficDelay(json_object['thisversionrun'], json_object['frequency'])
		delays=[]
		results = json_object['results']
		
		# Process delay per delay
		if 'Reistijden' in results:
			for delay in results['Reistijden']:
				
				#The route is now a complete sentence, which must be split up into fields
				route = delay['Route']
				routeRoute = route.split(' van', 2)
				routeFrom = routeRoute[1].split(' naar', 2)
				routeTo = routeFrom[1]
				
				#Hours are converted to minutes and a sum is taken
				delayString = delay['Vertraging']
				delayHours = delayString.split("u")
				if len(delayHours) > 1:
					hoursInMinutes = int(delayHours[0])*60
					minutes = re.sub("\"","",delayHours[1])
					delayString = str(hoursInMinutes + int(minutes)) + "m"
				
				else:
					minutes = delayString.split("\"")
					delayString = minutes[0] + "m"
				
				delays.append(Delay(routeFrom[0], routeTo, routeRoute[0], delayString))
		
		trafficDelay.delays = delays
		trafficDelays.append(trafficDelay)
		
	return trafficDelays
		
def write_traffic_delays(trafficDelays, file):
	#utf8 necessary for writing names of wallon cities
	#as a result, all strings must be cast to unicode
	json_data_clean = io.open(file, "w", encoding='utf8')
	json_data_clean.write(unicode("{\n\t\"Traffic Delays\":  [\n"))
	firstObject = True	

	for trafficDelay in trafficDelays:
		if firstObject:
			json_data_clean.write(unicode("\n\t\t{\n"))
			firstObject = False
		else:
			json_data_clean.write(unicode(",\n\t\t{\n"))

		json_data_clean.write(unicode("\t\t\t\"Time\": \""+trafficDelay.time+"\",\n"))
		json_data_clean.write(unicode("\t\t\t\"Frequency\": \""+trafficDelay.frequency+"\",\n"))
		json_data_clean.write(unicode("\t\t\t\"Delays\": [ \n"))
		
		#Write all delays
		firstDelay = True
		for delay in trafficDelay.delays:
			if firstDelay:
				json_data_clean.write(unicode("\t\t\t\t{\n"))
				firstDelay = False
			else:
				json_data_clean.write(unicode(",\n\t\t\t\t{\n"))
			
			json_data_clean.write(unicode("\t\t\t\t\t\"Route\": \""+delay.delayRoute+"\",\n"))
			json_data_clean.write(unicode("\t\t\t\t\t\"From\": \""+delay.delayFrom+"\",\n"))
			json_data_clean.write(unicode("\t\t\t\t\t\"To\": \""+delay.delayTo+"\",\n"))
			json_data_clean.write(unicode("\t\t\t\t\t\"Est. delay\": \""+delay.delayTime+"\"\n"))
			json_data_clean.write(unicode("\t\t\t\t}"))

		json_data_clean.write(unicode("\t\t\t] \n"))
		
		json_data_clean.write(unicode("\t\t}"))
	
	json_data_clean.write(unicode("\n\t]\n}\n"))
	

def write_delays_per_day(trafficDelays_sorted, file_per_day):
	trafficDelaysPerDay = []
	trafficDelaysToday = []		

	loopday = ""

	for trafficDelay in trafficDelays_sorted:
		today = trafficDelay.time[:15]
		if not (loopday == today):
			if not trafficDelaysToday == []:
				trafficDelaysPerDay.append(trafficDelaysToday)
			
			loopday = today
			trafficDelaysToday = trafficDelay
			trafficDelaysToday.time = today
			trafficDelaysToday.frequency = "Daily"

		else:
			#search for delays that already occurred and make sum
			for delay in trafficDelay.delays:
				found = True
				for d in trafficDelaysToday.delays:
					if (d.delayRoute == delay.delayRoute and d.delayFrom == delay.delayFrom and d.delayTo == delay.delayTo):
						total = int(delay.delayTime[:-1])+int(d.delayTime[:-1])
						d.delayTime = str(total) + "m"
				if not found:
					trafficDelaysToday.delays.append(delay)

	write_traffic_delays(trafficDelaysPerDay, file_per_day)







trafficDelays = parse_traffic_delay_objects()

#Sort the traffic delays based on time

trafficDelays_sorted = sorted(trafficDelays, key=attrgetter('time'))
write_traffic_delays(trafficDelays_sorted, OUTPUT_FILE_PATH_CLEAN)


#Aggregation for verkeerstijden per day
#Days are represented in this fashion: "Fri Oct 01 2014" (15 characters 0->14)
write_delays_per_day(trafficDelays_sorted, OUTPUT_FILE_PATH_PER_DAY)


#Aggregation for verkeerstijden per 6 hours


#Aggregation for verkeerstijden per hour





"""
#Cleansing for accident_incident_flitsers_werken
json_data_dirty = open(OUTPUT_FILE_PATH_DIRTY, "r")
json_data_clean = open(OUTPUT_FILE_PATH_CLEAN, "w")
data_dirty = json.load(json_data_dirty)
json_data_clean.write("{\n\t\"Weather information\":  [\n")
firstObject = None
# Process object per object
for json_object in data_dirty['objects']:
	json_data_clean.write("\t\t{\n")
	json_data_clean.write("\t\t\t\"Time\": \""+json_object['thisversionrun']+"\"\n")
	json_data_clean.write("\t\t\t\"Frequency\": \""+json_object['frequency']+"\"\n")

	json_data_clean.write("\t\t\t\"Weather\": [ \n")
	firstDelay = None
	results = json_object['results']
	
	json_data_clean.write("\t\t\t] \n")
	if not (firstObject is None):
		json_data_clean.write("\t\t},\n")
	else:
		json_data_clean.write("\t\t}\n")
json_data_clean.write("\n\t]\n}\n")
"""
	
#Aggregation for accident_incident_flitsers_werken

#Cleansing for kmihourly

#Aggregation for kmihourly
