import os
import io
import json
import math
import subprocess

def clean_aifw(input_dir, output_dir):
	allFiles = os.listdir(input_dir)
	uncleaned = 0
	cleaned = 0

	# Make sure output_dir is present
	try:
		os.stat(output_dir)
	except:
		os.mkdir(output_dir) 

	for f in allFiles:
		file = open(os.path.join(input_dir, f), "r")
		indata = json.load(file)
		file.close()
		
		if(indata['count'] == 4):
			outdata = dict()	
			outdata['Time'] = indata['thisversionrun']
			outdata['Accident'] = int(indata['results']['collection1'][0]['accident_incident_flitsers_werken'])
			outdata['Incident'] = int(indata['results']['collection1'][1]['accident_incident_flitsers_werken'])
			outdata['Flitsers'] = int(indata['results']['collection1'][2]['accident_incident_flitsers_werken'])
			outdata['Werken'] = int(indata['results']['collection1'][3]['accident_incident_flitsers_werken'])
			
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

execute("JSONize.py --in accident_incident_flitsers_werken --out aifw_JSON")
clean_aifw('aifw_JSON', 'aifw_clean')
execute("aggregate_data.py --in aifw_clean --out aifw.json")
execute("extract_attribute.py --in aifw.json --out time_list.json --attr_name Time")
execute("create_enumeration_dictionary.py --in time_list.json --out time_dict.json")
execute("swap_enumeration_dictionary.py --in time_dict.json --out times_not_standard.json")
execute("reformat_times.py --in times_not_standard.json --out times.json")
subprocess.call("gzip times.json -9", shell=True)
execute("update_attribute.py --to_update aifw.json --updated aifw_short.json --dict time_dict.json --attr_name Time")
execute("compress_data.py --in aifw_short.json --out data.json --prime_order ['Time','Accident','Incident','Flitsers','Werken']")
subprocess.call("gzip data.json -9", shell=True)