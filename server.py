"""
The Ivory Table - Production Backend Server
Flask RESTful API & Static Web Server for Restaurant & Owner Admin Portal
"""

import os
import sys

# Ensure script directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import json
import random
import string
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, make_response
import database

# Initialize Flask app
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

app = Flask(__name__, static_folder=PUBLIC_DIR, static_url_path="")
app.config['JSON_SORT_KEYS'] = False
app.config['SECRET_KEY'] = 'ivory-table-secret-key-marine-drive-2026'

# Ensure database is ready
database.init_db()

# --- CORS & Security Headers ---
@app.after_request
def apply_cors_and_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = make_response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

# --- Helper functions ---
def generate_code(prefix, length=5):
    chars = string.ascii_uppercase + string.digits
    rand = ''.join(random.choices(chars, k=length))
    return f"{prefix}-{rand}"

def row_to_dict(row):
    return dict(row) if row else None

def rows_to_list(rows):
    return [dict(r) for r in rows]

# ==========================================
# PUBLIC STATIC ROUTES (Frontend & Owner)
# ==========================================

@app.route('/')
def serve_index():
    return send_from_directory(PUBLIC_DIR, 'index.html')

@app.route('/admin')
@app.route('/owner')
def serve_admin():
    return send_from_directory(PUBLIC_DIR, 'admin.html')

@app.route('/<path:filename>')
def serve_static(filename):
    file_path = os.path.join(PUBLIC_DIR, filename)
    if os.path.isfile(file_path):
        return send_from_directory(PUBLIC_DIR, filename)
    return send_from_directory(PUBLIC_DIR, 'index.html')

# ==========================================
# CUSTOMER FACING REST APIs
# ==========================================

