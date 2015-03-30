import os
import io
import json
import math
import subprocess

def process_verkeerstijden(input_file, output_file):
	input_file = open(input_file, 'r')
	traffic_unformatted = json.load(input_file)
	verkeerstijden = traffic_unformatted["Verkeerstijden"]
	data = list();
	for verkeerstijd in verkeerstijden:
		time_data = [verkeerstijd["Time"]]
		delays = list()
		reistijden = verkeerstijd["Collections"]["Reistijden"]
		for reistijd in reistijden:
			delays.append([int(reistijd["Vertraging"]), reistijd["Route"]])
		time_data.append(delays)
		data.append(time_data)

	with open(output_file, 'w') as outfile:
		json.dump({"data" : data}, outfile, separators=(',', ':'))

def execute(command):
	command = "python " + command;
	subprocess.call(command, shell=True)

# De vereiste voor dit script is dat de output van Karels scripts in Verkeerstijden.json zit opgeslagen en samen met de andere .py bestanden en dit script in één en dezelfde map zit
execute("extract_attribute.py --in Verkeerstijden.json --out route_names_unclean.json --attr_name Route")
execute("create_correcting_dictionary.py --in route_names_unclean.json --dict route_names_corrector.json --updated_attr route_names.json")
execute("create_enumeration_dictionary.py --in route_names.json --out route_names_dict.json")
execute("create_route_repository.py --in route_names_dict.json --out route_repo.json --rs van --sd naar")
execute("create_location_repository.py --in route_repo.json --out location_repo.json")
execute("upgrade_repositories.py --route_rep route_repo.json --loc_rep location_repo.json --route_rep_up routes.json --loc_rep_up locations.json")
subprocess.call("gzip routes.json -9", shell=True)
subprocess.call("gzip locations.json -9", shell=True)
execute("extract_attribute.py --in Verkeerstijden.json --out time_list.json --attr_name Time")
execute("create_enumeration_dictionary.py --in time_list.json --out time_dict.json")
execute("swap_enumeration_dictionary.py --in time_dict.json --out times_not_standard.json --dict_name times")
execute("reformat_times.py --in times_not_standard.json --out times.json")
subprocess.call("gzip times.json -9", shell=True)
execute("update_attribute.py --to_update Verkeerstijden.json --updated Verkeerstijden_short.json --dict time_dict.json --attr_name Time")
execute("update_attribute.py --to_update Verkeerstijden_short.json --updated Verkeerstijden_short.json --dict route_names_corrector.json --attr_name Route")
execute("update_attribute.py --to_update Verkeerstijden_short.json --updated Verkeerstijden_short.json --dict route_names_dict.json --attr_name Route")
process_verkeerstijden('Verkeerstijden_short.json', 'data.json')
subprocess.call("gzip data.json -9", shell=True)