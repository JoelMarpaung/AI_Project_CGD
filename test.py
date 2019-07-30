import pymongo
import datetime
#connect database
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["aiproject"]
mycol = mydb["logs"]
x = datetime.datetime.now()
time_now = (str(x.day) + "/" + str(x.month) + "/" + str(x.year) + " " + str(x.hour) + ":" + str(x.minute) + ":" + str(x.second))
mydict = {"id_occupant" : "test", "name" : "username", "license_plate" : "unknown", "status" : "in", "date" : time_now}
mycol.insert_one(mydict)