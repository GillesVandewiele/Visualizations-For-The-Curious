import os
import io
import json
import math
import subprocess

def clean_kmi(input_dir, output_dir):
	# List all files in input_dir
	allFiles = os.listdir(input_dir)
	# Counters for the number of cleaned/uncleaned files
	uncleaned = 0
	cleaned = 0

	# Make sure output_dir is present
	try:
		os.stat(output_dir)
	except:
		os.mkdir(output_dir) 

	# Now, we will process each file in input_dir separately
	for f in allFiles:
	
		# Open the file, load it into a data structure (nested dicts and lists), and close it
		file = open(os.path.join(input_dir, f), "r")
		indata = json.load(file)
		file.close()
		
		# Throw away all files with an incorrect number of observations
		if(indata['count'] == 12):
			# The try-except is for in case the float casting fails (see further)
			try:
				# The output file should be a dictionary (=a json non-array object)
				outdata = dict()
			
				# Initialize the Time and Gemiddelde attributes of the object we will write
				outdata['Time'] = indata['thisversionrun']
				outdata['Gemiddelden'] = float(indata['results']['collection2'][0]['property2'].replace(',','.'))
			
				# We will store weathers_clean as the data field or the json object
				weathers_clean = list()
				weathers_unclean = indata["results"]["collection1"]
			
				# The first two observations are useless in the weather data
				for i in range(2, len(weathers_unclean)):
					# weather_unclean is one of the observations of one of the stations
					weather_unclean = weathers_unclean[i]
					# weather_clean is the cleaned observation
					weather_clean = dict()
					weather_clean['Station'] = weather_unclean['property1']
					weather_clean['Temperatuur (C)'] = float(weather_unclean['property3'].replace(',','.'))
					weather_clean['Luchtvochtigheid (%)'] = int(weather_unclean['property4'])
					weather_clean['Luchtdruk (hPa)'] = float(weather_unclean['property5'].replace(',','.'))
					weather_clean['Windrichting'] = weather_unclean['property6']
					# If 'Windrichting' was not properly observed, ignore this file
					if (weather_clean['Windrichting'] == "" or weather_clean['Windrichting'] == "-"):
						raise Exception('Bad windrichting')
					weather_clean['Windsnelheid'] = int(weather_unclean['property7'])
					weather_clean['Weertype'] = weather_unclean['property8']
				
					weathers_clean.append(weather_clean)

				outdata['data'] = weathers_clean

				# Write the cleaned file
				with open(os.path.join(output_dir, f), 'w') as outfile:
					json.dump(outdata, outfile, ensure_ascii = False, indent = 1)
				
				# Increase the cleaned file counter (for reporting)
				cleaned +=  1
			except:
				# In case of an exception when casting to floats --> increase the uncleaned file counter (for reporting)
				uncleaned += 1
				pass
			 
		else:
			# In case of an invalid nr of measurements --> increase the uncleaned file counter (for reporting)
			uncleaned += 1

	# Report the nr of cleaned/ignored files
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
execute("swap_enumeration_dictionary.py --in station_names_dict.json --out stations_no_loc.json")
execute("upgrade_location_dictionary.py --in stations_no_loc.json --out stations.json")
subprocess.call("gzip stations.json -9", shell=True)
execute("extract_attribute.py --in kmihourly.json --out windrichtingen_list.json --attr_name Windrichting")
execute("create_enumeration_dictionary.py --in windrichtingen_list.json --out windrichtingen_dict.json")
execute("swap_enumeration_dictionary.py --in windrichtingen_dict.json --out windrichtingen.json")
subprocess.call("gzip windrichtingen.json -9", shell=True)
execute("extract_attribute.py --in kmihourly.json --out weertypes_list.json --attr_name Weertype")
execute("create_enumeration_dictionary.py --in weertypes_list.json --out weertypes_dict.json")
execute("swap_enumeration_dictionary.py --in weertypes_dict.json --out weertypes.json")
subprocess.call("gzip weertypes.json -9", shell=True)
execute("extract_attribute.py --in kmihourly.json --out time_list.json --attr_name Time")
execute("create_enumeration_dictionary.py --in time_list.json --out time_dict.json")
execute("swap_enumeration_dictionary.py --in time_dict.json --out times_not_standard.json")
execute("reformat_times.py --in times_not_standard.json --out times.json")
subprocess.call("gzip times.json -9", shell=True)
execute("update_attribute.py --to_update kmihourly.json --updated kmihourly_short.json --dict station_names_corrector.json --attr_name Station")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict station_names_dict.json --attr_name Station")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict windrichtingen_dict.json --attr_name Windrichting")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict weertypes_dict.json --attr_name Weertype")
execute("update_attribute.py --to_update kmihourly_short.json --updated kmihourly_short.json --dict time_dict.json --attr_name Time")
execute("compress_data.py --in kmihourly_short.json --out data.json --prime_order ['Time','Gemiddelden'] --second_order \"['Station','Temperatuur (C)','Luchtvochtigheid (%)','Luchtdruk (hPa)','Windrichting','Windsnelheid','Weertype']\"")
subprocess.call("gzip data.json -9", shell=True)