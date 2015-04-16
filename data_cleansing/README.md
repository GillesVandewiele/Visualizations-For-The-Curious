# Data cleansing

### Introduction
To allow you to add new datasets with as least effort as possible, while maintaining maximum flexibility, we have created a library of python scripts that can be used to clean and compress a new dataset. Processing a complete new dataset should be possible with around 100 lines of python code. As an example, we have provided three scripts that allow to clean the verkeerstijden, kmi and accident-incident-flitsers-werken dataset.

### Dependencies
To extract the route info from the data, you need a standard Python3 with the packages:
  - [GeoPy](https://geopy.readthedocs.org/en/1.9.1/]), for geocoding the coordinates of the start and end route points
  - [Requests](http://docs.python-requests.org/en/latest/), allows to retreive the route information more intuitively
  - [polyline](http://polyline.readthedocs.org/en/v1.1/), for (de)compression of the route geometry

We will use pip to install the dependencies. If you don't have pip, you can find it [here](https://pip.pypa.io/en/latest/installing.html).

To install the packages, open a command window in this directory and execute:
```sh
$ pip install -r requirements.txt
```

### Examples
We have provided three example scripts, that can be used to process the datasets that were given to us. Before executing these scripts, place traffic jam info in a folder 'verkeerstijden', weather info in a folder 'kmihourly', or accident info in a folder 'accident_incident_flitsers_werken'. Then, just execute the scripts.

The screenscraper used to collect the data was unable to recognize special characters (é, è, â) in some of the locations from the 'kmihourly' dataset and the 'verkeerstijden' dataset, so you will be asked to enter the correct placename for each set of locations with similar names.

Furthermore, the locations in the input dataset are not unamibigeously defined, so you will have to assist when the coordinates for the given placenames are retreived. When a location is correctly retreived, you can just enter. Otherwise you have to enter another query. Good queries for incorrectly retreived locations of the 'verkeerstijden' dataset are:
  - Leonard: Leonardkruispunt
  - Reyers: Boulevard Auguste Reyers
  - Luxemburg: Luxembourg, Canton Luxemburg
  - Turnhout: Steenweg op Zevendonk, Turnhout
  - Bergen: Avenue de l'Université, Mons
  - Zuid: Brussel-Zuid
  - Duinkerke: Dunkerque

In the kmi dataset, there are also a couple of locations which are not found. To find these locations, just specify the country by adding ', Belgium' to the query.

### Adding a new dataset
#### Overview
When adding process a new dataset, these are the steps we have to go through:
  1. Convert each inputfile to JSON format
  2. Bring each input file into a standard form
  3. Join the input files into one large file that contains the dataset
  4. For each non-numerical attribute (eg. routes, weathertypes,...):
  
     1. Extract the different values of the attribute from the dataset
     2. Create a dictionary that maps each of the values of an attribute to a unique number
     3. Replace the attribute values by the number in the dataset
     4. Change the dictionary from 2, so that is maps the number to the attribute value
     5. Gzip the dictionary
    
  5. Compress the dataset
  6. Gzip the dataset

Step 4.4 greatly reduces the size of the dataset, since the same values occur (generally) often in the dataset, and sending a number requires much characters than sending a string. We chose for gzip compression, since this is natively supported by most browsers today.

#### That's very nice, but how to start?
We have added a script library that will support you in every step from the overview above, with the exception of step 2, since bringing the data into standard form is very different for different datasets. But don't worry, with Python, you can do this quick and easy. Every of our python can take parameters through the commandline, or you can just execute the script, after which it will ask for the
parameters itself. The input data and output data of each script is read from/written to folders or files. Give your files easy and logical names, otherwise, you can easily lose track of what is going on.

#### 1. Converting the html input files to JSON format
Easy as pie! Just execute (add .py after the script name on Windows):
```sh
$ python JSONize --in folder_with_html_responses --out folder_for_json_files
```
From the HTML messages with an 'OK' response code, the JSON bodies will be retreived. HTML messages with an other response code will be thrown away.
#### 2. Bring each input file into standard form
To allow the other library functions to process your json files, they have to statisfy the following formatting:
```sh
{
    "First_(non-numerical)_observation": "Rainy",
    "Second_(numerical)_observation": 43,
    "Third_(numerical)_observation": 3.1415,
    "data": [
        {
            "First_nested_observation": "Kleine-Brogel",
            "Second_nested_observation": 4
        },
        {
            "First_nested_observation": "Hoge Venen",
            "Second_nested_observation": -3
        }
    ]
}
```
As you can see, the outputted file should consist of one JSON object, without no nesting, except for one attribute, which has to be called "data". The "data" attribute is an array that consists of objects without further nesting. If you should choose not to follow this rule, the compression function will not work anymore, and you will have to rewrite that. The rest of the library will still work, whatever the formatting, as long as you don't give two attributes with a different meaning the same name.

Try to cast numerical attributes (if they are stored as strings) to numbers: this removes the accolades and will make the final output file smaller.

If you want to throw away some files with bad or useless information (for example, a wrong number of observations), this is also the step to do this.

For examples how to bring data to the standard format, you can look at the well commented 'clean_kmi' function from 'kmi.py'. The other example scripts, 'accident_incident_flitsers.py' and 'verkeerstijden.py' may also proove useful.
#### 3. Join the input files into one large file that contains the dataset
Just execute:
```sh
$ python aggregate_data --in folder_with_standard_form_json_files --out joined_data_file.json
```
And go drink a cup of coffee
#### 4. Processing a non-numerical attribute
##### 4.1. Extract the different values of the attribute from the dataset
This command wil collect all the different values for the specified attribute from the dataset, and will store them as a list in a file.
```sh
$ python extract_attribute --in joined_data_file.json --out attribute_values.json --attr_name attribute_name
```
##### 4.2. Create a dictionary that maps each of the values of an attribute to a unique number
This command wil create a dictionary that maps all the collected values to a number.
```sh
$ python create_enumeration_dictionary --in attribute_values.json --out attribute_to_nr.json
```
##### 4.3. Replace the attribute values by the number in the dataset
With this dictionary, we can replace all occurences of the value by a number.
```sh
$ python update_attribute --to_update joined_data_file.json --dict attribute_to_nr.json --updated joined_data_file_updated.json --attr_name attribute_name
```
##### 4.4. Revert the dictionary from 4.2, so that is maps the number to the attribute value
And now we can change the order, resulting in a mapping of numbers to values (this is just an array, with all objects on the correct index).
```sh
$ python swap_enumeration_dictionary --in attribute_to_nr.json --out nr_to_attribute.json
```
##### 4.5. Gzip the dictionary
Gzip is compression format with widespread support. You can gzip as follows:
```sh
$ gzip nr_to_attribute.json -9
```
The -9 parameters is the compression level, which ranges from 1 to 9.
####5. Compress the dataset
After replacing all the string occurences in the dataset, it's time to compress it! This step will convert all the json objects in to arrays. Because there is no ordering in the attributes of an object, you have to specify this. prime_order should be an array of attributes of the json object you created in step 2. second_order should be an array of attributes of the data attribute of the json object you created in step 2, if there was such an attribute. second_order is an optional argument. Now you are ready for:
```sh
$ compress_data.py --in joined_data_file_updated.json --out compressed.json --prime_order ['First_(non-numerical)_observation','Third_(numerical)_observation'] --second_order ['Second_nested_observation','First_nested_observation']
```
####6. Gzip the dataset
This is similar to 4.5.

### Other library scripts
#### Locations
If you want to create a map visualisation, you will inevitably get at the point where you want to find coordinates for a certain location attribute of your dataset. The process of getting these coordinates starting from an informal name is called [geocoding](http://en.wikipedia.org/wiki/Geocoding). We have created a script that allows you to geocode any dictionary that is a mapping a number to a location name. This script uses the [Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim) geocoder API. Since the location name from a dataset are typically not unambiguously defined, for each location from the dataset, the precise human readable address will be presented to you. If this location is correct, you can just press enter. Otherwise, you can keep changing the query until the retrieved location is correct.
To add positional information to a dictionary with location names, just execute:
 ```sh
$ python upgrade_location_dioctionary.py --in dict_with_location_names.json --out dict_with_location_names_and_coordinates.json
```
##### Troubleshooting
If the geocoder keeps failing to retrieve the correct location, you can try to search the location via [this](http://map.project-osrm.org/) site. The site will give similar queries when you enter an address. You can copy the correct entry from the site. If your entry works on the site, but our command prompt says that no results were found, this probably means that the Nominatim server is over loaded and did not respond. Just re-enter your query. If the server keeps giving no response, you should try again at a later time.
#### Routes
Even more than collecting location coordinates, collecting route data (series of coordinates) seems hard. However, we've created some scipts that make this somewhat less hard for you.

As a first step, we will parse a dictionary that maps numbers to routes, in order to find for each route the start location, end location, and start and ending roads. We have created a script that allows you to parse any string that is formatted like: 'start_or_ending_road/start_or_ending_road/.../start_or_ending_road road-start_separator start start-destination_separator destination'. For example, for the input string 'A1/A115 from Berlin to Paris', 'A1' and 'A115' are start or ending roads, 'from' is the road-start separator, 'Berlin' is the start, 'to' is the start-destination separator and 'Paris' is the destination.
To parse the route dictionary and add the parsed information, you can execute:
 ```sh
$ python create_route_dictionary.py --in dict_with_route_names.json --out dict_with_route_names_and_parsed_info.json --rs road-start_separator --sd start-destination_separator
```
When you have a dataset af a country, a certain location typically occurs as start or ending point of many routes. Of course we don't want to manually verify the geocoding of the same location over and over. To avoid this, we will extract all the start and ending points of our route in a dictionary that maps numbers to location names, and we will update the route dictionary to hold references to the correct locations from the location dictionary. This is easy:
 ```sh
$ python create_location_dictionary.py --in dict_with_parsed_route_info.json --loc_rep dict_with_locations.json --route_rep dict_with_parsed_route_info_refering_to_location_dict.json
```
Now we can add coordinates to this location dictionary as described in the section above.

Finally, we can find the route coordinates! Our algorithm to to this asks the [OSRM API](https://github.com/Project-OSRM/osrm-backend/wiki/Server-api) for the shortest route between the starting and ending location. It will return this route from the moment it enters the one of the start or ending roads that were extracted in the parsing step until it leaves the last start or ending road.
Execute:
 ```sh
$ python upgrade_route_dictionary.py --route_rep dict_with_parsed_route_info.json --loc_rep dict_with_location_names_and_coordinates.json --out dict_with_parsed_info_and_route_coordinates.json
```
Open the updated dictionary and make sure the word 'error' does not occur. If it does, there will be a detailed error message with an explanation. Don't worry if the coordinates of a route look strange. The routes are in the [Google encoded polyline format](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) for compression reasons.
#### Inconsistent attribute values
Some screenscrapers are unable to recognize special characters (é, è, â) and read them each time they encounter them as a different variation of one or more other characters. The consistency in this mistake is that none of the wrongly detected characters are ASCII-characters. This means that, when we remove the non-ascii characters from the incorrect words, all different variations of the same word are equal. We have written a script that allows you to replace all words with the same ASCII-substring by a corrected word. The input of this script is a list of all possible attribute values (after executing extract_attribute, you have such a list). The output consist of a list of the corrected attribute names, and a dictionary that can be used with update_attribute to update the incorrect values in the data file.
You do this by executing:
```sh
$ python create_correcting_dictionary.py --in list_with_wrong_attr_values.json --updated_attr list_with_correct_attribute_values.json --dict mapping_from_wrong_to_correct_attribute_value.json
```
#### ISO8601
The scraping times of [Kimono](https://www.kimonolabs.com/welcome.html), a popular web scraper app, is in a non-standard time format. This is not ideal for processing it in javascript. We have created a script that allows you to convert a dictionary with a mapping from numbers to the non-standard Kimono time into one that maps these numbers to the corresponding ISO8601 time format.
This goes as follows:
```sh
$ python reformat_times.py --in dict_from_nr_to_kimono_time.json --out dict_from_nr_to_ISO1801.json
```