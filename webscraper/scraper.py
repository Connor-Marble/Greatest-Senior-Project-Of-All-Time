import os
import time
import re
from sys import argv
import urllib2
from xml.etree import ElementTree as et
from collections import namedtuple

destination = './reviews'

#request string
url_base = "https://steamcommunity.com/app/{appid}/homecontent/?userreviewsoffset={offset}&p={pagenum}&browsefilter=mostrecent&appHubSubSection=10"

#Relevant patterns for extracting info
content_start = '<div class="apphub_UserReviewCardContent">'
content_end = '<div class="UserReviewCardContent_Footer">'

date_pattern=re.compile(r'<div class="date_posted">Posted:*(?P<date>.+)*</div>')
thumbs_up_pattern='thumbsUp.png'
found_helpful_pattern=re.compile('(?P<count>[0-9]{1,4}) of (?P<total>[0-9]{1,4}) people \((?P<percent>[0-9]{1,2})\%\) found this review helpful')

title_pattern=re.compile('<div class="apphub_AppName">(?P<title>.*?)</div>')

store_url_base="http://store.steampowered.com/app/{}/"

#review structure
Review=namedtuple('Review', 'date text thumbs_up foundhelpful notfoundhelpful')

class ReviewScraper(object):

    def __init__(self, gameid, ratelimit=1):
        self.gameid=gameid
        self.ratelimit=ratelimit
        self.page=0
        self.currentpage=[]
        self.title=None

    def __iter__(self):
        return self

    def __enter__(self):
        #get id for last review scraped
        self.page=1
        return self

    def __exit__(self, error_type, error_value, traceback):
        #where we will record our place in DB
        print error_type or ''
        return not bool(error_type or error_value or traceback)

    def _get_next_page(self):
        request_url=url_base.format(appid=self.gameid, offset=(self.page-1)*10, pagenum=self.page)
        content = urllib2.urlopen(request_url).read()
        self.currentpage = ReviewScraper.parse_review_page(content)
        self.page += 1
        return bool(self.currentpage)

    def get_title(self):
        if not self.title:
            request_url=store_url_base.format(self.gameid)
            storepage=urllib2.urlopen(request_url).read()
            title_m=re.search(title_pattern ,storepage)
            self.title = title_m.group('title')

        return self.title
    
    def next(self):
        if self.currentpage:
            return self.currentpage.pop(0)

        if self._get_next_page():
            return self.currentpage.pop(0)

        raise StopIteration

    @staticmethod
    def parse_review_page(text):
            output = []
            start = 0
            try:
                while(text.find(content_start)):
                    start = text.index(content_start, start+len(content_start)-1)
                    end = text.index(content_end, start)
                    content = text[start:text.rindex('</div>', start, end)-10]                    

                    
                    helpful_count=0
                    nothelpful_count=0
                    
                    found_helpful_m=re.search(found_helpful_pattern,content)

                    if found_helpful_m:
                        helpful_count=int(found_helpful_m.group('count'))
                        nothelpful_count=int(found_helpful_m.group('total'))-helpful_count

                    thumbs_up=bool(thumbs_up_pattern in content)
                    date = re.search(date_pattern, content).group('date')
                    
                    content=clean_review_text(content)
                    
                    output.append(Review(date, content, thumbs_up, helpful_count, nothelpful_count))
                    
            except ValueError:
                #no more reviews could be found
                pass
                                  
            except Exception, e:
                print 'unexpected error {}'.format(e)
                raise 

            return output


def dump_reviews_to_json(gameid, count):

    if not os.path.exists(destination):
        os.makedirs(destination)
        
    
    with ReviewScraper(gameid) as scraper:
        with open('{}/{}.json'.format(destination, gameid), 'w') as output:
            
            output.write(scraper.get_title() + '\n')
            
            for i, review in enumerate(scraper):
                
                json = ('{{"num_found_helpful": {},'+\
                          '"num_found_unhelpful": {},'+\
                          '"rating": {},'+\
                          '"review":{}}}\n').format(review.foundhelpful,
                                                review.notfoundhelpful,
                                                "recommended" if review.thumbs_up else "not recommended",
                                                review.text)
                
                output.write(json)
                if i > count:
                    break

        
def clean_review_text(review_text):
    if '</div>' in review_text:
        return review_text[review_text.rindex('</div>')+7:].strip()
    return review_text.strip()

if __name__=='__main__':

    gameid = int(input('>Gameid? '))
    count = int(input('>Reviews to fetch? '))

    start = time.time()

    dump_reviews_to_json(gameid, count)

