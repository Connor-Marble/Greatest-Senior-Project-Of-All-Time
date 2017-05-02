import os
import json
import re
import math
from nltk.stem import WordNetLemmatizer
import pymysql

# Reads json file and constructs a sentiment dictionary that records the number
# of positive and negative reviews that contain a particular word. The structure
# of the dictionary is sent_dict[word] = [num_pos_reviews, num_neg_reviews]. We
# normalize all words to lowercase and naively lemmatize using WordNet. We also
# filter out stop words.
def buildSentDict(file_name, stop_words):
    sent_dict = {}
    thumbs_up = 0
    thumbs_down = 0
    sen_1_score = 0
    sen_2_score = 0
    sentence1 = ''
    sentence2 = ''
    with open(file_name, encoding='utf8') as datafile:
        metadata = datafile.readline()
        metadata = json.loads(metadata)
        genres = metadata['genres']
        game_name = metadata['title']
        print("Genres: " + str(genres) + '\n')
        for line in datafile:
            try:
                data = json.loads(line)
            except json.decoder.JSONDecodeError:
                print('JSONDecodeError')
                continue
            # Update thumbs up/down
            recommended = (data['rating'] == 'recommended')
            if recommended:
                thumbs_up += 1
            else:
                thumbs_down += 1
            
            #Strip HTML tags
            review = re.sub('</?\w+((\s+\w+(\s*=\s*(?:".*?"|\'.*?\'|[\^\'">\s]+))?)+\s*|\s*)/?>', '', data['review'])
            review = re.sub('&lt|&rt|br>|&quot', '', review)
            review = review.strip()
            
            # If review is helpful, grab sentence.
            if data['num_found_helpful']:
                helpfulness = float(data['num_found_helpful']) * float(data['num_found_helpful']) \
                              / float(data['num_found_unhelpful'] + data['num_found_helpful'])
            else:
                helpfulness = 0
            
            if helpfulness > sen_2_score and helpfulness <= sen_1_score:
                sen_2_score = helpfulness
                sentence2 = re.split('\.|!|\?', review)[0]
            if helpfulness > sen_1_score:
                sen_2_score = sen_1_score
                sentence2 = sentence1
                sen_1_score = helpfulness
                sentence1 = re.split('\.|!|\?', review)[0]
                
            # Instantiate the lemmatizer
            L = WordNetLemmatizer()
            lemma = L.lemmatize
            #Clear out bad unicode
            #review = review.encode('ascii', 'ignore')
            #review = review.encode('utf-8')
            # Convert text to bag of words, normalized to lowercase and lemmatized
            bag_of_words = { lemma(word.lower()) for word in re.findall('\w+\'?\w{1,2}', review)
                             if (word.lower() not in stop_words) and len(word) < 30}

            # Update sent dict
            for word in bag_of_words:
                if word not in sent_dict:
                    sent_dict[word] = [0,0]
                if recommended:
                    sent_dict[word][0] += 1
                else:
                    sent_dict[word][1] += 1

            # Build game data dictionary
            game_data = {'id': file_name.split('/')[-1].split('.')[0],
                         'name': game_name,
                         'num_recommend': thumbs_up,
                         'num_not_recommend': thumbs_down,
                         'sentence_1': sentence1,
                         'sentence_2': sentence2,
                         'sen_1_score': sen_1_score,
                         'sen_2_score': sen_2_score,
                         'genres': genres
                         }

    return sent_dict, game_data

# Returns a dictionary of pointwise mutual information between word and ratings.
# Dictionary has the structure dict[word] = [pos_info, neg_info]
def mutualInfo(sent_dict, thumbs_up, thumbs_down):
    info = {}
    prob_pos = thumbs_up / (thumbs_up + thumbs_down)
    prob_neg = thumbs_down / (thumbs_up + thumbs_down)
    for word in sent_dict:
        pos_info = 0 # Technically incorrect!
        neg_info = 0 # Technically incorrect!
        pos_occur = sent_dict[word][0]
        neg_occur = sent_dict[word][1]
        total_occur = pos_occur + neg_occur
        if pos_occur > 0:
            pos_info = math.log((pos_occur / total_occur) / prob_pos, 2)
        if neg_occur > 0:
            neg_info = math.log((neg_occur / total_occur) / prob_neg, 2)
        info[word] = [pos_info * pos_occur, neg_info * neg_occur]
    return info


