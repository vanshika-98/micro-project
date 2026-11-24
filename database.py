"""
The Ivory Table - Database Schema and Seed Data
SQLite implementation for Restaurant Management System
"""

import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ivory_table.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Menu Items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        ingredients TEXT,
        price REAL NOT NULL,
        dietary TEXT NOT NULL, -- Veg, Non-Veg, Vegan, Chef's Special
        spice_level INTEGER DEFAULT 1, -- 0-3
        image_url TEXT NOT NULL,
        is_available INTEGER DEFAULT 1,
        featured INTEGER DEFAULT 0,
        calories INTEGER,
        prep_time TEXT DEFAULT '15-20 min',
        wine_pairing TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Reservations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        guests INTEGER NOT NULL,
        reservation_date TEXT NOT NULL,
        reservation_time TEXT NOT NULL,
        seating_area TEXT NOT NULL, -- Seaside Terrace, Indoor Fine Dining, Sunset Deck, Private VIP Lounge
        occasion TEXT DEFAULT 'None',
        special_requests TEXT,
        status TEXT DEFAULT 'Confirmed', -- Pending, Confirmed, Seated, Completed, Cancelled
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Orders
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        order_type TEXT NOT NULL, -- Dine-In, Delivery, Takeaway
        table_number TEXT,
        delivery_address TEXT,
        items_json TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        discount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'UPI / Card',
        payment_status TEXT DEFAULT 'Paid',
        order_status TEXT DEFAULT 'Pending', -- Pending, In Kitchen, Ready, Delivered, Cancelled
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 4. Customer Reviews
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        review_text TEXT NOT NULL,
        dish_recommended TEXT,
        visit_date TEXT,
        status TEXT DEFAULT 'Approved', -- Approved, Pending, Hidden
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. Contact Inquiries & Event Bookings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'Unread', -- Unread, Read, Responded
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 6. Settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed initial data if menu is empty
    cursor.execute("SELECT COUNT(*) FROM menu_items")
    if cursor.fetchone()[0] == 0:
        seed_data(conn)

    conn.close()
    print("Database initialized successfully at:", DB_FILE)

