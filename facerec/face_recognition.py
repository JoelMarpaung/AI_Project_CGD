import os
try:
    os.chdir(os.path.join(os.getcwd(), 'facerec'))
    print(os.getcwd())
except:
    pass

import os
import cv2
import numpy as np
import facialRecognition as fr
import threading
import sqlite3
import pymongo
import datetime

#connect database
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["aiproject"]
mycol = mydb["logs"]

face_recog = cv2.face.LBPHFaceRecognizer_create()
face_recog.read('hasil_training.yml')

person_name = {0: "Unknown", 1: "Irene Panjaitan",
            2: "Ester Marbun", 3: "Joel Marpaung"}

cam = cv2.VideoCapture(0)
old_occupant = ""
while True:
    retBool, test_img = cam.read()
#     test_img = cv2.flip(test_img, -1)
    faces_detected, gray_img = fr.faceDetection(test_img)
    
    for (x, y, w, h) in faces_detected:
        cv2.rectangle(test_img, (x, y), (x+w, y+h), (255, 0, 0), thickness=7)

    resized_img = cv2.resize(test_img, (1000, 700))
    cv2.imshow("Face Recognition", resized_img)
    cv2.waitKey(10)
    x = datetime.datetime.now()
    time_now = (str(x.day) + "/" + str(x.month) + "/" + str(x.year) + " " + str(x.hour) + ":" + str(x.minute) + ":" + str(x.second))
    print(time_now)
    for face in faces_detected:
        (x, y, w, h) = face
        img_gray = gray_img[y:y+h, x:x+h]
        label, confidence = face_recog.predict(img_gray)
        username = person_name[label]

        if (confidence < 100 and confidence >= 0):
            accuracy = " {0}%".format(round(100-confidence))
            print("Confidence:", confidence)
            print("Accuracy:", accuracy)
            print("ID:", label)
            print("Name: ", username)

        else:
            accuracy = "100%"
            label = 0
            print("ID:", label)
            print("Name:", username)
        
        if(username!=old_occupant):
            print(old_occupant)
            print(username)
            old_occupant = username
            print(old_occupant)
            mydict = {"id_occupant" : label, "name" : username, "license_plate" : "unknown", "status" : "in", "date" : time_now, "accuracy": accuracy}
            mycol.insert_one(mydict)

        fr.make_rectangle(test_img, face)
        fr.show_name(test_img, username, x, y)
        cv2.putText(test_img, str(accuracy), (x+5, y+h-5),
                    cv2.FONT_ITALIC, 1, (255, 255, 255), 3)
        cv2.imshow('Result', test_img)

    # resized_img = cv2.resize(test_img, (1000, 700))
    # cv2.imshow("Face Recognition", resized_img)

    if cv2.waitKey(10) == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
