// session-manager.js - Con memoria de compra pendiente
class SessionManager {
    constructor() {
        this.currentUser = null;
        this.pendingPurchase = null;
        this.init();
    }
    
    init() {
        this.loadUser();
        this.loadPendingPurchase();
        this.setupEventListeners();
        this.setupNavbar();
    }
    
    loadUser() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.currentUser = null;
        }
    }
    
    loadPendingPurchase() {
        try {
            const pending = localStorage.getItem('pendingPurchase');
            if (pending) {
                this.pendingPurchase = JSON.parse(pending);
                console.log("Compra pendiente encontrada:", this.pendingPurchase);
            }
        } catch (error) {
            console.error('Error loading pending purchase:', error);
            this.pendingPurchase = null;
        }
    }
    
    isLoggedIn() {
        return this.currentUser && this.currentUser.loggedIn === true;
    }
    
    getUser() {
        return this.currentUser;
    }
    
    hasPendingPurchase() {
        return this.pendingPurchase !== null;
    }
    
    getPendingPurchase() {
        return this.pendingPurchase;
    }
    
    setPendingPurchase(purchaseData) {
        this.pendingPurchase = purchaseData;
        localStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
        console.log("Compra pendiente guardada:", purchaseData);
    }
    
    clearPendingPurchase() {
        this.pendingPurchase = null;
        localStorage.removeItem('pendingPurchase');
        console.log("Compra pendiente eliminada");
    }
    
    login(userData) {
        const user = {
            name: userData.name || userData.email.split('@')[0],
            email: userData.email,
            loggedIn: true,
            lastLogin: new Date().toISOString(),
            id: userData.id || 'user_' + Date.now()
        };
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        this.currentUser = user;
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { user, action: 'login' } 
        }));
        
        // Verificar si hay compra pendiente y redirigir
        this.checkAndRedirectToPurchase();
        
        return user;
    }
    
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('rememberedEmail');
        this.clearPendingPurchase();
        
        this.currentUser = null;
        
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { user: null, action: 'logout' } 
        }));
    }
    
    checkAndRedirectToPurchase() {
        if (this.hasPendingPurchase() && window.location.pathname.includes('sesion.html')) {
            console.log("Usuario logueado con compra pendiente, redirigiendo...");
            
            setTimeout(() => {
                // Redirigir a carrito.html con parámetro para abrir modal
                window.location.href = 'carrito.html?openModal=true';
            }, 500);
        }
    }
    
    setupNavbar() {
        setTimeout(() => this.updateNavbar(), 100);
        window.addEventListener('authStateChanged', () => this.updateNavbar());
    }
    
    updateNavbar() {
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const btnLogout = document.getElementById('btnLogout');
        
        if (!authButtons || !userInfo) return;
        
        if (this.isLoggedIn()) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            
            if (btnLogout) {
                btnLogout.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                };
            }
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }
    
    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'user' || e.key === 'currentUser' || e.key === 'isLoggedIn') {
                this.loadUser();
                this.updateNavbar();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btnLogout')) {
                e.preventDefault();
                this.logout();
            }
        });
    }
    
    // Métodos estáticos
    static login(userData) {
        return window.sessionManager.login(userData);
    }
    
    static logout() {
        return window.sessionManager.logout();
    }
    
    static isLoggedIn() {
        return window.sessionManager.isLoggedIn();
    }
    
    static getUser() {
        return window.sessionManager.getUser();
    }
    
    static setPendingPurchase(purchaseData) {
        return window.sessionManager.setPendingPurchase(purchaseData);
    }
    
    static hasPendingPurchase() {
        return window.sessionManager.hasPendingPurchase();
    }
    
    static clearPendingPurchase() {
        return window.sessionManager.clearPendingPurchase();
    }
}

// Inicializar singleton
window.sessionManager = new SessionManager();