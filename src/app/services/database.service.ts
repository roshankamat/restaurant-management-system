import { Injectable, signal, computed } from '@angular/core';
import {
  MenuItem,
  RestaurantTable,
  Order,
  OrderItem,
  OrderType,
  Customer,
  CustomerTier,
  RestaurantProfile,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TableStatus
} from '../models/restaurant.model';

const STORAGE_KEYS = {
  MENU: 'royal_rasoi_menu_v1',
  TABLES: 'royal_rasoi_tables_v1',
  ORDERS: 'royal_rasoi_orders_v1',
  CUSTOMERS: 'royal_rasoi_customers_v1',
  PROFILE: 'royal_rasoi_profile_v1'
};

const DEFAULT_PROFILE: RestaurantProfile = {
  name: 'Kamat Ka Dhaba',
  hindiName: 'कामत का ढाबा',
  tagline: 'Authentic Royal Indian Dhaba & Fine Dining',
  address: '14, Regal Heritage Plaza, Connaught Circle',
  city: 'New Delhi',
  pincode: '110001',
  phone: '+91 98112 34567',
  email: 'hospitality@kamatkadhaba.in',
  gstin: '07AAAAA1234A1Z5',
  fssaiNumber: '10022011000984',
  currencySymbol: '₹',
  cgstPercent: 2.5,
  sgstPercent: 2.5
};

