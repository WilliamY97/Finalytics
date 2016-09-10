import os
import logging
from flask.ext.mysql import MySQL
from flask import Flask, render_template, json, request
from flask import session, redirect
from werkzeug import generate_password_hash, check_password_hash

app = Flask(__name__)

template_dir = os.path.join(os.path.dirname(__file__), 'templates')

app.secret_key = 'why would I tell you my secret key?'

mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = ''#'superflyinghippocow'
app.config['MYSQL_DATABASE_DB'] = 'finalytics'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

class User(object):
    email = ""
    first_name = ""
    last_name = ""

    def __init__(self,email,first_name,last_name):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name

    def get_email(self):
        """Return the email address"""
        return self.email

    def get_first_name(self):
        """Return the first name"""
        return self.first_name

    def get_last_name(self):
        """Return the last name"""
        return self.last_name       

def addUser(firstname,lastname,email,password):
    # assert False
    conn = mysql.connect()
    cursor = conn.cursor()

    _hashed_password = generate_password_hash(password)
    cursor.callproc('sp_createUser',(firstname,lastname,email,_hashed_password))

    data = cursor.fetchall()
 
    if len(data) is 0:
        conn.commit()
        return jsonify({'message':'User created successfully !'})
    else:
        return jsonify({'error':str(data[0])})

def signInUser(logInEmail,logInPassword):
    
    conn = mysql.connect()
    cursor = conn.cursor()
    s = cursor.User.query.filter_by(logInEmail = email).first()
    if check_password_hash(s.password,logInPassword):
        return jsonify({'html':'<span>Log In Successful!</span>'})
    else:
        return jsonify({'html':'<span>Log In Failed...</span>'})

@app.route('/')
def home():
    if session.get('user'):
        return redirect('/userHome')
    else:
        return render_template('%s.html' % 'index')   

@app.route('/dashboard')
def dashboard():
    if session.get('user'):

        try: 
            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('sp_getPortfolio',(session['user'],))
            result = cursor.fetchall()

            # logging.info('length of sp_getPortfolio result is ' + len(result))
            
            portfolios = []
            for portfolio in result:
                portfolio_list = {
                        'name': portfolio[0],
                        'symbol': portfolio[1],
                        'cap': portfolio[2]}
                portfolios.append(portfolio_list)  

            return render_template('%s.html' % 'dashboard/production/index2', portfolios = portfolios)
        except Exception as e:
            return render_template('error.html',error = str(e))
        finally:
            cursor.close()
            conn.close()


    else:
        return redirect('/login')

@app.route('/stocklookup')
def stockLookUp():
    if session.get('user'):
        return render_template('%s.html' % 'dashboard/production/stockLookup')
    else:
        return render_template('error.html',error = 'Unauthorized Access')        

@app.route('/about')
def about():
    return render_template('%s.html' % 'about')

@app.route('/viewSignUp')
def viewSignUp():
    return render_template('%s.html' % 'signup')  

@app.route('/signUp', methods=['GET','POST'])
def signUp():
    _firstname = request.form['firstname']
    _lastname = request.form['lastname']
    _email = request.form['email']
    _password = request.form['password']
    _confirmpassword = request.form['password_confirm']
    if _password != _confirmpassword:
        return jsonify({'html':'<span>Password Confirmation Does Not Match!!</span>'})
    elif _firstname and _lastname and _email and _password:
        addUser(_firstname,_lastname, _email, _password)
        return jsonify({'html':'<span>All fields good !!</span>'})
    else:
        return jsonify({'html':'<span>Enter the required fields</span>'})

@app.route('/login')
def login():
    return render_template('%s.html' % 'login') 

@app.route('/userHome')
def userHome():
    if session.get('user'):
        logging.info(userinfo.get_first_name())
        return render_template('userHome.html', data= userinfo.get_first_name())
    else:
        return render_template('error.html',error = 'Unauthorized Access')

@app.route('/validateLogin',methods=['POST'])
def validateLogin():
    try:
        _username = request.form['inputEmail']
        _password = request.form['inputPassword']
 
        # connect to mysql
 
        con = mysql.connect()
        cursor = con.cursor()
        cursor.callproc('sp_validateLogin',(_username,))
        data = cursor.fetchall()

        if len(data) > 0:
            if check_password_hash(str(data[0][4]),_password):
                global userinfo
                userinfo = User(data[0][3], data[0][1], data[0][2])
                logging.info(userinfo.get_first_name())
                session['user'] = data[0][0]
                return redirect('/userHome')
            else:
                return render_template('error.html',error = 'Wrong Email address or Password.')
        else:
            return render_template('error.html',error = 'Wrong Email address or Password.')
 
    except Exception as e:
        return render_template('error.html',error = str(e))

    cursor.close()
    con.close()

@app.route('/logout')
def logout():
    session.pop('user',None)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
