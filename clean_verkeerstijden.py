import os
import json
import re

INPUT_PATH = "temp_verkeerstijden/"
CLEAN_PATH = "clean_verkeerstijden/"
allFiles = os.listdir(INPUT_PATH)
i = 0
j = 0

for f in allFiles:
	json_data = open(INPUT_PATH + f, "r")
	data = json.load(json_data)
	json_data.seek(0,0)
	strData = json_data.read()
	if(data['count'] == 96):
		results = data['results']

		for r in results['Reistijden']:
			#convert delay from .u.." to ...m
			temp = r['Vertraging']
			delayString = r['Vertraging']
			delayHours = delayString.split("u")
			if len(delayHours) > 1:
				hoursInMinutes = int(delayHours[0])*60
				minutes = re.sub("\"","",delayHours[1])
				delayString = str(hoursInMinutes + int(minutes))
			else:
				minutes = delayString.split("\"")
				delayString = str(int(minutes[0]))

			strData = strData.replace("\""+temp[:-1] + "\\\"", "\""+delayString, 1)

		fout = open(CLEAN_PATH + f, "w")
		fout.write(strData)
		j = j + 1
	else:
		i = i + 1

print("not cleanable :", str(i))
print("cleaned :", str(j))
