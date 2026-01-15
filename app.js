/* ============================================
   إعدادات عامة
============================================ */
let allProducts = [];
let visibleProducts = [];
let cart = [];

let pricesVisible = false;
let currentPassword = null;

/* كلمات السر */
const PASSWORDS = {
    "2525": { name: "السعر الأصلي", increase: 0 },
    "2028": { name: "زيادة 4", increase: 4 },
    "2026": { name: "زيادة 30", increase: 30 }
};

/* عناصر DOM */
const productsView = document.getElementById("productsView");
const categoriesBar = document.getElementById("categoriesBar");
const searchInput = document.getElementById("searchInput");
const cartCount = document.getElementById("cartCount");


/* ============================================
   تحميل البيانات من Google Script
============================================ */
async function loadProducts() {
    try {
        updateLoading("جاري تحميل المنتجات...");

        const response = await fetch("YOUR_GOOGLE_SCRIPT_URL_HERE");
        const data = await response.json();

        allProducts = data.data;  // على حسب رجوع السكربت
        visibleProducts = allProducts;

        renderCategories();
        renderProducts();

        hideLoading();

    } catch (error) {
        console.log("خطأ في تحميل البيانات:", error);
        updateLoading("تعذر التحميل! تأكد من الاتصال.");
    }
}


/* ============================================
   شاشة التحميل
============================================ */
function updateLoading(text) {
    document.getElementById("loading-status").innerText = text;
}

function hideLoading() {
    document.getElementById("initial-loading").style.display = "none";
    document.getElementById("mainPage").style.display = "block";
}


/* ============================================
   عرض الأقسام
============================================ */
function renderCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))];

    categoriesBar.innerHTML = "";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.innerText = cat;
        btn.onclick = () => filterByCategory(cat);
        categoriesBar.appendChild(btn);
    });

    // زر كل المنتجات
    const allBtn = document.createElement("button");
    allBtn.className = "category-btn";
    allBtn.innerText = "كل المنتجات";
    allBtn.onclick = () => showAllProducts();
    categoriesBar.appendChild(allBtn);
}

function showAllProducts() {
    visibleProducts = allProducts;
    renderProducts();
}


/* ============================================
   عرض المنتجات
============================================ */
function renderProducts() {
    productsView.innerHTML = "";

    visibleProducts.forEach((p, index) => {

        const priceToShow = getPrice(p.price, p.name);

        const el = document.createElement("div");
        el.className = "product-card";

        el.innerHTML = `
            <img src="${p.image}" onerror="this.src='fallback.png'">
            <h3>${p.name}</h3>
            <p>${pricesVisible ? priceToShow + " جنيه" : "اضغط لعرض السعر"}</p>
            <button onclick="addToCart(${index})">إضافة للسلة</button>
        `;

        productsView.appendChild(el);
    });
}


/* ============================================
   فلترة حسب القسم
============================================ */
function filterByCategory(cat) {
    visibleProducts = allProducts.filter(p => p.category === cat);
    renderProducts();
}


/* ============================================
   البحث
============================================ */
searchInput.addEventListener("input", () => {
    const text = searchInput.value.trim();

    visibleProducts = allProducts.filter(p =>
        p.name.includes(text) || p.category.includes(text)
    );

    renderProducts();
});


/* ============================================
   حساب السعر بعد الزيادة
============================================ */
function getPrice(originalPrice, name) {
    if (!pricesVisible || !currentPassword) return originalPrice;

    const config = PASSWORDS[currentPassword];
    if (!config) return originalPrice;

    // لو المنتج عليه نجمة * → بدون زيادة
    if (name.includes("*")) return originalPrice;

    return Number(originalPrice) + Number(config.increase);
}


/* ============================================
   نظام كلمة السر لعرض الأسعار
============================================ */
document.getElementById("passwordSubmitBtn").onclick = checkPassword;

function checkPassword() {
    const input = document.getElementById("passwordInput").value.trim();

    if (PASSWORDS[input]) {
        pricesVisible = true;
        currentPassword = input;

        closePasswordModal();
        renderProducts();

        alert("✔ تم تفعيل عرض الأسعار: " + PASSWORDS[input].name);

    } else {
        alert("❌ كلمة سر غير صحيحة");
    }
}


/* ============================================
   السلة
============================================ */
function addToCart(index) {
    const item = visibleProducts[index];
    cart.push(item);
    cartCount.innerText = cart.length;
}


/* ============================================
   فتح وإغلاق المودالات
============================================ */
function closePasswordModal() {
    document.getElementById("passwordModal").style.display = "none";
}

function closeTotalModal() {
    document.getElementById("totalModal").style.display = "none";
}


/* ============================================
   عند التشغيل
============================================ */
loadProducts();
