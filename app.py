# BEGIN CODE HERE
from flask import Flask,request,jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from pymongo import TEXT
import numpy as np
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
# END CODE HERE

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://127.0.0.1:27017/pspi"
CORS(app)
mongo = PyMongo(app)
mongo.db.products.create_index([("name", TEXT)])


@app.route("/search", methods=["GET"])
def search():
    # BEGIN CODE HERE
    name = request.args.get("name")

    #αντικείμενο αναζήτησης για Mongpdb
    search_criteria = {"name" : {"$regex" : name, "$options" : "i"}}

    #εύρεση προιόντων και ταξινόμηση κατά φθίνουσα σειρά τιμής
    products = mongo.db.products.find(search_criteria).sort("price", -1)

    #διαμόρφωση αποτελεσμάτων σε json
    result = []
    for product in products:
        result.append({
            "id": str(product["_id"]),
            "name": product["name"],
            "production_year": product["production_year"],
            "price": product["price"],
            "color": product["color"],
            "size": product["size"]
            
        })

    
    return jsonify(result)
    # END CODE HERE


@app.route("/add-product", methods=["POST"])
def add_product():
    # BEGIN CODE HERE

    valid_colors = {1,2,3}
    valid_sizes = {1,2,3,4}

    data = request.get_json()

    #ελεγχοσ για απαιτουμενα πεδια
    required_fields = {'id', 'name', 'production_year', 'price', 'color', 'size'}
    if not required_fields.issubset(data.keys()):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Έλεγχος για έγκυρο χρώμα και μέγεθος
    if data['color'] not in valid_colors or data['size'] not in valid_sizes:
        return jsonify({"error": "Invalid color or size"}), 400
    
    #αναζητηση προιοντοσ με βαση το ονομα
    existing_product = mongo.db.products.find_one({"name": data['name']})
    
    if existing_product:
        #ενημερωση προιοντοσ
        mongo.db.products.update_one({"name": data['name']},
            {"$set": {
                "production_year": data['production_year'],
                "price": data['price'],
                "color": data['color'],
                "size": data['size']
            }}
        )
        return jsonify({"message": "Product updated successfully"}), 200
    else:
        #εισαγωγη νεου προιοντοσ
        mongo.db.products.insert_one(data)
        return jsonify({"message": "Product added successfully"}), 200
    


    # END CODE HERE


@app.route("/content-based-filtering", methods=["POST"])
def content_based_filtering():
    # BEGIN CODE HERE

    data = request.get_json()

    # Εξαγωγή όλων των προϊόντων από τη βάση δεδομένων
    products = list(mongo.db.products.find({}, {"_id": 0}))

    if not products:
        return jsonify([]), 200


    # Δημιουργία λίστας με τα χαρακτηριστικά των προϊόντων
    def create_feature_vector(product):
        return [
            product['production_year'],
            product['price'],
            product['color'],
            product['size']
        ]
    
    input_vector = create_feature_vector(data)
    product_vectors = [create_feature_vector(product) for product in products]

    def cosine_similarity(A, B):
       dot_product = np.dot(A, B)
       norm_A = np.linalg.norm(A)
       norm_B = np.linalg.norm(B)
       return dot_product / (norm_A * norm_B)

    # Υπολογισμός cosine similarity
    similarities = [cosine_similarity(input_vector, vector) for vector in product_vectors]

    # Εύρεση προϊόντων με ομοιότητα > 70%
    similar_products = [
        products[i]['name'] for i in range(len(similarities)) if similarities[i] > 0.7
    ]

    return jsonify(similar_products), 200
    

    # END CODE HERE


@app.route("/crawler", methods=["GET"])
def crawler():
    # BEGIN CODE HERE
    url = "https://qa.auth.gr/el/x/studyguide/600000438/current"
    options = Options()
    options.headless = True 
    driver = webdriver.Chrome(options=options)


    semester = request.args.get('semester')
    semester = int(semester)

    # Εκκίνηση του WebDriver
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Εκτέλεση σε headless mode
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        
        # Αναμονή για τη φόρτωση της σελίδας
        time.sleep(5)  # Δώστε χρόνο στη σελίδα να φορτώσει
        
        # Εύρεση και κλικ στο αντίστοιχο εξάμηνο
        semester_xpath = f'//h4[contains(text(), "Εξάμηνο {semester}")]'
        semester_element = driver.find_element(By.XPATH, semester_xpath)
        semester_element.click()
        
        # Αναμονή για τη φόρτωση των μαθημάτων
        time.sleep(3)  # Δώστε χρόνο στα μαθήματα να εμφανιστούν
        
        # Εξαγωγή των ονομάτων των μαθημάτων
        courses_xpath = f'//h4[contains(text(), "Εξάμηνο {semester}")]/following-sibling::ul/li/a'
        courses_elements = driver.find_elements(By.XPATH, courses_xpath)
        courses = [course.text for course in courses_elements]
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        driver.quit()
    
    return jsonify(courses), 200
        
        