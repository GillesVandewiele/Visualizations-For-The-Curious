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
	return str(year)+"-"+str(month).zfill(2)+"-"+str(day).zfill(2)+"T"+time+zone1+":"+zone2

INPUT_PATH = None
DICT_PATH = None
ATTR_PATH = None

optlist, args = getopt.getopt(sys.argv[1:], "", ["in=", "out=", "dict="])
for o, a in optlist:
	if o == "--in":
		INPUT_PATH = a
	elif o == "--dict":
		DICT_PATH = a
	elif o == "--out":
		ATTR_PATH = a
		
if (INPUT_PATH==None):
	INPUT_PATH = input("Give file with the extracted attributes: ")
	
if (DICT_PATH==None):
	DICT_PATH = input("Give path where the correcting time dictionary must be stored: ")
	
if (ATTR_PATH==None):
	ATTR_PATH = input("Give path where the updated times must be stored: ")

file = open(INPUT_PATH, "r")
bad_time_list = json.load(file)
file.close()

corr_time_dict = dict()
corr_time_set = set()
for bad_time in bad_time_list:
	corr_time = to_ISO_8601(bad_time)
	corr_time_dict[bad_time] = corr_time
	corr_time_set.add(corr_time)
	
with open(DICT_PATH, 'w') as outfile:
    json.dump(corr_time_dict, outfile, ensure_ascii = False, indent = 1)
	
with open(ATTR_PATH, 'w') as outfile:
    json.dump(list(corr_time_set), outfile, ensure_ascii = False, indent = 1)