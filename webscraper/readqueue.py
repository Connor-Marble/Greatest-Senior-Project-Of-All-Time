import pymysql
import scraper
import logging as log
import AnalysisModulePrototype as analmod

user = 'mbrad287'
passw = 'Fra6Uchu'
db = 'bookstore_mbrad287'

def get_top_queue_items():

    select_query='SELECT * FROM Queue ORDER BY priority LIMIT 1'
    
    conn = pymysql.connect(user=user, password=passw, db=db, charset='utf8')

    ids=[]

    with conn.cursor() as cur:
        cur.execute(select_query)
        ids = [row[0] for row in cur]

    return ids

def scrape_em(games):
    for game_id in games:
        log.info('Scraping {}...'.format(game_id))
        scraper.dump_reviews_to_json(game_id, 1000)

def mark_done(games):
    delete_query='delete from Queue WHERE game_id={}'
    
    conn = pymysql.connect(user=user, password=passw, db=db, charset='utf8')

    for game in games:
        with conn.cursor() as cur:
            cur.execute(delete_query.format(game))
    
    conn.commit()


if __name__=='__main__':
    log.basicConfig(level=0)
    games = get_top_queue_items()
    scrape_em(games)
    analmod.run_analysis()
    mark_done(games)
    
    
