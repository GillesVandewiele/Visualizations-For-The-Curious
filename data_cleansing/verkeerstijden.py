import os
import io
import json
import math
import subprocess

def clean_verkeerstijd(input_dir, output_dir):
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
		
		if(indata['count'] == 96):
			outdata = dict()
			outdata['Time'] = indata['thisversionrun']
			jams_clean = []
			jams_unclean = indata["results"]["Reistijden"]
			
			for jam in jams_unclean:
				#convert delay from .u.." to ...m
				delayString = jam['Vertraging'][0:-1]
				delaySplitted = delayString.split("u")
				if len(delaySplitted) > 1:
					delay = int(delaySplitted[0])*60 + int(delaySplitted[1])
				else:
					delay = int(delaySplitted[0])
				
				jam['Vertraging'] = delay
				jams_clean.append(jam)

			outdata['data'] = jams_clean

			with open(os.path.join(output_dir, f), 'w') as outfile:
				json.dump(outdata, outfile, ensure_ascii = False, indent = 1)

			cleaned +=  1
		else:
			uncleaned += 1

	print("not cleanable: ", str(uncleaned))
	print("cleaned: ", str(cleaned))

def execute(command):
	command = "python " + command;
	subprocess.call(command, shell=True)

execute("JSONize.py --in verkeerstijden --out verkeerstijden_JSON")
clean_verkeerstijd('verkeerstijden_JSON', 'verkeerstijden_clean')
execute("aggregate_data.py --in verkeerstijden_clean --out Verkeerstijden.json")
execute("extract_attribute.py --in Verkeerstijden.json --out route_names_unclean.json --attr_name Route")
execute("create_correcting_dictionary.py --in route_names_unclean.json --dict route_names_corrector.json --updated_attr route_names.json")
execute("create_enumeration_dictionary.py --in route_names.json --out route_names_dict.json")
execute("create_route_dictionary.py --in route_names_dict.json --out route_dict_simple.json --rs van --sd naar")
execute("create_location_dictionary.py --in route_dict_simple.json --loc_rep location_dict.json --route_rep route_dict.json")
execute("upgrade_location_dictionary.py --in location_dict.json --out locations.json")
execute("upgrade_route_dictionary.py --route_rep route_dict.json --loc_rep locations.json --out routes.json")
subprocess.call("gzip routes.json -9", shell=True)
subprocess.call("gzip locations.json -9", shell=True)
execute("extract_attribute.py --in Verkeerstijden.json --out time_list.json --attr_name Time")
execute("create_enumeration_dictionary.py --in time_list.json --out time_dict.json")
execute("swap_enumeration_dictionary.py --in time_dict.json --out times_not_standard.json")
execute("reformat_times.py --in times_not_standard.json --out times.json")
subprocess.call("gzip times.json -9", shell=True)
execute("update_attribute.py --to_update Verkeerstijden.json --updated Verkeerstijden_short.json --dict time_dict.json --attr_name Time")
execute("update_attribute.py --to_update Verkeerstijden_short.json --updated Verkeerstijden_short.json --dict route_names_corrector.json --attr_name Route")
execute("update_attribute.py --to_update Verkeerstijden_short.json --updated Verkeerstijden_short.json --dict route_names_dict.json --attr_name Route")
execute("compress_data.py --in Verkeerstijden_short.json --out data.json --prime_order ['Time'] --second_order ['Route','Vertraging']")
subprocess.call("gzip data.json -9", shell=True)