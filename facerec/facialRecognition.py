# %% Change working directory from the workspace root to the ipynb file location. Turn this addition off with the DataScience.changeDirOnImportExport setting
# ms-python.python added
import os
try:
    os.chdir(os.path.join(os.getcwd(), 'facerec'))
    print(os.getcwd())
except:
    pass

# %%
import cv2
import os
import numpy as np


# %%
def faceDetection(test_img):
    gray_img = cv2.cvtColor(test_img, cv2.COLOR_BGR2GRAY)
    face_haar_cascade = cv2.CascadeClassifier(
        'haarcascade_frontalface_default.xml')
    faces = face_haar_cascade.detectMultiScale(
        gray_img, scaleFactor=1.3, minNeighbors=5)

    return faces, gray_img


def imageLabelling(directory):
    faces = []
    faceID = []

    for path, subdirnames, filenames in os.walk(directory):
        for filename in filenames:
            if filename.startswith("."):
                print("Unknown person")
                continue

            id = os.path.basename(path)
            img_path = os.path.join(path, filename)
            print("img_path : ", img_path)
            print("id : ", id)
            test_img = cv2.imread(img_path)

            if test_img is None:
                print("Image not loaded properly")
                continue

            faces_rect, gray_img = faceDetection(test_img)
            if len(faces_rect) != 1:
                continue

            (x, y, w, h) = faces_rect[0]
            img_gray = gray_img[y:y+w, x:x+h]
            faces.append(img_gray)
            faceID.append(int(id))

    return faces, faceID


def train_model(faces, faceID):
    face_recog = cv2.face.LBPHFaceRecognizer_create()
    face_recog.train(faces, np.array(faceID))
    return face_recog


def make_rectangle(test_img, face):
    (x, y, w, h) = face
    cv2.rectangle(test_img, (x, y), (x+w, y+h), (255, 0, 0), thickness=5)


def show_name(test_img, text, x, y):
    cv2.putText(test_img, text, (x, y), cv2.FONT_ITALIC, 1, (255, 255, 255), 1)


# %%
