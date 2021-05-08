import math
import numpy as np
import pandas as pd
import sys
def xyz2rgb(xyz):
    R =  3.2404542*xyz[0] - 1.5371385*xyz[1] - 0.4985314*xyz[2]
    G = -0.9692660*xyz[0] + 1.8760108*xyz[1] + 0.0415560*xyz[2]
    B =  0.0556434*xyz[0] - 0.2040259*xyz[1] + 1.0572252*xyz[2]
    if R > 0.0031308 :
        R = 1.055 * ( math.pow(R, ( 1 / 2.4 )) ) - 0.055
    else:
        R = 12.92 * R
    if G > 0.0031308 :
        G = 1.055 * ( math.pow(G, ( 1 / 2.4 )) ) - 0.055
    else:
        G = 12.92 * G
    if B > 0.0031308:
        B = 1.055 * ( math.pow(B, ( 1 / 2.4 )) ) - 0.055
    else:
        B = 12.92 * B
    sR = R * 255
    sR = int(round(sR,0))
    sG = G * 255
    sG = int(round(sG,0))
    sB = B * 255
    sB = int(round(sB,0))
    return [sR, sG, sB]

def rgb2xyz(r,g,b):
    r=r/255
    g=g/255
    b=b/255
    if r <= 0.04045:
        r = r/12.92
    else:
        r = (r+0.055)/1.055
        r = math.pow(r,2.4)
    if g <= 0.04045:
        g = g/12.92
    else:
        g = (g+0.055)/1.055
        g = math.pow(g,2.4)
    if b <= 0.04045:
        b = b/12.92
    else:
        b = (b+0.055)/1.055
        b = math.pow(b,2.4)
    x =  0.4124564*r + 0.3575761*g + 0.1804375*b
    y =  0.2126729*r + 0.7151522*g + 0.0721750*b
    z =  0.0193339*r + 0.1191920*g + 0.9503041*b
    return [x, y, z]

def average(q1,q2):
    Sum = q1+q2
    avg = q1/Sum
    return avg*100

def rmse(y_csv,y_user):
    MSE = np.square(np.subtract(y_csv,y_user)).mean() 
    RMSE = math.sqrt(MSE)
    return RMSE

def unmix(arr):
    x = pd.read_csv('csv\\unmix\\xyz_output.csv',usecols=['x'])
    y = pd.read_csv('csv\\unmix\\xyz_output.csv',usecols=['y'])
    z = pd.read_csv('csv\\unmix\\xyz_output.csv',usecols=['z'])
    x = np.asarray(x, dtype=np.float32)
    y = np.asarray(y, dtype=np.float32)
    z = np.asarray(z, dtype=np.float32)
    max = sys.maxsize
    index = 0
    y_user = rgb2xyz(arr[0], arr[1], arr[2])
    for i in range(len(x)):
        y_csv = [x[i][0],y[i][0],z[i][0]]
        a = rmse(y_csv, y_user)
        if a < max:
            max = a
            index = i
    return index


    

    