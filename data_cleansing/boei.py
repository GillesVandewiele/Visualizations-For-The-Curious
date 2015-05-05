import os
import io
import json
import math
import subprocess

def clean_boei(input, output, locations):
	file = open(input, "r")
	indata = json.load(file)
	file.close()
		
	outdata = dict()
	# Convert positions to nr
	position_dict = dict()
	positions = list()
	
	keys = indata['table']['columnNames']
	rows = indata['table']['rows']
			
	for row in rows:
		row_dict = dict()
		# Now add all row attributes to the dict
		for attr_pos in range(len(row)):
			row_dict[keys[attr_pos]] = row[attr_pos]
		
		# Get the location
		position = row_dict.pop('station_id')
		lat = row_dict.pop('latitude')
		long = row_dict.pop('longitude')
		if not position in position_dict:
			position_dict[position] = len(positions)
			positions.append({'name': position, 'nr': len(positions), 'lat': lat, 'long':long})
		
		row_dict['station'] = position_dict[position]
		
		# Get the time
		time = row_dict.pop('time')
		
		if (not time in outdata):
			outdata[time] = {"time": time, "data": list()}
			
		outdata[time]['data'].append(row_dict)

	# Convert the outdata to an array
	times = list(outdata.keys())
	for time in times:
		if not (len(outdata[time]['data'])==3):
			del outdata[time]
			
	outdata = list(outdata.values())

	with open(output, 'w') as outfile:
		json.dump(outdata, outfile, ensure_ascii = False, indent = 1)
		
	with open(locations, 'w') as outfile:
		json.dump(positions, outfile, ensure_ascii = False, indent = 1)

def execute(command):
	command = "python " + command;
	subprocess.call(command, shell=True)

clean_boei('BellMullet A.json', 'BellMullet_A_clean.json', 'stations.json')
subprocess.call("gzip stations.json -9", shell=True)
execute("extract_attribute.py --in BellMullet_A_clean.json --out time_list.json --attr_name time")
execute("create_enumeration_dictionary.py --in time_list.json --out time_dict.json")
execute("swap_enumeration_dictionary.py --in time_dict.json --out times.json")
subprocess.call("gzip times.json -9", shell=True)
execute("update_attribute.py --to_update BellMullet_A_clean.json --updated BellMullet_A_short.json --dict time_dict.json --attr_name time")
execute("compress_data.py --in BellMullet_A_short.json --out data.json --prime_order ['time'] --second_order ['station','PeakPeriod','PeakDirection','UpcrossPeriod','SignificantWaveHeight','SeaTemperature']")
subprocess.call("gzip data.json -9", shell=True)