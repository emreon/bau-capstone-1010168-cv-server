import cv2
import numpy as np
from matplotlib import pyplot as plt

filePath="test.jpg"
# reading image
img = cv2.imread(filePath)

img2=img.copy()

hsv = cv2.cvtColor(img2,cv2.COLOR_BGR2HSV)

#lower red
lower_red = np.array([0,50,60])
upper_red = np.array([10,255,255])


#upper red
lower_red2 = np.array([170,50,50])
upper_red2 = np.array([180,255,255])

mask = cv2.inRange(hsv, lower_red, upper_red)
res = cv2.bitwise_and(img2,img2, mask= mask)


mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
res2 = cv2.bitwise_and(img2,img2, mask= mask2)

# Blue color
low_blue = np.array([94, 80, 2])
high_blue = np.array([118, 255, 255])



blue_mask = cv2.inRange(hsv, low_blue, high_blue)
blue = cv2.bitwise_and(img, img, mask=blue_mask)



gray = cv2.cvtColor(blue,cv2.COLOR_BGR2GRAY)
    
_, thresholdB = cv2.threshold(gray, 95, 255, cv2.THRESH_BINARY) #95,255

i=0
# using a findContours() function
contoursB, _ = cv2.findContours(thresholdB, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
for contourB in contoursB:
        
    # here we are ignoring first counter because 
    # findcontour function detects whole image as shape
    if i == 0:
            i = 1
            continue
  
    # cv2.approxPloyDP() function to approximate the shape
    approxB = cv2.approxPolyDP(contourB, 0.1 * cv2.arcLength(contourB, True), True)
      
    # using drawContours() function

  
    # finding center point of shape
    MB = cv2.moments(contourB)

    
    if MB['m00'] != 0.0:
        x = int(MB['m10']/MB['m00'])
        y = int(MB['m01']/MB['m00'])
    x = 0
    y = 0
  
    # putting shape name at center of each shape
    if len(approxB) == 3:
        cv2.putText(img, 'triangle', (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20, 20, 100), 2)
        cv2.drawContours(img, [contourB], 0, (15, 15, 15), 2)
        print("Position of Blue Triangle:",x,y)
    elif len(approxB) == 4:
        cv2.putText(img, 'square', (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20, 20, 100), 2)
        cv2.drawContours(img, [contourB], 0, (15, 15, 15), 2)
        print("Position of Blue Square:",x,y)

img3 = res+res2
img4 = cv2.add(res,res2)
img5 = cv2.addWeighted(res,0.5,res2,0.5,0)


kernel = np.ones((15,15),np.float32)/225
smoothed = cv2.filter2D(res,-1,kernel)
smoothed2 = cv2.filter2D(img3,-1,kernel)



# converting image into grayscale image
gray = cv2.cvtColor(img5, cv2.COLOR_BGR2GRAY)
  
# setting threshold of gray image
_, threshold = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY_INV) #127,255
  
# using a findContours() function
contours, _ = cv2.findContours(
    threshold, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
  
i = 0
  
# list for storing names of shapes
for contour in contours:
  
    # here we are ignoring first counter because 
    # findcontour function detects whole image as shape
    if i == 0:
        i = 1
        continue
  
    # cv2.approxPloyDP() function to approximate the shape
    approx = cv2.approxPolyDP(
        contour, 0.01 * cv2.arcLength(contour, True), True)
      
    # using drawContours() function
    


    # finding center point of shape
    M = cv2.moments(contour)
    if M['m00'] != 0.0:
        x = int(M['m10']/M['m00'])
        y = int(M['m01']/M['m00'])
    
    
    # putting shape name at center of each shape
    if len(approx) == 3:
        cv2.putText(img, 'triangle', (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20, 20, 100), 2)
        print("Position of the Red Triangle:",x,y)
        cv2.drawContours(img, [contour], 0, (15, 15,15), 2)
    elif len(approx) == 4:
        cv2.putText(img, 'square', (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20, 20, 100), 2)
        print("Position of Red Square:",x,y)
        cv2.drawContours(img, [contour], 0, (15, 15,15), 2)

# displaying the image after drawing contours
# cv2.imshow('original', img)
# cv2.imshow('thresholdRed', threshold)
# cv2.imshow('thresholdBlue', thresholdB)
# cv2.imshow('res5',img5)
# cv2.imshow("Blue", blue)
  
# cv2.waitKey(0)
# cv2.destroyAllWindows()