const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Starters & Kebabs
  {
    id: 'm-1',
    name: 'Paneer Tikka Angara',
    hindiName: 'पनीर टिक्का अंगारा',
    category: 'Starters & Kebabs',
    price: 320,
    description: 'Charcoal-grilled cottage cheese marinated in hung curd, Kashmiri deghi mirch and mustard oil.',
    isVeg: true,
    spiceLevel: 'Spicy',
    prepTimeMinutes: 20,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true,
    isJainFriendly: true
  },
  {
    id: 'm-2',
    name: 'Tandoori Murgh (Half)',
    hindiName: 'तंदूरी मुर्ग',
    category: 'Starters & Kebabs',
    price: 380,
    description: 'Classic succulent chicken on bone marinated in royal tandoori spices and smoked in a clay oven.',
    isVeg: false,
    spiceLevel: 'Medium',
    prepTimeMinutes: 25,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-3',
    name: 'Murgh Malai Kebab',
    hindiName: 'मुर्ग मलाई कबाब',
    category: 'Starters & Kebabs',
    price: 410,
    description: 'Melt-in-mouth chicken chunks infused with cream, cheese, cardamom and green coriander paste.',
    isVeg: false,
    spiceLevel: 'Mild',
    prepTimeMinutes: 20,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-4',
    name: 'Dilli 6 Samosa Chaat',
    hindiName: 'दिल्ली समोसा चाट',
    category: 'Starters & Kebabs',
    price: 180,
    description: 'Crisp handmade potato samosas crushed with tangy Amritsari chole, sweetened yogurt and tamarind chutney.',
    isVeg: true,
    spiceLevel: 'Medium',
    prepTimeMinutes: 12,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-5',
    name: 'Hara Bhara Kebab',
    hindiName: 'हरा भरा कबाब',
    category: 'Starters & Kebabs',
    price: 260,
    description: 'Nutritious patties of spinach, green peas and paneer, pan-griddled with a cashew topper.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 15,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
    isJainFriendly: false
  },
  {
    id: 'm-6',
    name: 'Galouti Kebab Awadhi',
    hindiName: 'गलौटी कबाब अवधी',
    category: 'Starters & Kebabs',
    price: 460,
    description: 'Finely minced spiced mutton cooked with 32 secret Lucknowi spices, served on miniature ulte tawa parathas.',
    isVeg: false,
    spiceLevel: 'Medium',
    prepTimeMinutes: 25,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },

  // Main Course (Curries)
  {
    id: 'm-7',
    name: 'Old Delhi Butter Chicken',
    hindiName: 'बटर चिकन (मुर्ग मखनी)',
    category: 'Main Course (Curries)',
    price: 450,
    description: 'Tender tandoori chicken simmered in a velvety gravy of vine-ripened tomatoes, fresh butter and cashew cream.',
    isVeg: false,
    spiceLevel: 'Medium',
    prepTimeMinutes: 25,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-8',
    name: 'Dal Makhani Shahi',
    hindiName: 'दाल मखनी शाही',
    category: 'Main Course (Curries)',
    price: 340,
    description: 'Whole black lentils & red kidney beans slow-cooked overnight on tandoor embers with churned white butter.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 15,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-9',
    name: 'Paneer Butter Masala',
    hindiName: 'पनीर बटर मसाला',
    category: 'Main Course (Curries)',
    price: 370,
    description: 'Fresh farm malai paneer cubes simmered in a rich, mild and creamy spiced tomato makhani sauce.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 20,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
    isJainFriendly: true
  },
  {
    id: 'm-10',
    name: 'Kashmiri Rogan Josh',
    hindiName: 'कश्मीरी रोगन जोश',
    category: 'Main Course (Curries)',
    price: 520,
    description: 'Slow-braised spring lamb shanks cooked with aromatic Kashmiri chili, alkanet root (ratanjot) and fennel.',
    isVeg: false,
    spiceLevel: 'Spicy',
    prepTimeMinutes: 30,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-11',
    name: 'Pindi Chana Masala',
    hindiName: 'पिंडी चना मसाला',
    category: 'Main Course (Curries)',
    price: 290,
    description: 'Authentic dark roasted chickpeas cooked with whole spices, dry pomegranate seeds and ginger juliennes.',
    isVeg: true,
    spiceLevel: 'Medium',
    prepTimeMinutes: 15,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-12',
    name: 'Kadhai Paneer Lazeez',
    hindiName: 'कढ़ाई पनीर लज़ीज़',
    category: 'Main Course (Curries)',
    price: 360,
    description: 'Paneer, bell peppers and freshly ground coriander-peppercorn masala tossed in a traditional iron kadhai.',
    isVeg: true,
    spiceLevel: 'Spicy',
    prepTimeMinutes: 20,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-13',
    name: 'Malai Kofta Nizami',
    hindiName: 'मलाई कोफ्ता निज़ामी',
    category: 'Main Course (Curries)',
    price: 390,
    description: 'Cottage cheese & khoya dumplings stuffed with dry fruits, served in an exquisite golden saffron gravy.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 20,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
    isJainFriendly: true
  },

  // Royal Biryani & Rice
  {
    id: 'm-14',
    name: 'Hyderabadi Dum Chicken Biryani',
    hindiName: 'हैदराबादी दम मुर्ग बिरयानी',
    category: 'Royal Biryani & Rice',
    price: 420,
    description: 'Long grain aged basmati rice layered with marinated chicken, saffron milk and fried onions, cooked under dough seal (dum).',
    isVeg: false,
    spiceLevel: 'Spicy',
    prepTimeMinutes: 30,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-15',
    name: 'Shahi Subz Dum Biryani',
    hindiName: 'शाही सब्ज़ दम बिरयानी',
    category: 'Royal Biryani & Rice',
    price: 340,
    description: 'Garden vegetables, fresh mint and paneer layered with aromatic spiced basmati rice and rose water, with salan & raita.',
    isVeg: true,
    spiceLevel: 'Medium',
    prepTimeMinutes: 25,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-16',
    name: 'Awadhi Gosht Dum Biryani',
    hindiName: 'अवधी गोश्त दम बिरयानी',
    category: 'Royal Biryani & Rice',
    price: 540,
    description: 'Royal delicacy of succulent mutton pieces layered with kewra infused rice and fried brown onions.',
    isVeg: false,
    spiceLevel: 'Medium',
    prepTimeMinutes: 35,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-17',
    name: 'Jeera Rice & Burani Raita',
    hindiName: 'जीरा राइस और बूंदी रायता',
    category: 'Royal Biryani & Rice',
    price: 190,
    description: 'Steamed basmati rice tempered with cumin seeds, pure desi ghee and fresh chopped coriander.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 10,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60'
  },

  // Tandoori Breads
  {
    id: 'm-18',
    name: 'Garlic Butter Naan',
    hindiName: 'गार्लिक बटर नान',
    category: 'Tandoori Breads',
    price: 85,
    description: 'Clay-oven baked leavened bread brushed with garlic-infused butter and topped with fresh coriander.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 8,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-19',
    name: 'Amritsari Chur Chur Kulcha',
    hindiName: 'अमृतसरी चूर चूर कुलचा',
    category: 'Tandoori Breads',
    price: 130,
    description: 'Crispy flaky tandoor bread stuffed with spiced potatoes and paneer, crushed with dollops of butter.',
    isVeg: true,
    spiceLevel: 'Medium',
    prepTimeMinutes: 12,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-20',
    name: 'Tandoori Roti (Butter)',
    hindiName: 'तंदूरी बटर रोटी',
    category: 'Tandoori Breads',
    price: 45,
    description: 'Whole wheat flatbread cooked in high-heat clay tandoor, topped with pure cow ghee.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 6,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-21',
    name: 'Laccha Paratha Pudina',
    hindiName: 'पुदीना लच्छा पराठा',
    category: 'Tandoori Breads',
    price: 75,
    description: 'Multi-layered flaky wheat bread dusted with dried organic mint leaves and fenugreek.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 10,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60'
  },

  // Desserts & Mithai
  {
    id: 'm-22',
    name: 'Gulab Jamun with Rabdi',
    hindiName: 'गुलाब जामुन रबड़ी के साथ',
    category: 'Desserts & Mithai',
    price: 190,
    description: 'Warm golden khoya dumplings soaked in rose-cardamom syrup, served with chilled saffron rabdi.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 8,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-23',
    name: 'Kesari Rasmalai (2 Pcs)',
    hindiName: 'केसरी रसमलाई',
    category: 'Desserts & Mithai',
    price: 180,
    description: 'Poached sweet cottage cheese discs soaked in clotted saffron milk, garnished with Iranian pistachios.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 5,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-24',
    name: 'Shahi Tukda Royal',
    hindiName: 'शाही टुकड़ा',
    category: 'Desserts & Mithai',
    price: 210,
    description: 'Crispy fried bread slices dipped in saffron sugar syrup, blanketed with thick rabdi and edible silver vark.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 10,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },

  // Desi Beverages
  {
    id: 'm-25',
    name: 'Kesar Pista Mango Lassi',
    hindiName: 'केसर पिस्ता आम की लस्सी',
    category: 'Desi Beverages',
    price: 150,
    description: 'Thick churned sweet yogurt blended with Alphonso mango pulp, saffron strands and crushed dry fruits.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 6,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1571006687898-3bfd45b23d9a?w=500&auto=format&fit=crop&q=60',
    isChefSpecial: true
  },
  {
    id: 'm-26',
    name: 'Royal Kulhad Masala Chai',
    hindiName: 'शाही कुल्हड़ मसाला चाय',
    category: 'Desi Beverages',
    price: 90,
    description: 'CTC Assam brew simmered with fresh crushed ginger, cardamom, cloves, cinnamon and buffalo milk in earthen cup.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 8,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm-27',
    name: 'Sweet Patiala Lassi',
    hindiName: 'पटियाला मीठी लस्सी',
    category: 'Desi Beverages',
    price: 130,
    description: 'Traditional Punjabi sweet churned yogurt topped with thick fresh malai peda layer in a tall glass.',
    isVeg: true,
    spiceLevel: 'Mild',
    prepTimeMinutes: 5,
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1571006687898-3bfd45b23d9a?w=500&auto=format&fit=crop&q=60'
  }
];

