import pymysql



def get_top_queue_items():

    user = 'mbrad287'
    pass = 'Fra6Uchu'
    db = 'bookstore_mbrad287'

    select_query='SELECT * FROM Queue ORDER BY priority LIMIT 5'
    
    conn = pymysql.connect(user=user, password=password, db=db, charset='utf-8')

    with conn.cursor() as cur:
        cursor.execute(select_query)
        print list(cursor)

if __name__=='__main__':
    get_top_queue_items()