#Stores game data to the database
def storeToDB(game_data):
    game_id = int(game_data['id'])
    num_recommend = int(game_data['num_recommend'])
    num_not_recommend = int(game_data['num_not_recommend'])
    info = game_data['sent_info']
    genres = game_data['genres']
    
    user = 'mbrad287'
    password = 'Fra6Uchu'
    db = 'bookstore_mbrad287'

    connection = pymysql.connect(user=user, password=password, db=db, charset='utf8')
    
    with connection.cursor() as cursor:
        #Don't do anything if we've done this game before ayyyyy lmao XD
        query = "SELECT * FROM `Recommendation` WHERE `game_id` = %s"   
        if not cursor.execute(query, (game_id)):  
            #Update Recommended
            query = "INSERT INTO `Recommendation` (`game_id`, `pos`, `neg`, `time_stamp`) VALUES (%s, %s, %s, 1)"
            cursor.execute(query, (game_id, num_recommend, num_not_recommend))
            connection.commit()

        query = "SELECT * FROM `Quotes` WHERE `game_id` = %s"
        if not cursor.execute(query, (game_id)):
            #Update Quotes
            query = "INSERT INTO `Quotes` (`game_id`, `sentence`, `score`) VALUES (%s, %s, %s)"
            cursor.execute(query, (game_id, game_data['sentence_1'], game_data['sen_1_score']))
            connection.commit()
            cursor.execute(query, (game_id, game_data['sentence_2'], game_data['sen_2_score']))
            connection.commit()

        #Update Word and GameWord
        for word in info:
            if not word.isalnum():
                continue
            #Check if word is in DB already
            query = "SELECT `id` FROM `Word` WHERE `word` = %s"
            if cursor.execute(query, (word)):
                word_id = cursor.fetchone()
                if word_id == None:
                    print('Word exists, word_id is NULL')
            else:
                query = "INSERT INTO `Word` (`word`) VALUES (%s)"
                cursor.execute(query, (word))
                connection.commit()
                word_id = cursor.lastrowid
                if word_id == None:
                    print('!!!!!!!!!!! word_id is None for ' + word + ' !!!!!!!!!!!!')
            #Update GameWord
            query = "SELECT * FROM `GameWord` WHERE `game_id` = %s AND `word_id` = %s"
            if not cursor.execute(query, (game_id, word_id)):
                query = "INSERT INTO `GameWord` (`game_id`, `word_id`, `pos_score`, `neg_score`) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (game_id, word_id, info[word][0], info[word][1]))
                connection.commit()
                          
        for genre in genres:
            query = "SELECT `id` FROM `Genre` WHERE `name` = %s"
            if not cursor.execute(query, (genre)):
                query = "INSERT INTO `Genre` (`name`) VALUES (%s)"
                cursor.execute(query, (genre))
                connection.commit()
                genre_id = cursor.lastrowid
            else:
                genre_id = cursor.fetchone()
                
            query = "SELECT * FROM `GameGenre` WHERE `genre_id` = %s AND `game_id` = %s"
            if not cursor.execute(query, (genre_id, game_id)):
                query = "INSERT INTO `GameGenre` (`game_id`, `genre_id`) VALUES (%s, %s)"
                cursor.execute(query, (game_id, genre_id))
                connection.commit()

    connection.close()

def run_analysis():
    stop_file_name = 'stopwords.txt'
    games = []
    
    # Load stop words.
    stop_words = set()
    with open(stop_file_name) as file:
        for line in file:
            stop_words.add(line.strip())

    directory = './reviews'
    for filename in os.listdir(directory):
        if filename.endswith('.jsonlines') or filename.endswith('.json'):
            data_file_name = directory + '/' + filename
                
            try:
                sent_dict, game_data = buildSentDict(data_file_name, stop_words)
                info = mutualInfo(sent_dict, game_data['num_recommend'], game_data['num_not_recommend'])

                game_data['sent_info'] = info
            
                games.append(game_data)

                storeToDB(game_data)

            except Exception as e:
                print(e)
                print(data_file_name + '\n')


if __name__ == '__main__':
    run_analysis()
