Sentiment Analysis Build Info
=============================

First, obtain a copy of the project source from :

https://github.com/Connor-Marble/Greatest-Senior-Project-Of-All-Time.git

The requirements for the project are 
-Web server (System tested on Apache, but any modern webserver should work)
-Python3
-Python Packages (defined in requirements.txt)
SQL Database (Project tested on mysql)

To deploy the project after installing the requirements:
   -Check the values in config.py to test what needs to be changed.
   -run setup.py
   -Setup database by running the CreateDB.sql script in your chosen DBMS
   -update database login information in readqueue.py, AnalysisModulePrototype.py,
   	   and connect.php
   -In order to have the data be updated, the script readqueue.py must be run.
       It is recommended to run this script periodically via Cron, or another job
       scheduling service
