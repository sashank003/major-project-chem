from flask import Flask, request, render_template, redirect, url_for

app = Flask(__name__) 

@app.route('/', methods =['GET', 'POST'])
def index():
	range1 = 0
	range2 = 0
	range3 = 0
	range4 = 0
	range5 = 0
	range6 = 0
	range7 = 0
	range8 = 0
	range9 = 0
	hidden1 = 0
	hidden2 = 0
	if 'submit_right' in request.form:
		range7 = request.form['range7']
		range8 = request.form['range8']
		range9 = request.form['range9']
		res_u = unmix([int(range7),int(range8),int(range9)])
		r1 = xyz2rgb([x1[res_u][0], y1[res_u][0], z1[res_u][0]])
		r2 = xyz2rgb([x2[res_u][0], y2[res_u][0], z2[res_u][0]])
		range1 = r1[0]
		range2 = r1[1]
		range3 = r1[2]
		range4 = r2[0]
		range5 = r2[1]
		range6 = r2[2]
		hidden1 = int(round(average(q1[res_u][0],q2[res_u][0]),0))
		hidden2 = int(round(average(q2[res_u][0],q1[res_u][0]),0))
	else:
		pass
	return render_template('index.html', c_r1=range1, c_g1=range2, c_b1=range3, c_r2=range4, c_g2=range5, c_b2=range6, c_r3=range7, c_g3=range8, c_b3=range9, h1=hidden1, h2=hidden2, f1=f'{hidden1}%', f2=f'{hidden2}%')

if __name__=='__main__':
	import numpy as np
	import pandas as pd
	from config import *
	q1 = pd.read_csv('csv\\unmix\\R1_quant.csv',usecols=['quantity'])
	q2 = pd.read_csv('csv\\unmix\\R2_quant.csv',usecols=['quantity'])
	x1 = pd.read_csv('csv\\unmix\\R1_XYZ.csv',usecols=['x'])
	y1 = pd.read_csv('csv\\unmix\\R1_XYZ.csv',usecols=['y'])
	z1 = pd.read_csv('csv\\unmix\\R1_XYZ.csv',usecols=['z'])
	x2 = pd.read_csv('csv\\unmix\\R2_XYZ.csv',usecols=['x'])
	y2 = pd.read_csv('csv\\unmix\\R2_XYZ.csv',usecols=['y'])
	z2 = pd.read_csv('csv\\unmix\\R2_XYZ.csv',usecols=['z'])
	q1 = np.asarray(q1, dtype=np.float32)
	q2 = np.asarray(q2, dtype=np.float32)
	x1 = np.asarray(x1, dtype=np.float32)
	y1 = np.asarray(y1, dtype=np.float32)
	z1 = np.asarray(z1, dtype=np.float32)
	x2 = np.asarray(x2, dtype=np.float32)
	y2 = np.asarray(y2, dtype=np.float32)
	z2 = np.asarray(z2, dtype=np.float32)
	app.run()