@app.route('/api/restaurant-info', methods=['GET'])
def get_restaurant_info():
    """Return core restaurant metadata"""
    return jsonify({
        "success": True,
        "data": {
            "name": "The Ivory Table",
            "tagline": "Where every bite tells a story",
            "subtitle": "Seaside Culinary Artistry & Coastal Mediterranean-Indian Fusion",
            "location": "Seaside Marine Drive, Mumbai - 400020, Maharashtra, India",
            "phone": "9856321456",
            "email": "20tc1va145@mitsgwl.ac.in",
            "opening_hours": "Mon - Sun: 11:00 AM - 11:30 PM",
            "service_slots": {
                "lunch": "11:00 AM - 4:00 PM",
                "sundowner": "4:00 PM - 7:00 PM",
                "dinner": "7:00 PM - 11:30 PM"
            },
            "seating_areas": [
                "Seaside Terrace (Panoramic Arabian Sea View)",
                "Indoor Fine Dining Glasshouse",
                "Sunset Deck Lounge",
                "Private VIP Wine Cellar"
            ],
            "stats": {
                "years_experience": 14,
                "happy_guests": "85,000+",
                "signature_dishes": "120+",
                "rating": 4.9,
                "reviews_count": 1420
            }
        }
    })

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get active menu items with optional category/dietary filtering"""
    category = request.args.get('category')
    dietary = request.args.get('dietary')
    search = request.args.get('search', '').strip()

    conn = database.get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM menu_items WHERE is_available = 1"
    params = []

    if category and category.lower() != 'all':
        query += " AND category = ?"
        params.append(category)

    if dietary and dietary.lower() != 'all':
        query += " AND dietary = ?"
        params.append(dietary)

    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR ingredients LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY featured DESC, id ASC"

    cursor.execute(query, params)
    items = rows_to_list(cursor.fetchall())
    conn.close()

    return jsonify({"success": True, "count": len(items), "data": items})

@app.route('/api/menu/<int:item_id>', methods=['GET'])
def get_menu_item(item_id):
    """Get detailed dish information"""
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,))
    item = row_to_dict(cursor.fetchone())
    conn.close()

    if not item:
        return jsonify({"success": False, "message": "Dish not found"}), 404
    return jsonify({"success": True, "data": item})

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    """Book a table reservation"""
    data = request.get_json() or {}

    # Validation
    required_fields = ['customer_name', 'email', 'phone', 'guests', 'reservation_date', 'reservation_time', 'seating_area']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing)}"}), 400

    booking_code = generate_code("IVORY-B")
    conn = database.get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        INSERT INTO reservations (
            booking_code, customer_name, email, phone, guests,
            reservation_date, reservation_time, seating_area, occasion, special_requests, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            booking_code,
            data['customer_name'].strip(),
            data['email'].strip(),
            data['phone'].strip(),
            int(data['guests']),
            data['reservation_date'],
            data['reservation_time'],
            data['seating_area'],
            data.get('occasion', 'Casual Dining'),
            data.get('special_requests', ''),
            'Confirmed'
        ))
        conn.commit()
        res_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "success": True,
            "message": "Your table has been reserved with compliments of The Ivory Table!",
            "data": {
                "id": res_id,
                "booking_code": booking_code,
                "customer_name": data['customer_name'],
                "guests": data['guests'],
                "reservation_date": data['reservation_date'],
                "reservation_time": data['reservation_time'],
                "seating_area": data['seating_area'],
                "status": "Confirmed"
            }
        }), 201

    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/reservations/<booking_code>', methods=['GET'])
def get_reservation_by_code(booking_code):
    """Lookup reservation status by booking code"""
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reservations WHERE booking_code = ?", (booking_code.upper(),))
    res = row_to_dict(cursor.fetchone())
    conn.close()

    if not res:
        return jsonify({"success": False, "message": "Reservation code not found"}), 404
    return jsonify({"success": True, "data": res})

@app.route('/api/orders', methods=['POST'])
def place_order():
    """Place online order (Dine-In or Delivery or Takeaway)"""
    data = request.get_json() or {}

    items = data.get('items', [])
    if not items:
        return jsonify({"success": False, "message": "Your cart is empty"}), 400

    order_code = generate_code("ORD")
    customer_name = data.get('customer_name', 'Guest Diner').strip()
    phone = data.get('phone', '9856321456').strip()
    email = data.get('email', '')
    order_type = data.get('order_type', 'Dine-In')
    table_number = data.get('table_number', '')
    delivery_address = data.get('delivery_address', '')
    payment_method = data.get('payment_method', 'UPI / Card')
    notes = data.get('notes', '')

    # Calculate financial totals
    subtotal = float(data.get('subtotal', sum(item['price'] * item['qty'] for item in items)))
    tax = round(subtotal * 0.05, 2)  # 5% GST
    discount = float(data.get('discount', 0))
    total_amount = round(subtotal + tax - discount, 2)

    conn = database.get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        INSERT INTO orders (
            order_code, customer_name, phone, email, order_type, table_number,
            delivery_address, items_json, subtotal, tax, discount, total_amount,
            payment_method, payment_status, order_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_code,
            customer_name,
            phone,
            email,
            order_type,
            table_number,
            delivery_address,
            json.dumps(items),
            subtotal,
            tax,
            discount,
            total_amount,
            payment_method,
            'Paid',
            'In Kitchen',
            notes
        ))
        conn.commit()
        order_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "success": True,
            "message": "Order placed successfully! Chef has received your ticket.",
            "data": {
                "order_id": order_id,
                "order_code": order_code,
                "customer_name": customer_name,
                "order_type": order_type,
                "table_number": table_number,
                "items": items,
                "subtotal": subtotal,
                "tax": tax,
                "discount": discount,
                "total_amount": total_amount,
                "status": "In Kitchen",
                "estimated_time": "20-25 mins"
            }
        }), 201

    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/reviews', methods=['GET', 'POST'])
def handle_reviews():
    """Get approved reviews or submit a new review"""
    conn = database.get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('customer_name', '').strip()
        rating = int(data.get('rating', 5))
        review_text = data.get('review_text', '').strip()
        dish = data.get('dish_recommended', 'Chef Special').strip()
        visit_date = data.get('visit_date', datetime.now().strftime("%Y-%m-%d"))

        if not name or not review_text:
            conn.close()
            return jsonify({"success": False, "message": "Name and review text are required"}), 400

        cursor.execute("""
        INSERT INTO reviews (customer_name, rating, review_text, dish_recommended, visit_date, status)
        VALUES (?, ?, ?, ?, ?, 'Approved')
        """, (name, rating, review_text, dish, visit_date))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Thank you for your generous review!"}), 201

    # GET
    cursor.execute("SELECT * FROM reviews WHERE status = 'Approved' ORDER BY id DESC LIMIT 20")
    reviews = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({"success": True, "data": reviews})

@app.route('/api/messages', methods=['POST'])
def post_contact_message():
    """Submit contact or banquet event inquiry"""
    data = request.get_json() or {}
    name = data.get('sender_name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    subject = data.get('subject', 'General Inquiry').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({"success": False, "message": "Name, email, and message are required"}), 400

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO messages (sender_name, email, phone, subject, message, status)
    VALUES (?, ?, ?, ?, ?, 'Unread')
    """, (name, email, phone, subject, message))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Your message has reached our Guest Relations Manager. We will contact you shortly."
    }), 201

