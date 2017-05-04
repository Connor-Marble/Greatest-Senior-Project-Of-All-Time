import pymysql

user = 'mbrad287'
password = 'Fra6Uchu'
db = 'bookstore_mbrad287'

stopwords_file = 'stopwords.txt'

def getStopwords():
    stopwords = set()
    with open(stopwords_file) as file:
        for line in file:
            stopwords.add(line)
    return stopwords

def main():
    stopwords = getStopwords()
    connection = pymysql.connect(user=user, password=password, db=db, charset='utf8')
    with connection.cursor() as cursor:
        for word in stopwords:
            query = "SELECT `id` FROM `Word` WHERE `word` = %s"
            cursor.execute(query, (word))
            word_id = cursor.fetchone()
            if not word_id:
                continue
            word_id = word_id[0]
            query = "DELETE FROM `GameWord` WHERE `word_id` = %s"
            cursor.execute(query, (word_id))
            connection.commit()
            query = "DELETE FROM `Word` WHERE `id` = %s"
            cursor.execute(query, (word_id))
            connection.commit()
            
            
if __name__ == "__main__":
    main()