def seed_data(conn):
    cursor = conn.cursor()

    menu_seeds = [
        # STARTERS
        (
            "Saffron & Herb Butter Garlic Prawns",
            "Starters",
            "Jumbo tiger prawns kissed with saffron-infused garlic butter, white wine glaze, fresh coastal herbs, and warm sourdough.",
            "Tiger Prawns, Kashmiri Saffron, Garlic, Herbs, White Wine Butter",
            850,
            "Non-Veg",
            1,
            "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85",
            1, 1, 420, "15 min", "Chardonnay or Sauvignon Blanc"
        ),
        (
            "Burrata & Mumbai Heirloom Tomato Chaat",
            "Starters",
            "Artisanal Puglia burrata rested over spiced heirloom tomato tartare, tamarind glaze, crispy sev, micro-cilantro, and puffed grains.",
            "Italian Burrata, Heirloom Tomatoes, Mint-Coriander Emulsion, Tamarind Reduction",
            690,
            "Veg",
            1,
            "https://images.unsplash.com/photo-1592417817098-8f3d69104a47?auto=format&fit=crop&w=900&q=85",
            1, 1, 380, "12 min", "Dry Riesling or Sparkling Prosecco"
        ),
        (
            "Charcoal Smoked Malai Broccoli",
            "Starters",
            "Tender broccoli florets marinated in cardamom cream cheese, charred over clay tandoor, finished with crumbled gorgonzola & toasted almonds.",
            "Broccoli, Philadelphia Cream Cheese, Green Cardamom, Gorgonzola, Almond flakes",
            580,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
            1, 0, 310, "15 min", "Pinot Grigio"
        ),
        (
            "Crispy Golden Calamari with Kaffir Lime Aioli",
            "Starters",
            "Tender Arabian Sea squid rings dusted in spiced rice flour, flash-fried, served with crushed black pepper & kaffir lime emulsion.",
            "Arabian Squid, Spiced Tempura, Kaffir Lime, Garlic Aioli",
            720,
            "Non-Veg",
            2,
            "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=900&q=85",
            1, 0, 450, "12 min", "Crisp Lager or Sauvignon Blanc"
        ),
        (
            "Smoked Paneer Tikka Carpaccio",
            "Starters",
            "Melt-in-mouth cottage cheese steaks cold-smoked with clove smoke, saffron mist, raw mango relish, and beetroot crisp garnish.",
            "Cottage Cheese, Kashmiri Chili, Raw Mango, Microgreens, Clove Oil",
            590,
            "Veg",
            1,
            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=85",
            1, 0, 390, "15 min", "Chenin Blanc"
        ),

        # COASTAL SEAFOOD
        (
            "Truffle Malabar Lobster Thermidor",
            "Coastal Seafood",
            "Whole Arabian spiny lobster simmered in roasted coconut bisque, finished with black truffle emulsion and golden Gruyère crust.",
            "Spiny Lobster, Malabar Coconut Bisque, Black Truffle, Aged Gruyère Cheese",
            2450,
            "Chef's Special",
            1,
            "https://images.unsplash.com/photo-1559737558-245cb3518e38?auto=format&fit=crop&w=900&q=85",
            1, 1, 620, "25 min", "Premier Cru Chablis or Champagne"
        ),
        (
            "Kaffir Lime & Coconut Crusted Sea Bass",
            "Coastal Seafood",
            "Day-catch Chilean sea bass fillet crusted with fresh coconut and kaffir lime, sitting atop turmeric edamame mash and moilee broth.",
            "Chilean Sea Bass, Coconut Milk, Kaffir Lime Leaves, Edamame, Mustard Seeds",
            1650,
            "Non-Veg",
            1,
            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",
            1, 1, 480, "20 min", "Viognier or Oak Chardonnay"
        ),
        (
            "Mangalorean Ghee Roast Jumbo Prawns",
            "Coastal Seafood",
            "Wild caught ocean prawns tossed in slow-cooked Byadgi chili ghee paste, crushed curry leaves, and sour tamarind extract.",
            "King Prawns, A2 Cow Ghee, Byadgi Chillies, Curry Leaves, Fenugreek",
            1280,
            "Non-Veg",
            3,
            "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=900&q=85",
            1, 0, 520, "18 min", "Zesty Riesling or Craft Wheat Beer"
        ),
        (
            "Pan-Seared Atlantic Salmon on Saffron Risotto",
            "Coastal Seafood",
            "Crispy skin Norwegian salmon fillet rested over creamy arborio saffron risotto, asparagus spears, and citrus herb velouté.",
            "Norwegian Salmon, Arborio Rice, Kashmiri Saffron, Parmesan, Asparagus",
            1750,
            "Non-Veg",
            0,
            "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=85",
            1, 1, 560, "20 min", "Pinot Noir or Sancerre"
        ),

        # PROGRESSIVE MAINS
        (
            "Kashmiri Rogan Josh Braised Lamb Shank",
            "Progressive Mains",
            "12-hour slow-braised New Zealand lamb shank infused with Ratan Jot bark, fennel seed reduction, served with zafrani sheermal.",
            "Lamb Shank, Kashmiri Mawal Flower, Fennel, Green Cardamom, Ginger Jus",
            1590,
            "Chef's Special",
            2,
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
            1, 1, 740, "25 min", "Syrah or Cabernet Sauvignon"
        ),
        (
            "Woodfired Butter Chicken Roulade",
            "Progressive Mains",
            "Corn-fed chicken breast stuffed with pistachio and sun-dried figs, slow roasted and sliced over silk-velvet San Marzano makhani gravy.",
            "Chicken Breast, San Marzano Tomatoes, Cashew Cream, Dried Figs, Kasoori Methi",
            980,
            "Non-Veg",
            1,
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85",
            1, 1, 610, "18 min", "Merlot or Malbec"
        ),
        (
            "Smoked Dal Bukhara (36-Hour Slow Simmered)",
            "Progressive Mains",
            "Black lentils cooked over charcoal embers for 36 hours with churned white butter, vine-ripened tomatoes, and subtle spices.",
            "Urad Dal, Churned White Butter, Ripe Tomatoes, Fenugreek, Clove Smoke",
            690,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85",
            1, 1, 460, "10 min", "Chianti Classico"
        ),
        (
            "Wild Mushroom & Truffle Handcrafted Tagliolini",
            "Progressive Mains",
            "Handmade egg pasta with sautéed morels, porcini dust, black winter truffle butter, parmigiano reggiano aged 24 months.",
            "Handmade Tagliolini, Morels, Porcini, Black Winter Truffle, 24M Parmigiano",
            1150,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1621996346565-e3d5d6281729?auto=format&fit=crop&w=900&q=85",
            1, 0, 580, "16 min", "Barolo or Nebbiolo"
        ),
        (
            "Avocado & Paneer Kundan Qaliya",
            "Progressive Mains",
            "Charred organic cottage cheese medallions in a rich saffron-onion gravy scented with rose water and crowned with toasted pistachios.",
            "Cottage Cheese, Hass Avocado, Saffron, Rose Petals, Cashew Paste",
            820,
            "Veg",
            1,
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85",
            1, 0, 490, "15 min", "Sauvignon Blanc"
        ),

        # BREADS & BIRYANIS
        (
            "Dum Awadhi Lamb Biryani in Clay Handi",
            "Breads & Biryanis",
            "Fragrant aged Basmati rice layered with succulent baby goat, saffron milk, caramelized shallots, sealed and slow dum-cooked in earthenware.",
            "Aged Basmati, Baby Goat, Saffron, Rose Water, Mint, Ghee",
            1190,
            "Non-Veg",
            2,
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=85",
            1, 1, 780, "20 min", "Shiraz or Spiced Chai Highball"
        ),
        (
            "Truffle & Morel Mushroom Subz Biryani",
            "Breads & Biryanis",
            "Himalayan morels, baby zucchini, and saffron rice infused with white truffle essence, accompanied by smoked burani raita.",
            "Basmati Rice, Himalayan Morels, White Truffle Oil, Mint, Crispy Onion",
            890,
            "Veg",
            1,
            "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=85",
            1, 0, 560, "18 min", "Chardonnay"
        ),
        (
            "Truffle & Goat Cheese Stuffed Naan",
            "Breads & Biryanis",
            "Tandoori leavened bread stuffed with creamy French goat cheese and drizzled with Italian white truffle oil and sea salt.",
            "Refined Wheat Flour, French Chevre Goat Cheese, Truffle Oil, Maldon Salt",
            340,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
            1, 0, 320, "8 min", "Sparkling Water or White Wine"
        ),

        # DESSERTS
        (
            "24K Gold Saffron Rasmalai Tres Leches",
            "Decadent Desserts",
            "Fluffy saffron sponge soaked in evaporated saffron milk, crowned with poached chenna discs, edible 24K gold foil, and Iranian pistachios.",
            "Kashmiri Saffron, Milk Sponge, Chenna, Iranian Pistachios, 24K Edible Gold",
            650,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85",
            1, 1, 410, "8 min", "Late Harvest Tokaji or Sweet Port"
        ),
        (
            "Coastal Coconut & Alphonso Mango Panna Cotta",
            "Decadent Desserts",
            "Silk tender coconut milk panna cotta topped with Ratnagiri Alphonso mango compote and crisp coconut-cardamom tuile.",
            "Fresh Coconut Cream, Ratnagiri Alphonso Mango, Agar Agar, Mint Tuile",
            550,
            "Vegan",
            0,
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
            1, 1, 320, "6 min", "Moscato d'Asti"
        ),
        (
            "Belgian Dark Chocolate Dome with Warm Salted Caramel",
            "Decadent Desserts",
            "70% Valrhona dark chocolate dome enclosing hazelnut praline mousse, melted tableside with warm sea-salt bourbon caramel.",
            "70% Valrhona Chocolate, Hazelnut Praline, Fleur de Sel Caramel, Gold Dust",
            690,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=900&q=85",
            1, 0, 530, "10 min", "Vintage Tawny Port or Espresso"
        ),

        # COCKTAILS & MOCKTAILS
        (
            "Marine Drive Sunset Twilight Cocktail",
            "Beverages",
            "Butterfly pea flower infused artisanal gin, French elderflower liqueur, freshly squeezed Sicilian lime, topped with sparkling rosé and edible shimmer.",
            "Craft Gin, Butterfly Pea Flower, St. Germain Elderflower, Sicilian Lime, Sparkling Rosé",
            780,
            "Non-Veg",
            0,
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=85",
            1, 1, 190, "5 min", "Signature Apéritif"
        ),
        (
            "Smoked Rosemary Old Fashioned",
            "Beverages",
            "Single malt aged whiskey, angostura bitters, organic jaggery reduction, torched seaside rosemary smoke trapped under a glass cloche.",
            "Aged Malt Whiskey, Organic Jaggery, Angostura Bitters, Smoked Rosemary",
            890,
            "Veg",
            0,
            "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=900&q=85",
            1, 0, 210, "5 min", "Signature Digestif"
        ),
        (
            "Ratnagiri Mango & Thai Chili Highball (Mocktail)",
            "Beverages",
            "Fresh Alphonso mango pulp, crushed Thai bird's eye chili, kaffir lime essence, agave syrup, topped with sparkling Himalayan tonic.",
            "Alphonso Mango, Thai Chili, Kaffir Lime, Blue Agave, Artisanal Sparkling Tonic",
            420,
            "Vegan",
            1,
            "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=85",
            1, 1, 140, "4 min", "Perfect Summer Refresher"
        )
    ]

    cursor.executemany("""
    INSERT INTO menu_items (
        name, category, description, ingredients, price, dietary, spice_level,
        image_url, is_available, featured, calories, prep_time, wine_pairing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, menu_seeds)

    # Seed initial Reservations
    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    sample_reservations = [
        ("IVORY-B8291", "Dr. Vikramaditya Singhania", "vikram.singhania@gmail.com", "9820012345", 4, today_str, "20:00", "Seaside Terrace", "Anniversary", "Table overlooking sunset sea waves; anniversary cake surprise requested.", "Confirmed"),
        ("IVORY-B8292", "Priya Mehra", "priya.mehra@techcorp.in", "9819956789", 2, today_str, "19:30", "Sunset Deck", "Date Night", "Window booth requested.", "Seated"),
        ("IVORY-B8293", "Rohan & Aisha Kapoor", "rohan.kapoor@mumbaiadvisors.com", "9821034567", 6, today_str, "21:00", "Private VIP Lounge", "Birthday", "Wine pairing recommendation and sommelier service.", "Confirmed"),
        ("IVORY-B8294", "Chef Natasha Merchant", "nmerchant@gastronomy.org", "9820543210", 3, tomorrow_str, "13:00", "Indoor Fine Dining", "Business Lunch", "Quiet seating area for contract discussion.", "Confirmed"),
        ("IVORY-B8295", "Sameer Deshmukh", "sameer.deshmukh@gmail.com", "9769012345", 2, tomorrow_str, "20:30", "Seaside Terrace", "None", "First time diners.", "Pending"),
        ("IVORY-B8296", "Ananya Birla & Guests", "reservations@ananyabirlafam.com", "9820198765", 8, today_str, "21:30", "Private VIP Lounge", "Celebration", "Chef tasting 7-course menu requested.", "Confirmed")
    ]

    cursor.executemany("""
    INSERT INTO reservations (
        booking_code, customer_name, email, phone, guests,
        reservation_date, reservation_time, seating_area, occasion, special_requests, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_reservations)

    # Seed initial Orders
    sample_order_items_1 = [
        {"name": "Truffle Malabar Lobster Thermidor", "qty": 1, "price": 2450},
        {"name": "Marine Drive Sunset Twilight Cocktail", "qty": 2, "price": 780},
        {"name": "24K Gold Saffron Rasmalai Tres Leches", "qty": 1, "price": 650}
    ]
    sample_order_items_2 = [
        {"name": "Saffron & Herb Butter Garlic Prawns", "qty": 1, "price": 850},
        {"name": "Dum Awadhi Lamb Biryani in Clay Handi", "qty": 2, "price": 1190},
        {"name": "Truffle & Goat Cheese Stuffed Naan", "qty": 2, "price": 340}
    ]
    sample_order_items_3 = [
        {"name": "Smoked Dal Bukhara (36-Hour Slow Simmered)", "qty": 1, "price": 690},
        {"name": "Burrata & Mumbai Heirloom Tomato Chaat", "qty": 1, "price": 690},
        {"name": "Truffle & Morel Mushroom Subz Biryani", "qty": 1, "price": 890}
    ]

    sample_orders = [
        ("ORD-701", "Mr. Siddharth Rao", "9820123456", "sid.rao@gmail.com", "Dine-In", "Table 12 (Seaside)", "", json.dumps(sample_order_items_1), 4660, 233, 0, 4893, "Card", "Paid", "In Kitchen", "Celebrating promotion"),
        ("ORD-702", "Kavita Sethi", "9819087654", "kavita.s@horizon.com", "Delivery", "", "Flat 14B, Sea Green Bay, Marine Drive, Mumbai", json.dumps(sample_order_items_2), 3910, 195.5, 391, 3714.5, "UPI", "Paid", "Ready", "Please deliver with extra mint chutney"),
        ("ORD-703", "Aman Verma", "9769345678", "aman.verma@gmail.com", "Dine-In", "Table 4 (Indoor)", "", json.dumps(sample_order_items_3), 2270, 113.5, 0, 2383.5, "UPI", "Paid", "Delivered", "All items served")
    ]

    cursor.executemany("""
    INSERT INTO orders (
        order_code, customer_name, phone, email, order_type, table_number,
        delivery_address, items_json, subtotal, tax, discount, total_amount,
        payment_method, payment_status, order_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_orders)

    # Seed initial Reviews
    sample_reviews = [
        ("Arjun & Natasha Oberoi", 5, "Unmatched sunset ocean views on Marine Drive! The Truffle Malabar Lobster and 24K Saffron Tres Leches were culinary masterclasses. Service was impeccable.", "Truffle Malabar Lobster Thermidor", "2026-11-20", "Approved"),
        ("Chef Rahul Akerkar", 5, "The depth in the 36-hour Smoked Dal Bukhara and the balance in the Burrata Heirloom Chaat showed extraordinary finesse. A true crown jewel on Mumbai's coast.", "Smoked Dal Bukhara", "2026-11-18", "Approved"),
        ("Shweta Bachchan", 5, "The vibe at sunset is magical. The Sunset Twilight cocktail with glittering shimmer against the Arabian Sea horizon is unforgettable. We will be regular guests!", "Marine Drive Sunset Twilight Cocktail", "2026-11-15", "Approved"),
        ("Dr. Mehul Parekh", 5, "Hosted my parents' 40th anniversary here in the Seaside Terrace. The hospitality was royal, and the Awadhi Dum Biryani melted in our mouths. 10/10 recommendation.", "Dum Awadhi Lamb Biryani", "2026-11-10", "Approved")
    ]

    cursor.executemany("""
    INSERT INTO reviews (
        customer_name, rating, review_text, dish_recommended, visit_date, status
    ) VALUES (?, ?, ?, ?, ?, ?)
    """, sample_reviews)

    # Seed initial Messages
    sample_messages = [
        ("Kunal Singhania", "kunal@singhaniaholdings.com", "9820098765", "Corporate Sunset Cocktail Party Booking", "We wish to book the Private VIP Lounge for 25 executives on Dec 12th. Please contact us with group banquet menus.", "Unread"),
        ("Meera Sen", "meera.sen@gmail.com", "9819012345", "Anniversary Table Customization", "Hi, I have a reservation for this Friday. Can we arrange a floral bouquet on the table before our arrival?", "Read")
    ]

    cursor.executemany("""
    INSERT INTO messages (sender_name, email, phone, subject, message, status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, sample_messages)

    # Seed Settings
    settings_data = [
        ("restaurant_name", "The Ivory Table"),
        ("tagline", "Where every bite tells a story"),
        ("location", "Seaside Marine Drive, Mumbai - 400020, India"),
        ("phone", "9856321456"),
        ("email", "20tc1va145@mitsgwl.ac.in"),
        ("opening_hours", "Mon - Sun: 11:00 AM - 11:30 PM"),
        ("admin_pin", "admin123"),
        ("admin_email", "admin@ivorytable.com"),
        ("gst_percentage", "5"),
        ("table_capacity", "120")
    ]

    cursor.executemany("""
    INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    """, settings_data)

    conn.commit()
    print("Database seeded with sample menu, reservations, orders, and reviews.")

if __name__ == "__main__":
    init_db()