const INITIAL_TABLES: RestaurantTable[] = [
  { id: 't-1', number: 1, capacity: 2, zone: 'Royal AC Hall', status: 'OCCUPIED', currentOrderId: 'ORD-1001', occupiedSince: '28 mins ago' },
  { id: 't-2', number: 2, capacity: 4, zone: 'Royal AC Hall', status: 'AVAILABLE' },
  { id: 't-3', number: 3, capacity: 4, zone: 'Royal AC Hall', status: 'OCCUPIED', currentOrderId: 'ORD-1002', occupiedSince: '45 mins ago' },
  { id: 't-4', number: 4, capacity: 6, zone: 'Royal AC Hall', status: 'BILLING', currentOrderId: 'ORD-1003', occupiedSince: '65 mins ago' },
  { id: 't-5', number: 5, capacity: 2, zone: 'Garden Courtyard', status: 'AVAILABLE' },
  { id: 't-6', number: 6, capacity: 4, zone: 'Garden Courtyard', status: 'OCCUPIED', currentOrderId: 'ORD-1004', occupiedSince: '12 mins ago' },
  { id: 't-7', number: 7, capacity: 4, zone: 'Garden Courtyard', status: 'RESERVED', reservation: { customerName: 'Rajesh Sharma', customerPhone: '+91 98234 56789', guests: 4, timeSlot: '08:30 PM', notes: 'Anniversary Celebration' } },
  { id: 't-8', number: 8, capacity: 6, zone: 'Garden Courtyard', status: 'AVAILABLE' },
  { id: 't-9', number: 9, capacity: 8, zone: 'Shahi Cabana', status: 'AVAILABLE' },
  { id: 't-10', number: 10, capacity: 8, zone: 'Shahi Cabana', status: 'OCCUPIED', currentOrderId: 'ORD-1005', occupiedSince: '50 mins ago' },
  { id: 't-11', number: 11, capacity: 4, zone: 'Shahi Cabana', status: 'RESERVED', reservation: { customerName: 'Pooja Singhania', customerPhone: '+91 97110 99887', guests: 4, timeSlot: '09:00 PM', notes: 'Quiet corner requested' } },
  { id: 't-12', number: 12, capacity: 2, zone: 'Royal AC Hall', status: 'AVAILABLE' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Vikramaditya Roy',
    phone: '+91 98111 22334',
    email: 'vikram.roy@outlook.com',
    tier: 'PLATINUM',
    totalVisits: 24,
    totalSpent: 48600,
    dietaryPreference: 'NON_VEG',
    favoriteDish: 'Kashmiri Rogan Josh',
    notes: 'Prefers Table 10 (Shahi Cabana). Likes less oil.',
    lastVisit: '2026-11-02',
    createdAt: '2026-01-15'
  },
  {
    id: 'c-2',
    name: 'Ananya Mehra',
    phone: '+91 98732 44556',
    email: 'ananya.mehra@gmail.com',
    tier: 'GOLD',
    totalVisits: 14,
    totalSpent: 26200,
    dietaryPreference: 'PURE_VEG',
    favoriteDish: 'Dal Makhani Shahi',
    notes: 'Jain preparation preference for family visits.',
    lastVisit: '2026-11-03',
    createdAt: '2026-03-20'
  },
  {
    id: 'c-3',
    name: 'Col. Hardeep Singh',
    phone: '+91 99887 76655',
    tier: 'GOLD',
    totalVisits: 18,
    totalSpent: 34500,
    dietaryPreference: 'NON_VEG',
    favoriteDish: 'Old Delhi Butter Chicken',
    notes: 'Loves extra garlic naan and laccha onions.',
    lastVisit: '2026-11-04',
    createdAt: '2026-02-10'
  },
  {
    id: 'c-4',
    name: 'Sunita & Ramesh Agrawal',
    phone: '+91 94140 12345',
    email: 'agrawal.traders@yahoo.com',
    tier: 'SILVER',
    totalVisits: 7,
    totalSpent: 13800,
    dietaryPreference: 'PURE_VEG',
    favoriteDish: 'Paneer Tikka Angara',
    notes: 'Regular weekend family dinners.',
    lastVisit: '2026-10-28',
    createdAt: '2026-05-12'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'o-1',
    orderNumber: 'ORD-1001',
    type: 'DINE_IN',
    tableNumber: 1,
    tableId: 't-1',
    customerName: 'Aarav Malhotra',
    customerPhone: '+91 98100 54321',
    items: [
      { menuItemId: 'm-1', name: 'Paneer Tikka Angara', hindiName: 'पनीर टिक्का अंगारा', price: 320, quantity: 1, isVeg: true },
      { menuItemId: 'm-9', name: 'Paneer Butter Masala', hindiName: 'पनीर बटर मसाला', price: 370, quantity: 1, isVeg: true },
      { menuItemId: 'm-18', name: 'Garlic Butter Naan', hindiName: 'गार्लिक बटर नान', price: 85, quantity: 2, isVeg: true },
      { menuItemId: 'm-25', name: 'Kesar Pista Mango Lassi', hindiName: 'केसर पिस्ता आम की लस्सी', price: 150, quantity: 2, isVeg: true }
    ],
    subtotal: 1160,
    cgstRate: 2.5,
    cgstAmount: 29.0,
    sgstRate: 2.5,
    sgstAmount: 29.0,
    discountAmount: 0,
    grandTotal: 1218,
    status: 'PREPARING',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    specialInstructions: 'Make paneer tikka extra crisp'
  },
  {
    id: 'o-2',
    orderNumber: 'ORD-1002',
    type: 'DINE_IN',
    tableNumber: 3,
    tableId: 't-3',
    customerName: 'Col. Hardeep Singh',
    customerPhone: '+91 99887 76655',
    items: [
      { menuItemId: 'm-2', name: 'Tandoori Murgh (Half)', hindiName: 'तंदूरी मुर्ग', price: 380, quantity: 1, isVeg: false },
      { menuItemId: 'm-7', name: 'Old Delhi Butter Chicken', hindiName: 'बटर चिकन (मुर्ग मखनी)', price: 450, quantity: 1, isVeg: false },
      { menuItemId: 'm-8', name: 'Dal Makhani Shahi', hindiName: 'दाल मखनी शाही', price: 340, quantity: 1, isVeg: true },
      { menuItemId: 'm-18', name: 'Garlic Butter Naan', hindiName: 'गार्लिक बटर नान', price: 85, quantity: 3, isVeg: true },
      { menuItemId: 'm-20', name: 'Tandoori Roti (Butter)', hindiName: 'तंदूरी बटर रोटी', price: 45, quantity: 2, isVeg: true }
    ],
    subtotal: 1515,
    cgstRate: 2.5,
    cgstAmount: 37.88,
    sgstRate: 2.5,
    sgstAmount: 37.88,
    discountAmount: 0,
    grandTotal: 1591,
    status: 'SERVED',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    specialInstructions: 'Extra butter on dal makhani'
  },
  {
    id: 'o-3',
    orderNumber: 'ORD-1003',
    type: 'DINE_IN',
    tableNumber: 4,
    tableId: 't-4',
    customerName: 'Sanjay Kapoor',
    customerPhone: '+91 98220 33445',
    items: [
      { menuItemId: 'm-14', name: 'Hyderabadi Dum Chicken Biryani', hindiName: 'हैदराबादी दम मुर्ग बिरयानी', price: 420, quantity: 2, isVeg: false },
      { menuItemId: 'm-3', name: 'Murgh Malai Kebab', hindiName: 'मुर्ग मलाई कबाब', price: 410, quantity: 1, isVeg: false },
      { menuItemId: 'm-22', name: 'Gulab Jamun with Rabdi', hindiName: 'गुलाब जामुन रबड़ी के साथ', price: 190, quantity: 2, isVeg: true }
    ],
    subtotal: 1630,
    cgstRate: 2.5,
    cgstAmount: 40.75,
    sgstRate: 2.5,
    sgstAmount: 40.75,
    discountAmount: 100,
    discountCode: 'ROYAL100',
    grandTotal: 1612,
    status: 'READY',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'o-4',
    orderNumber: 'ORD-1004',
    type: 'DINE_IN',
    tableNumber: 6,
    tableId: 't-6',
    customerName: 'Ananya Mehra',
    customerPhone: '+91 98732 44556',
    items: [
      { menuItemId: 'm-8', name: 'Dal Makhani Shahi', hindiName: 'दाल मखनी शाही', price: 340, quantity: 1, isVeg: true },
      { menuItemId: 'm-15', name: 'Shahi Subz Dum Biryani', hindiName: 'शाही सब्ज़ दम बिरयानी', price: 340, quantity: 1, isVeg: true },
      { menuItemId: 'm-21', name: 'Laccha Paratha Pudina', hindiName: 'पुदीना लच्छा पराठा', price: 75, quantity: 2, isVeg: true }
    ],
    subtotal: 830,
    cgstRate: 2.5,
    cgstAmount: 20.75,
    sgstRate: 2.5,
    sgstAmount: 20.75,
    discountAmount: 0,
    grandTotal: 872,
    status: 'RECEIVED',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    specialInstructions: 'Jain preparation - No Onion No Garlic'
  },
  {
    id: 'o-5',
    orderNumber: 'ORD-1005',
    type: 'DINE_IN',
    tableNumber: 10,
    tableId: 't-10',
    customerName: 'Vikramaditya Roy',
    customerPhone: '+91 98111 22334',
    items: [
      { menuItemId: 'm-6', name: 'Galouti Kebab Awadhi', hindiName: 'गलौटी कबाब अवधी', price: 460, quantity: 2, isVeg: false },
      { menuItemId: 'm-10', name: 'Kashmiri Rogan Josh', hindiName: 'कश्मीरी रोगन जोश', price: 520, quantity: 2, isVeg: false },
      { menuItemId: 'm-18', name: 'Garlic Butter Naan', hindiName: 'गार्लिक बटर नान', price: 85, quantity: 4, isVeg: true },
      { menuItemId: 'm-24', name: 'Shahi Tukda Royal', hindiName: 'शाही टुकड़ा', price: 210, quantity: 2, isVeg: true }
    ],
    subtotal: 2720,
    cgstRate: 2.5,
    cgstAmount: 68.0,
    sgstRate: 2.5,
    sgstAmount: 68.0,
    discountAmount: 200,
    discountCode: 'VIPPLATINUM',
    grandTotal: 2656,
    status: 'SERVED',
    paymentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    specialInstructions: 'VIP Table. Serve with extra mint chutney.'
  },
  {
    id: 'o-6',
    orderNumber: 'ORD-1000',
    type: 'TAKEAWAY',
    customerName: 'Rohit Sharma',
    customerPhone: '+91 98990 11223',
    items: [
      { menuItemId: 'm-7', name: 'Old Delhi Butter Chicken', hindiName: 'बटर चिकन (मुर्ग मखनी)', price: 450, quantity: 1, isVeg: false },
      { menuItemId: 'm-14', name: 'Hyderabadi Dum Chicken Biryani', hindiName: 'हैदराबादी दम मुर्ग बिरयानी', price: 420, quantity: 1, isVeg: false },
      { menuItemId: 'm-18', name: 'Garlic Butter Naan', hindiName: 'गार्लिक बटर नान', price: 85, quantity: 2, isVeg: true }
    ],
    subtotal: 1040,
    cgstRate: 2.5,
    cgstAmount: 26.0,
    sgstRate: 2.5,
    sgstAmount: 26.0,
    discountAmount: 0,
    grandTotal: 1092,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    paymentTransactionId: 'UPI-764982341902',
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  // Reactive Signals for primary data
  readonly menu = signal<MenuItem[]>([]);
  readonly tables = signal<RestaurantTable[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly profile = signal<RestaurantProfile>(DEFAULT_PROFILE);

  // Computed signals
  readonly activeOrders = computed(() => 
    this.orders().filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
  );

  readonly occupiedTablesCount = computed(() => 
    this.tables().filter(t => t.status === 'OCCUPIED' || t.status === 'BILLING').length
  );

  readonly todayRevenue = computed(() => {
    return this.orders()
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);
  });

  readonly totalOrdersCount = computed(() => this.orders().length);

  constructor() {
    this.initDatabase();
  }

  /**
   * Initializes Database from localStorage or seeds it
   */
  private initDatabase(): void {
    try {
      const storedMenu = localStorage.getItem(STORAGE_KEYS.MENU);
      const storedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);

      if (storedMenu && storedTables && storedOrders) {
        this.menu.set(JSON.parse(storedMenu));
        this.tables.set(JSON.parse(storedTables));
        this.orders.set(JSON.parse(storedOrders));
        this.customers.set(storedCustomers ? JSON.parse(storedCustomers) : INITIAL_CUSTOMERS);
        let parsedProfile: RestaurantProfile = storedProfile ? JSON.parse(storedProfile) : DEFAULT_PROFILE;
        if (parsedProfile.name === 'Shahi Rasoi') {
          parsedProfile = {
            ...parsedProfile,
            name: DEFAULT_PROFILE.name,
            hindiName: DEFAULT_PROFILE.hindiName,
            tagline: DEFAULT_PROFILE.tagline,
            email: DEFAULT_PROFILE.email
          };
          this.persist(STORAGE_KEYS.PROFILE, parsedProfile);
        }
        this.profile.set(parsedProfile);
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Error reading from localStorage, initializing with defaults', e);
      this.resetToDefaults();
    }
  }

  private persist(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  resetToDefaults(): void {
    this.menu.set(INITIAL_MENU_ITEMS);
    this.tables.set(INITIAL_TABLES);
    this.orders.set(INITIAL_ORDERS);
    this.customers.set(INITIAL_CUSTOMERS);
    this.profile.set(DEFAULT_PROFILE);

    this.persist(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
    this.persist(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    this.persist(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.persist(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.persist(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  // ===================== MENU CRUD =====================
  addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const newItem: MenuItem = {
      ...item,
      id: 'm-' + (Date.now() % 100000)
    };
    const updated = [newItem, ...this.menu()];
    this.menu.set(updated);
    this.persist(STORAGE_KEYS.MENU, updated);
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): void {
    const updated = this.menu().map(item => item.id === id ? { ...item, ...updates } : item);
    this.menu.set(updated);
    this.persist(STORAGE_KEYS.MENU, updated);
  }

  deleteMenuItem(id: string): void {
    const updated = this.menu().filter(item => item.id !== id);
    this.menu.set(updated);
    this.persist(STORAGE_KEYS.MENU, updated);
  }

  toggleItemAvailability(id: string): void {
    const item = this.menu().find(m => m.id === id);
    if (item) {
      this.updateMenuItem(id, { available: !item.available });
    }
  }

  // ===================== TABLES MANAGEMENT =====================
  updateTableStatus(tableId: string, status: TableStatus, currentOrderId?: string): void {
    const updated = this.tables().map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          status,
          currentOrderId: status === 'AVAILABLE' ? undefined : (currentOrderId ?? table.currentOrderId),
          occupiedSince: status === 'OCCUPIED' ? (table.occupiedSince || 'Just seated') : (status === 'AVAILABLE' ? undefined : table.occupiedSince)
        };
      }
      return table;
    });
    this.tables.set(updated);
    this.persist(STORAGE_KEYS.TABLES, updated);
  }

  reserveTable(tableId: string, reservation: RestaurantTable['reservation']): void {
    const updated = this.tables().map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          status: 'RESERVED' as TableStatus,
          reservation
        };
      }
      return table;
    });
    this.tables.set(updated);
    this.persist(STORAGE_KEYS.TABLES, updated);
  }

  freeTable(tableId: string): void {
    const updated = this.tables().map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          status: 'AVAILABLE' as TableStatus,
          currentOrderId: undefined,
          occupiedSince: undefined,
          reservation: undefined
        };
      }
      return table;
    });
    this.tables.set(updated);
    this.persist(STORAGE_KEYS.TABLES, updated);
  }

  // ===================== ORDERS MANAGEMENT =====================
  createOrder(orderData: {
    type: OrderType;
    tableNumber?: number;
    tableId?: string;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    discountAmount?: number;
    discountCode?: string;
    specialInstructions?: string;
  }): Order {
    const p = this.profile();
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = orderData.discountAmount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const cgstAmount = Math.round((taxableAmount * (p.cgstPercent / 100)) * 100) / 100;
    const sgstAmount = Math.round((taxableAmount * (p.sgstPercent / 100)) * 100) / 100;
    const grandTotal = Math.round(taxableAmount + cgstAmount + sgstAmount);

    const nextNumber = 1000 + this.orders().length + 1;
    const newOrder: Order = {
      id: 'o-' + Date.now(),
      orderNumber: `ORD-${nextNumber}`,
      type: orderData.type,
      tableNumber: orderData.tableNumber,
      tableId: orderData.tableId,
      customerName: orderData.customerName || 'Walk-in Guest',
      customerPhone: orderData.customerPhone || '',
      items: orderData.items,
      subtotal,
      cgstRate: p.cgstPercent,
      cgstAmount,
      sgstRate: p.sgstPercent,
      sgstAmount,
      discountAmount: discount,
      discountCode: orderData.discountCode,
      grandTotal,
      status: 'RECEIVED',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specialInstructions: orderData.specialInstructions
    };

    const updated = [newOrder, ...this.orders()];
    this.orders.set(updated);
    this.persist(STORAGE_KEYS.ORDERS, updated);

    // If dine-in, update table status
    if (orderData.type === 'DINE_IN' && orderData.tableId) {
      this.updateTableStatus(orderData.tableId, 'OCCUPIED', newOrder.orderNumber);
    }

    // Auto record or update customer
    if (orderData.customerPhone) {
      this.recordCustomerActivity(orderData.customerName, orderData.customerPhone, grandTotal);
    }

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const updated = this.orders().map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });
    this.orders.set(updated);
    this.persist(STORAGE_KEYS.ORDERS, updated);
  }

  completeAndPayOrder(orderId: string, method: PaymentMethod, txnId?: string): void {
    let completedOrder: Order | undefined;
    const updated = this.orders().map(o => {
      if (o.id === orderId) {
        completedOrder = {
          ...o,
          status: 'COMPLETED' as OrderStatus,
          paymentStatus: 'PAID' as PaymentStatus,
          paymentMethod: method,
          paymentTransactionId: txnId || `${method}-${Math.floor(100000000 + Math.random() * 900000000)}`,
          updatedAt: new Date().toISOString()
        };
        return completedOrder;
      }
      return o;
    });

    this.orders.set(updated);
    this.persist(STORAGE_KEYS.ORDERS, updated);

    // If linked to a table, mark table as available
    if (completedOrder && completedOrder.tableId) {
      this.freeTable(completedOrder.tableId);
    }
  }

  // ===================== CUSTOMERS CRM =====================
  recordCustomerActivity(name: string, phone: string, billAmount: number): void {
    const existing = this.customers().find(c => c.phone === phone);
    let updated: Customer[];

    if (existing) {
      const newTotalSpent = existing.totalSpent + billAmount;
      const newVisits = existing.totalVisits + 1;
      const tier: CustomerTier = newTotalSpent > 30000 ? 'PLATINUM' : newTotalSpent > 15000 ? 'GOLD' : 'SILVER';
      
      updated = this.customers().map(c => c.id === existing.id ? {
        ...c,
        name: name || c.name,
        totalVisits: newVisits,
        totalSpent: newTotalSpent,
        tier,
        lastVisit: new Date().toISOString().split('T')[0]
      } : c);
    } else {
      const newCustomer: Customer = {
        id: 'c-' + Date.now(),
        name: name || 'Guest',
        phone,
        tier: billAmount > 15000 ? 'GOLD' : 'SILVER',
        totalVisits: 1,
        totalSpent: billAmount,
        dietaryPreference: 'NON_VEG',
        lastVisit: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0]
      };
      updated = [newCustomer, ...this.customers()];
    }

    this.customers.set(updated);
    this.persist(STORAGE_KEYS.CUSTOMERS, updated);
  }

  updateCustomer(id: string, updates: Partial<Customer>): void {
    const updated = this.customers().map(c => c.id === id ? { ...c, ...updates } : c);
    this.customers.set(updated);
    this.persist(STORAGE_KEYS.CUSTOMERS, updated);
  }

  // ===================== PROFILE / SETTINGS =====================
  updateProfile(profile: RestaurantProfile): void {
    this.profile.set(profile);
    this.persist(STORAGE_KEYS.PROFILE, profile);
  }

  // ===================== DATABASE EXPORT / IMPORT =====================
  exportDatabaseJSON(): string {
    const exportObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      restaurant: this.profile(),
      menu: this.menu(),
      tables: this.tables(),
      orders: this.orders(),
      customers: this.customers()
    };
    return JSON.stringify(exportObj, null, 2);
  }

  importDatabaseJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.menu && Array.isArray(data.menu)) {
        this.menu.set(data.menu);
        this.persist(STORAGE_KEYS.MENU, data.menu);
      }
      if (data.tables && Array.isArray(data.tables)) {
        this.tables.set(data.tables);
        this.persist(STORAGE_KEYS.TABLES, data.tables);
      }
      if (data.orders && Array.isArray(data.orders)) {
        this.orders.set(data.orders);
        this.persist(STORAGE_KEYS.ORDERS, data.orders);
      }
      if (data.customers && Array.isArray(data.customers)) {
        this.customers.set(data.customers);
        this.persist(STORAGE_KEYS.CUSTOMERS, data.customers);
      }
      if (data.restaurant) {
        this.profile.set(data.restaurant);
        this.persist(STORAGE_KEYS.PROFILE, data.restaurant);
      }
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  }
}
