#!/usr/bin/python

#######################################################
# Author:         Connor Marble
# Creation Date:  April 11, 2017
# Due Date:       April 13, 2017
# Course:         CSC355
# Professor:      Dr. Hussain
# Assignemnt:     #4
# Filename:       setup.py
# Purpose:        Running this files will deploy the
#                 proper files to the correct 
#                 directories
########################################################

import shutil
import * from config
import os

#Create Web Directory
shutil.copytree('../frontend', WEB_SERVE_ROOT)

#Create Data Analysis Dir
makedir(DATA_ANALYSIS_DIR)

#Move files into data analysis directory
shutil.copyfile('../analysisModulePrototype/AnalysisModulePrototype.py', DATA_ANALYSIS_DIR+'AnalysisModulePrototype.py')
shutil.copyfile('../stopwords.txt', DATA_ANALYSIS_DIR+'stopwords.txt')
shutil.copyfile('../webscraper/scraper.py',DATA_ANALYSIS_DIR+'scraper.py')
shutil.copyfile('../webscraper/readqueue.py',DATA_ANALYSIS_DIR+'readqueue.py')
shutil.copyfile('./config.py',DATA_ANALYSIS_DIR+'config.py')

def makedir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
