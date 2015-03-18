import os
import json
import string

INPUT_PATH = "temp_kmi/"
CLEAN_PATH = "clean_kmi/"
allFiles = os.listdir(INPUT_PATH)
i = 0
j = 0

for f in allFiles:
	json_data = open(INPUT_PATH + f, "r")
	data = json.load(json_data)
	json_data.seek(0,0)
	strData = json_data.read()
	if(data['count'] == 12):
		lines = strData.split('\n')
		if (lines[29].find("property8") > 0):
			strData = "".join((l+"\n") for l in lines[:14])		
			temp = "".join((l+"\n") for l in lines[32:])
			strData = strData + temp
		else:
			strData = "".join((l+"\n") for l in lines[:14])		
			temp = "".join((l+"\n") for l in lines[31:])
			strData = strData + temp

		strData = strData.replace("\"count\": 12", "\"count\": 10")

		strData = strData.replace("collection1", "Weerinfo")
		strData = strData.replace("collection2", "Gemiddelden")
		strData = strData.replace("property1", "Station")
		strData = strData.replace("property2", "Temperatuur (C)")
		strData = strData.replace("property3", "Temperatuur (C)")
		strData = strData.replace("property4", "Luchtvochtigheid (%)")
		strData = strData.replace("property5", "Luchtdruk (hPa)" )
		strData = strData.replace("property6", "Windrichting")
		strData = strData.replace("property7", "Windsnelheid")
		strData = strData.replace("property8", "Weertype")

		r = data['results']
		for o in r['collection1']:
			temp = o['property3'];
			temp = temp.replace(',','.')
			strData = strData.replace(o['property3'], temp)
			temp = o['property5'];
			temp = temp.replace(',','.')
			strData = strData.replace(o['property5'], temp)

		for o in r['collection2']:
			temp = o['property2'];
			temp = temp.replace(',','.')
			strData = strData.replace(o['property2'], temp)		
			
		fout = open(CLEAN_PATH + f, "w")
		fout.write(strData)
		j = j + 1
	else:
		i = i +1

print("not cleanable: "  + str(i))
print("cleaned: " + str(j))
