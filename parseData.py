import json
import requests
import xmltodict
import warnings
import re
warnings.filterwarnings("ignore")

CONSUMER_KEY = 'AxQlDpwSUiyEjkmHEsbsmQ'
CONSUMER_SECRET = 'Fm7tvMVKCYk8KcFyXBcDnA5Sqdy3YHVFVcw5DL1x2g'

with open('books.json') as data_file:    
    data = json.load(data_file)

jsonData = []

for index, piece in enumerate(data):

	# Get Book Data

	searchQuery = re.sub('[&]', '', piece["bookTitle"])
	bookUrl = "https://www.goodreads.com/search/index.xml&format=xml?key=AxQlDpwSUiyEjkmHEsbsmQ&q=" + searchQuery
	resp = requests.get(bookUrl)
	bookOb = xmltodict.parse(resp.text)
	
	# Check for book match
	bestResult = None
	for result in bookOb["GoodreadsResponse"]["search"]["results"]["work"]:
		if (piece["bookTitle"].lower().strip() == result["best_book"]["title"].lower().strip()):
			bestResult = result
			break

	# Get Movie Data
	movieUrl = "http://www.omdbapi.com/?t=" + piece["movieTitle"] + "&y=&plot=full&r=json&tomatoes=true"
	resp = requests.get(movieUrl)
	movieOb = resp.json()

	jsonData.append({
		"bookTitle": bestResult["best_book"]["title"],
		"author": bestResult["best_book"]["author"]["name"],
		"bookReleaseDate": bestResult["original_publication_year"]["#text"],
		"bookRating": bestResult["average_rating"],
		"bookRatingCount": bestResult["ratings_count"]["#text"],
		"movieTitle": movieOb["Title"],
		"movieReleaseDate": movieOb["Year"],
		"awards": movieOb["Awards"],
		"genre": movieOb["Genre"],
		"rated": movieOb["Rated"],
		"imdbRating": movieOb["imdbRating"],
		"tomatoRating": movieOb["tomatoRating"],
		"tomatoMeter": movieOb["tomatoMeter"],
		"tomatoAudienceRating": movieOb["tomatoUserRating"],
		"tomatoAudienceMeter": movieOb["tomatoUserMeter"],
		"boxOffice": movieOb["BoxOffice"],
		"plot": movieOb["Plot"]
	})


with open('text.json', 'w') as data_file:
	json.dump(jsonData, data_file, indent=4, sort_keys=True)

