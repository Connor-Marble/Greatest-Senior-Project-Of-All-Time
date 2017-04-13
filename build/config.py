#######################################################
# Author:         Connor Marble
# Creation Date:  April 11, 2017
# Due Date:       April 13, 2017
# Course:         CSC355
# Professor:      Dr. Hussain
# Assignemnt:     #4
# Filename:       config.py
# Purpose:        contains configuration info for project 
#                 build
########################################################

#Directory that the scripts for scraping and
#analyzing data will be placed in
DATA_ANALYSIS_DIR='~/DataAnalysis/'

#Directory the web files will
#be served from, web server
#installation is up to the end user
WEB_SERVE_ROOT='/www/'

#Number of titles to be scraped
#each time the data analysis script is
#run. 
MAX_GAMES_PER_BATCH=5

#It is recommended to use cron
#or another job scheduler to automatically
#run the {DATA_ANALYSIS_DIR}/run.py script
#at regular intervals depending on specific
#system load


