
import math
import numpy as np
import pandas as pd
I = pd.read_csv('I.csv',usecols=['i'])
x_bar = pd.read_csv('bars.csv',usecols=['xbar'])
y_bar = pd.read_csv('bars.csv',usecols=['ybar'])
z_bar = pd.read_csv('bars.csv',usecols=['zbar'])
I = np.asarray(I, dtype=np.float32)
x_bar = np.asarray(x_bar, dtype=np.float32)
y_bar = np.asarray(y_bar, dtype=np.float32)
z_bar = np.asarray(z_bar, dtype=np.float32)

d_lambda=array=np.ones(41)*10
d_lambda = d_lambda.reshape(41,1)
mul=np.multiply(I,d_lambda)
N = np.multiply(y_bar, mul)
N = np.sum(N)
# S_ is the input
def getxyz(mul_,x_bar_,y_bar_,z_bar_,N_,S_):
    #for X
    S_=S_.reshape(41,1)
    mul_X = np.multiply(x_bar_,mul_)
    X = np.multiply(mul_X,S_)
    X = np.sum(X)
    X = X/N_

    #for Y
    mul_Y = np.multiply(y_bar_,mul_)
    Y = np.multiply(mul_Y,S_)
    Y = np.sum(Y)
    Y = Y/N_

    #for Z
    mul_Z = np.multiply(z_bar_,mul_)
    Z = np.multiply(mul_Z,S_)
    Z = np.sum(Z)
    Z = Z/N_
    
    sum_XYZ = X+Y+Z
    x = X/sum_XYZ
    y = Y/sum_XYZ
    z = Z/sum_XYZ
#     print('XYZ:',X,Y,Z)
    return x,y,z
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
