import os
import json

INPUT_PATH = "temp_accidents/"
CLEAN_PATH = "clean_accidents/"
allFiles = os.listdir(INPUT_PATH)
i = 0
j = 0

for f in allFiles:
	json_data = open(INPUT_PATH + f, "r")
	data = json.load(json_data)
	json_data.seek(0,0)
	strData = json_data.read()
	if(data['count'] == 4):
		index = strData.find("},")
		while 0 <= index:
			strData = strData[:index] + strData[index+17:]
			index = strData.find("},")

		strData = strData.replace("collection1", "Weginfo")
		strData = strData.replace("accident_incident_flitsers_werken", "Accidenten", 1)
		strData = strData.replace("\"accident_incident_flitsers_werken", ",\"Incidenten", 1)
		strData = strData.replace("\"accident_incident_flitsers_werken", ",\"Flitsers", 1)
		strData = strData.replace("\"accident_incident_flitsers_werken", ",\"Werken", 1)	

		fout = open(CLEAN_PATH + f, "w")
		fout.write(strData)
		j = j + 1
	else:
		i = i +1

print("not cleanable: "  + str(i))
print("cleaned: " + str(j))
