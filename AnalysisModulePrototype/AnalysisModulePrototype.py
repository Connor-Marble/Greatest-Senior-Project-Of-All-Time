import json
import re
import math

# Reads json file and constructs a sentiment dictionary that records the number
# of positive and negative reviews that contain a particular word. The structure
# of the dictionary is sent_dict[word] = [num_pos_reviews, num_neg_reviews]. We
# normalize all words to lowercase, but we don't lemmatize or consider morphology
# in any way. We do filter out stop words.
def buildSentDict(file_name, stop_words):
    sent_dict = {}
    thumbs_up = 0
    thumbs_down = 0
    with open(file_name) as datafile:
        for line in datafile:
            data = json.loads(line)
            # Update thumbs up/down
            recommended = (data['rating'] == 'Recommended')
            if recommended:
                thumbs_up += 1
            else:
                thumbs_down += 1

            # Convert text to bag of words, normalized to lowercase
            bag_of_words = { word.lower() for word in re.findall('\w+\'?\w{1,2}', data['review'])
                             if word.lower() not in stop_words}

            # Update sent dict
            for word in bag_of_words:
                if word not in sent_dict:
                    sent_dict[word] = [0,0]
                if recommended:
                    sent_dict[word][0] += 1
                else:
                    sent_dict[word][1] += 1

    return sent_dict, thumbs_up, thumbs_down

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
    data_file_name = input('Data file directory: ')
    stop_file_name = 'stopwords.txt'

    # Load stop words.
    stop_words = set()
    with open(stop_file_name) as file:
        for line in file:
            stop_words.add(line.strip())
        
    sent_dict, thumbs_up, thumbs_down = buildSentDict(data_file_name, stop_words)
    info = mutualInfo(sent_dict, thumbs_up, thumbs_down)

    positive_list = sorted([(word, info[word][0]) for word in info], key=lambda x: -1*x[1])
    negative_list = sorted([(word, info[word][1]) for word in info], key=lambda x: -1*x[1])

    print('Top ten positive words: ')
    for i in range(10):
        print(str(positive_list[i]) + ' ')
    print('\nTop ten negative words: ')
    for i in range(10):
        print(str(negative_list[i]) + ' ')
