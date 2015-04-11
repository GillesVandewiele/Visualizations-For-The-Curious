import os
import io
import json
import math
import subprocess

def clean_kmi(input_dir, output_dir):
	allFiles = os.listdir(input_dir)
	uncleaned = 0
	cleaned = 0

	try:
		os.stat(output_dir)
	except:
		os.mkdir(output_dir) 

	for f in allFiles:
		file = open(os.path.join(input_dir, f), "r")
		indata = json.load(file)
		file.close()
		
		if(indata['count'] == 12):
			try:
				outdata = dict()
			
				outdata['Time'] = indata['thisversionrun']
				outdata['Gemiddelden'] = float(indata['results']['collection2'][0]['property2'].replace(',','.'))
			
				weathers_clean = list()
				weathers_unclean = indata["results"]["collection1"]
			
				for i in range(2, len(weathers_unclean)):
					weather_unclean = weathers_unclean[i]
					weather_clean = dict()
					weather_clean['Station'] = weather_unclean['property1']
					weather_clean['Temperatuur (C)'] = float(weather_unclean['property3'].replace(',','.'))
					weather_clean['Luchtvochtigheid (%)'] = int(weather_unclean['property4'])
					weather_clean['Luchtdruk (hPa)'] = float(weather_unclean['property5'].replace(',','.'))
					weather_clean['Windrichting'] = weather_unclean['property6']
					if (weather_clean['Windrichting'] == "" or weather_clean['Windrichting'] == "-"):
						raise Exception('Bad windrichting')
					weather_clean['Windsnelheid'] = int(weather_unclean['property7'])
					weather_clean['Weertype'] = weather_unclean['property8']
				
					weathers_clean.append(weather_clean)

				outdata['data'] = weathers_clean

				with open(os.path.join(output_dir, f), 'w') as outfile:
					json.dump(outdata, outfile, ensure_ascii = False, indent = 1)
				
				cleaned +=  1
			except:
				uncleaned += 1
				pass
			 
		else:
			uncleaned += 1

	print("not cleanable: ", str(uncleaned))
	print("cleaned: ", str(cleaned))

def execute(command):
	command = "python " + command;
	subprocess.call(command, shell=True)

execute("JSONize.py --in kmihourly --out kmihourly_JSON")
clean_kmi('kmihourly_JSON', 'kmihourly_clean')
execute("aggregate_data.py --in kmihourly_clean --out kmihourly.json")
execute("extract_attribute.py --in kmihourly.json --out station_names_unclean.json --attr_name Station")
execute("create_correcting_dictionary.py --in station_names_unclean.json --dict station_names_corrector.json --updated_attr station_names.json")
execute("create_enumeration_dictionary.py --in station_names.json --out station_names_dict.json")
execute("swap_enumeration_dictionary.py --in station_names_dict.json --out stations.json --dict_name stations")
subprocess.call("gzip stations.json -9", shell=True)
execute("extract_attribute.py --in kmihourly.json --out windrichtingen_list.json --attr_name Windrichting")
execute("create_enumeration_dictionary.py --in windrichtingen_list.json --out windrichtingen_dict.json")
execute("swap_enumeration_dictionary.py --in windrichtingen_dict.json --out windrichtingen.json --dict_name windrichtingen")
subprocess.call("gzip windrichtingen.json -9", shell=True)
execute("extract_attribute.py --in kmihourly.json --out weertypes_list.json --attr_name Weertype")
execute("create_enumeration_dictionary.py --in weertypes_list.json --out weertypes_dict.json")
execute("swap_enumeration_dictionary.py --in weertypes_dict.json --out weertypes.json --dict_name windrichtingen")
subprocess.call("gzip weertypes.json -9", shell=True)
execute("extract_attribute.py --in kmihourly.json --out time_list.json --attr_name Time")
execute("create_enumeration_dictionary.py --in time_list.json --out time_dict.json")
execute("swap_enumeration_dictionary.py --in time_dict.json --out times_not_standard.json --dict_name times")
execute("reformat_times.py --in times_not_standard.json --out times.json")
subprocess.call("gzip times.json -9", shell=True)
execute("update_attribute.py --to_update kmihourly.json --updated kmihourly_short.json --dict station_names_corrector.json --attr_name Station")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict station_names_dict.json --attr_name Station")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict windrichtingen_dict.json --attr_name Windrichting")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict weertypes_dict.json --attr_name Weertype")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict time_dict.json --attr_name Time")
execute("compress_data.py --in kmihourly_short.json --out data.json --prime_order ['Time','Gemiddelden'] --second_order \"['Station','Temperatuur (C)','Luchtvochtigheid (%)','Luchtdruk (hPa)','Windrichting','Windsnelheid','Weertype']\"")
subprocess.call("gzip data.json -9", shell=True)