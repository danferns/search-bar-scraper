# search-bar-scraper
This script will open each website on [this top 500 list](https://moz.com/top500) and see if it has a search bar in its home page. If it does,
then it will enter a test search query, and retrieve the syntax the website uses for performing search queries. After looking at all sites, the
data retrieved will be saved in a json file.


## What is this for?
The search feature for most websites on the internet will redirect you to a search results page, 
where you can actually see your query in the URL. For example, if you type in "Hello World" on Google, 
it'll take you to a page where the URL will look like this:

```
https://www.google.com/search?q=Hello+World
```

This makes it possible to programatically initiate a search on Google by joining the search terms with
a separator (`+` in this case) and appending the joined string to a base URL (`https://www.google.com/search?q=`).

It turns out that you can actually do this for many websites, and not just search engines! (I'm talking about
things like Spotify, GitHub, and more!)

I wanted to have a small database of the search URLs for some of the most popular websites so that I may use it 
in a personal project. This is what I built this script for. 

It's not perfect, and requires some manual cleaning of data, but it does save me a lot of time
from clicking through each of those sites and making a search to get their URLs by hand.

## Limitations
- Some websites hide the search bar and require you to press a button to make it visible. I haven't done
the work for supporting these.
- It fails to find the search bar the second time on some websites.

## License
MIT
