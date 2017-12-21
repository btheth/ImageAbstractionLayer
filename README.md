Image Search Abstraction Layer

Image search API for freecodecamp

Query option: /latest

Returns a history of past searches in the format [ {search:search,timestamp:timestamp} ]



Query option: /imagesearch?term=\<search\>&offset=#

First param must be "term". Can use with "term" as only param. If there is a second param, it must be "offset", and the value must be a number. It can be a decimal, but it will be floored to the next lowest int. If < 1, will be set to 1. If > 10, will be set to 10.

Returns 5 results by default or up to 10 based on offset param in the form [{url: imgUrl, snippet: snippetString, thumbnail: thumbnailUrl, context: contextUrl}]
