# Route extraction

### Dependencies
To extract the routes succesfully, you need a standard Python3 with the packages:
  - [GeoPy](https://geopy.readthedocs.org/en/1.9.1/]), for geocoding the coordinates of the start and end route points
  - [Requests](http://docs.python-requests.org/en/latest/), allows to retreive the route information more intuitively

We will use pip to install the dependencies. If you don't have pip, you can find it [here](https://pip.pypa.io/en/latest/installing.html).

To install the packages just execute:
  - for LinuX:
```sh
$ pip install package_name
```
  - for Windows:
```sh
> python -m pip install package_name
```

### Input
You need a JSON file with all routes after the same tag in it as input. This is the case for the aggregated traffic data. (Make sure the placenames in the route are also cleaned, some screenscrapers are unable to read accents, and give non-constistent output when reading names with accents in them. Cleaning the names can be done through the correct_attribute script from the data cleansing folder.)

### Collecting the route data
#### Creating a route repository
As a first step, we extract the routenames from the input file and analyze their names. We will store information of these steps in a kind of route repository.

Execute (add .py to the script name for Windows):
```sh
$ python create_route_repository
Give file with aggregated traffic: Verkeerstijden.json
Give path where the route repository must be stored: routes.json
Give road-start separator (ex. 'from'): van
Give start-destination separator (ex. 'to'): naar
```
#### Creating a location repository
For each start- or end location of the routes, we need to unambiguously know the address, all this location information will be stored in a location repository. Since the locations are not always very clearly defined, this step requires some human help/verification. Execute:
```sh
$ python create_location_repository
Give file with the route repository: routes.json
Give path where the location repository must be stored: locations.json
```
Now, for each searched name, the console will show you the result of the query. If the result is ok, you can press enter, else, you can suggest new queries until the result is correct.

For the traffic dataset, most suggested names will be correct, but following queries should be entered:
  - Leonard: Leonardkruispunt
  - Reyers: Boulevard Auguste Reyers
  - Luxemburg: Luxembourg, Canton Luxemburg
  - Turnhout: Steenweg op Zevendonk, Turnhout
  - Bergen: Avenue de l'Université, Mons
  - Zuid: Brussel-Zuid
  - Duinkerke: Dunkerque

Note that the query for Bergen is longer than necessary and that we enter a query for Turnhout despite it is correctly retreived. This is not necessary, but avoids some work in a later step.

If you unexpectedly get no result for a correct query, this is because the server can be overloaded at certain times of the day. Just reenter the query.

#### Retreiving the route coordinates and finalizing the route and location repository
Using the exact locations from the location repository, we will now calculate the shortest path between the start and ending point of each route. Since the start and ending point are usually not on a highway, these paths often have an unnecessary beginning and ending part. To remove this effect, we only consider the part of the route from where it enters one of the highways from the description until it leaves the last highway from the description.
To apply this algorithm, just execute:
```sh
$ python upgrade_repositories
Give file with the route repository: routes.json
Give file with the location repository: locations.json
Give path the upgraded route repository must be stored: routes_final.json
Give path the upgraded location repository must be stored: locations_final.json
```
If this method executes without printing some 'failed' messages at the end, all data is succesfully collected!
##### Troubleshooting