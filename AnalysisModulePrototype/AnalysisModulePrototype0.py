import os
import json
import re
import math
from nltk.stem import WordNetLemmatizer

# Reads json file and constructs a sentiment dictionary that records the number
# of positive and negative reviews that contain a particular word. The structure
# of the dictionary is sent_dict[word] = [num_pos_reviews, num_neg_reviews]. We
# normalize all words to lowercase and naively lemmatize using WordNet. We also
# filter out stop words.
def buildSentDict(file_name, stop_words):
    sent_dict = {}
    thumbs_up = 0
    thumbs_down = 0
    sen_1_score = 1
    sen_2_score = 1
    sentence1 = ''
    sentence2 = ''
    with open(file_name) as datafile:
        for line in datafile:
            data = json.loads(line)
            # Update thumbs up/down
            recommended = (data['rating'] == 'Recommended')
            if recommended:
                thumbs_up += 1
            else:
                thumbs_down += 1

            # If review is helpful, grab sentence.
            if data['found_helpful_percentage'] and data['num_voted_helpfulness']:
                helpfulness = float(data['found_helpful_percentage']) * float(data['num_voted_helpfulness'])
            else:
                helpfulness = 0
            if helpfulness > sen_2_score and helpfulness <= sen_1_score:
                sen_2_score = helpfulness
                sentence2 = re.split('\.|!|\?', data['review'])[0]
            if helpfulness > sen_1_score:
                sen_2_score = sen_1_score
                sentence2 = sentence1
                sen_1_score = helpfulness
                sentence1 = re.split('\.|!|\?', data['review'])[0]
                
            # Instantiate the lemmatizer
            L = WordNetLemmatizer()
            lemma = L.lemmatize
            # Convert text to bag of words, normalized to lowercase and lemmatized
            bag_of_words = { lemma(word.lower()) for word in re.findall('\w+\'?\w{1,2}', data['review'])
                             if word.lower() not in stop_words}

            # Update sent dict
            for word in bag_of_words:
                if word not in sent_dict:
                    sent_dict[word] = [0,0]
                if recommended:
                    sent_dict[word][0] += 1
                else:
                    sent_dict[word][1] += 1

            # Build game data dictionary
            game_data = {'name': game_name,
                         'num_recommend': thumbs_up,
                         'num_not_recommend': thumbs_down,
                         'sentence_1': sentence1,
                         'sentence_2': sentence2,
                         'sen_1_score': sen_1_score,
                         'sen_2_score': sen_2_score
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


if __name__ == '__main__':
    stop_file_name = 'stopwords.txt'
    games = []
    
    # Load stop words.
    stop_words = set()
    with open(stop_file_name) as file:
        for line in file:
            stop_words.add(line.strip())

    directory = input('Data directory: ')
    for filename in os.listdir(directory):
        if filename.endswith('.jsonlines'):
            data_file_name = directory + '/' + filename
            game_name = re.sub('_', ' ', filename[:-10])
                
            sent_dict, game_data = buildSentDict(data_file_name, stop_words)
            info = mutualInfo(sent_dict, game_data['num_recommend'], game_data['num_not_recommend'])

            positive_list = sorted([[word, info[word][0]] for word in info], key=lambda x: -1*x[1])
            negative_list = sorted([[word, info[word][1]] for word in info], key=lambda x: -1*x[1])

            game_data['top_pos_words'] = positive_list[:10]
            game_data['top_neg_words'] = negative_list[:10]
            
            games.append(game_data)

            print('Top ten positive words: ')
            for i in range(10):
                print(str(positive_list[i]) + ' ')
            print('\nTop ten negative words: ')
            for i in range(10):
                print(str(negative_list[i]) + ' ')
            print(game_data["sentence_1"])
            print(game_data["sentence_2"])

    
    with open(input('Outfile: '), 'w') as outfile:
         json.dump(games, outfile)