# ==========================================
# OWNER / ADMIN REST APIs
# ==========================================

@app.route('/api/auth/login', methods=['POST'])
def admin_login():
    """Owner & Manager Login Authentication"""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    pin = data.get('pin', '').strip()

    # Default owner credentials: admin@ivorytable.com / admin123 OR PIN: 1234 / admin123
    is_valid = (
        (email in ['admin@ivorytable.com', 'owner@ivorytable.com', '20tc1va145@mitsgwl.ac.in'] and password == 'admin123') or
        (pin in ['admin123', '1234', '9856']) or
        (password == 'admin123')
    )

    if is_valid:
        return jsonify({
            "success": True,
            "message": "Welcome back, Executive Manager!",
            "token": "ivory-admin-auth-session-token-99881",
            "user": {
                "name": "General Manager & Executive Chef",
                "role": "Owner / Administrator",
                "email": "admin@ivorytable.com",
                "restaurant": "The Ivory Table - Marine Drive"
            }
        })
    return jsonify({"success": False, "message": "Invalid admin credentials or PIN"}), 401

@app.route('/api/admin/dashboard', methods=['GET'])
def get_admin_dashboard():
    """Executive metrics & analytics for owner dashboard"""
    conn = database.get_db()
    cursor = conn.cursor()

    today_str = datetime.now().strftime("%Y-%m-%d")

    # Metrics
    cursor.execute("SELECT COUNT(*) FROM reservations WHERE reservation_date = ?", (today_str,))
    today_reservations = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM reservations WHERE status IN ('Confirmed', 'Pending')")
    upcoming_reservations = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM orders")
    order_stats = cursor.fetchone()
    total_orders = order_stats[0]
    total_revenue = round(order_stats[1], 2)

    cursor.execute("SELECT COUNT(*) FROM orders WHERE order_status IN ('Pending', 'In Kitchen')")
    active_kitchen_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM menu_items")
    total_dishes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM messages WHERE status = 'Unread'")
    unread_messages = cursor.fetchone()[0]

    # Recent reservations
    cursor.execute("SELECT * FROM reservations ORDER BY id DESC LIMIT 5")
    recent_reservations = rows_to_list(cursor.fetchall())

    # Recent orders
    cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 5")
    recent_orders = []
    for o in cursor.fetchall():
        od = dict(o)
        try:
            od['items'] = json.loads(od['items_json'])
        except Exception:
            od['items'] = []
        recent_orders.append(od)

    conn.close()

    return jsonify({
        "success": True,
        "metrics": {
            "today_reservations": today_reservations,
            "upcoming_reservations": upcoming_reservations,
            "total_orders": total_orders,
            "active_kitchen_orders": active_kitchen_orders,
            "total_revenue": total_revenue,
            "total_dishes": total_dishes,
            "unread_messages": unread_messages,
            "table_occupancy_rate": "78%"
        },
        "recent_reservations": recent_reservations,
        "recent_orders": recent_orders
    })

