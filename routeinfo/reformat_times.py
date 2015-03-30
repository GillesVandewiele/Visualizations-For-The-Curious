import os
import io
import json
import string
import getopt
import sys

# This is one route
def to_ISO_8601(scraper_date):
	month_to_nr = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}
	month = month_to_nr[scraper_date[4:7]]
	day = scraper_date[8:10]
	year = scraper_date[11:15]
	time = scraper_date[16:24]
	zone1 = scraper_date[28:31]
	zone2 = scraper_date[31:33]
	return str(year)+"-"+str(month)+"-"+str(day)+"T"+time+zone1+":"+zone2

INPUT_PATH = None
OUTPUT_PATH = None
	
optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--out":
		OUTPUT_PATH = a
	
if (INPUT_PATH == None):
	INPUT_PATH = input("Give file with the time dictionary: ")
if (OUTPUT_PATH == None):
	OUTPUT_PATH = input("Give path the updated time dictionary must be stored: ")

file = open(INPUT_PATH, "r")
time_dict_list = json.load(file)["times"]
file.close()

time_dict_list_updated = list()
for time in time_dict_list:
	time["name"] = to_ISO_8601(time["name"])
	time_dict_list_updated.append(time)
	
with open(OUTPUT_PATH, 'w') as outfile:
    json.dump({"times": time_dict_list_updated}, outfile, ensure_ascii = False, indent = 1)