# --- Admin Reservations Management ---
@app.route('/api/admin/reservations', methods=['GET', 'POST'])
def admin_reservations():
    conn = database.get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        # Add manual reservation from admin
        data = request.get_json() or {}
        booking_code = generate_code("IVORY-M")
        cursor.execute("""
        INSERT INTO reservations (
            booking_code, customer_name, email, phone, guests,
            reservation_date, reservation_time, seating_area, occasion, special_requests, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            booking_code,
            data.get('customer_name', 'Walk-In Guest'),
            data.get('email', 'guest@ivorytable.com'),
            data.get('phone', '9856321456'),
            int(data.get('guests', 2)),
            data.get('reservation_date', datetime.now().strftime("%Y-%m-%d")),
            data.get('reservation_time', '20:00'),
            data.get('seating_area', 'Seaside Terrace'),
            data.get('occasion', 'Walk-In'),
            data.get('special_requests', ''),
            data.get('status', 'Confirmed')
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Reservation created manually", "booking_code": booking_code}), 201

    # GET with filters
    status = request.args.get('status')
    date = request.args.get('date')

    query = "SELECT * FROM reservations WHERE 1=1"
    params = []

    if status and status.lower() != 'all':
        query += " AND status = ?"
        params.append(status)
    if date:
        query += " AND reservation_date = ?"
        params.append(date)

    query += " ORDER BY reservation_date DESC, reservation_time DESC"
    cursor.execute(query, params)
    res = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({"success": True, "count": len(res), "data": res})

@app.route('/api/admin/reservations/<int:res_id>/status', methods=['PATCH'])
def update_reservation_status(res_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({"success": False, "message": "Status required"}), 400

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE reservations SET status = ? WHERE id = ?", (new_status, res_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Reservation #{res_id} status updated to {new_status}"})

@app.route('/api/admin/reservations/<int:res_id>', methods=['DELETE'])
def delete_reservation(res_id):
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reservations WHERE id = ?", (res_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Reservation #{res_id} deleted"})

# --- Admin Orders (Kitchen Display System - KDS) ---
@app.route('/api/admin/orders', methods=['GET'])
def admin_orders():
    conn = database.get_db()
    cursor = conn.cursor()
    status = request.args.get('status')

    query = "SELECT * FROM orders WHERE 1=1"
    params = []
    if status and status.lower() != 'all':
        query += " AND order_status = ?"
        params.append(status)

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    raw_orders = cursor.fetchall()
    orders = []
    for r in raw_orders:
        item = dict(r)
        try:
            item['items'] = json.loads(item['items_json'])
        except Exception:
            item['items'] = []
        orders.append(item)
    conn.close()
    return jsonify({"success": True, "count": len(orders), "data": orders})

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get('status') # Pending, In Kitchen, Ready, Delivered, Cancelled
    if not new_status:
        return jsonify({"success": False, "message": "Status required"}), 400

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET order_status = ? WHERE id = ?", (new_status, order_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Order #{order_id} updated to {new_status}"})

# --- Admin Menu Management (Full CRUD) ---
@app.route('/api/admin/menu', methods=['GET', 'POST'])
def admin_menu():
    conn = database.get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        price = float(data.get('price', 0))
        if not name or price <= 0:
            conn.close()
            return jsonify({"success": False, "message": "Name and valid price are required"}), 400

        cursor.execute("""
        INSERT INTO menu_items (
            name, category, description, ingredients, price, dietary,
            spice_level, image_url, is_available, featured, calories, prep_time, wine_pairing
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name,
            data.get('category', 'Progressive Mains'),
            data.get('description', ''),
            data.get('ingredients', ''),
            price,
            data.get('dietary', 'Veg'),
            int(data.get('spice_level', 1)),
            data.get('image_url', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85'),
            int(data.get('is_available', 1)),
            int(data.get('featured', 0)),
            int(data.get('calories', 450)),
            data.get('prep_time', '15-20 min'),
            data.get('wine_pairing', 'Sommelier Selection')
        ))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "message": "Dish added to menu", "id": new_id}), 201

    # GET all (including unavailable)
    cursor.execute("SELECT * FROM menu_items ORDER BY category, id DESC")
    items = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({"success": True, "count": len(items), "data": items})

@app.route('/api/admin/menu/<int:item_id>', methods=['PUT', 'DELETE'])
def admin_menu_item(item_id):
    conn = database.get_db()
    cursor = conn.cursor()

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM menu_items WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": f"Dish #{item_id} removed from menu"})

    # PUT
    data = request.get_json() or {}
    cursor.execute("""
    UPDATE menu_items SET
        name = ?, category = ?, description = ?, ingredients = ?,
        price = ?, dietary = ?, spice_level = ?, image_url = ?,
        is_available = ?, featured = ?, calories = ?, prep_time = ?, wine_pairing = ?
    WHERE id = ?
    """, (
        data.get('name'),
        data.get('category'),
        data.get('description'),
        data.get('ingredients'),
        float(data.get('price', 0)),
        data.get('dietary'),
        int(data.get('spice_level', 1)),
        data.get('image_url'),
        int(data.get('is_available', 1)),
        int(data.get('featured', 0)),
        int(data.get('calories', 400)),
        data.get('prep_time'),
        data.get('wine_pairing'),
        item_id
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Dish #{item_id} updated successfully"})

@app.route('/api/admin/menu/<int:item_id>/toggle', methods=['PATCH'])
def toggle_menu_availability(item_id):
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE menu_items SET is_available = 1 - is_available WHERE id = ?", (item_id,))
    conn.commit()
    cursor.execute("SELECT is_available FROM menu_items WHERE id = ?", (item_id,))
    new_state = cursor.fetchone()[0]
    conn.close()
    return jsonify({
        "success": True,
        "is_available": new_state,
        "message": "Dish availability updated"
    })

# --- Admin Messages & Feedback ---
@app.route('/api/admin/messages', methods=['GET'])
def admin_messages():
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY id DESC")
    msgs = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({"success": True, "data": msgs})

@app.route('/api/admin/messages/<int:msg_id>/status', methods=['PATCH'])
def update_message_status(msg_id):
    data = request.get_json() or {}
    status = data.get('status', 'Read')
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE messages SET status = ? WHERE id = ?", (status, msg_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Message #{msg_id} status updated to {status}"})

@app.route('/api/admin/reviews', methods=['GET'])
def admin_reviews():
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews ORDER BY id DESC")
    revs = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({"success": True, "data": revs})

@app.route('/api/admin/reviews/<int:rev_id>/status', methods=['PATCH'])
def update_review_status(rev_id):
    data = request.get_json() or {}
    status = data.get('status', 'Approved')
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE reviews SET status = ? WHERE id = ?", (status, rev_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Review #{rev_id} updated to {status}"})


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 5000))
    print("=" * 65)
    print("  ★ THE IVORY TABLE - SEASIDE FINE DINING & RESTAURANT SERVER ★")
    print(f"  • Customer Portal:       http://localhost:{PORT}")
    print(f"  • Owner & Admin Server:  http://localhost:{PORT}/admin")
    print(f"  • API Base URL:          http://localhost:{PORT}/api")
    print("=" * 65)
    app.run(host='0.0.0.0', port=PORT, debug=True)
