// carrito.js - VERSIÓN SIMPLIFICADA - SIN MODALES
document.addEventListener('DOMContentLoaded', function () {
    console.log("=== CARRITO.JS CARGADO ===");

    // ===================================================================
    // ELEMENTOS DEL DOM
    // ===================================================================
    const cartItemsContainer = document.getElementById('carritoItems');
    const cartTotalElement = document.getElementById('totalCompra');
    const cartSubtotalElement = document.getElementById('subtotal');
    const cartEmptyMessage = document.getElementById('carritoVacio');
    const cartContent = document.getElementById('carritoContenido');
    const clearCartButton = document.getElementById('btnVaciarCarrito');
    const checkoutButton = document.getElementById('btnPagar');
    const cartCountElement = document.getElementById('cartCount');
    const totalItemsElement = document.getElementById('totalItems');

    // Elementos del resumen principal
    const filaDescuentoResumen = document.getElementById('filaDescuentoResumen');
    const descuentoElement = document.getElementById('descuento');

    // ===================================================================
    // CONSTANTES Y VARIABLES
    // ===================================================================
    const DESCUENTO_POR_CANTIDAD = 0.10; // 10% de descuento por más de 3 productos

    // ===================================================================
    // FUNCIONES PRINCIPALES
    // ===================================================================

    // Obtener usuario actual
    function getUser() {
        try {
            // Intentar con sessionManager primero
            if (window.sessionManager && window.sessionManager.getUser()) {
                return window.sessionManager.getUser();
            }

            // Fallback a localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.loggedIn) {
                return user;
            }

            // Intentar otros formatos
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (currentUser && isLoggedIn) {
                return {
                    name: currentUser.name || currentUser.email.split('@')[0],
                    email: currentUser.email,
                    loggedIn: true
                };
            }

            return null;
        } catch (error) {
            console.error("Error obteniendo usuario:", error);
            return null;
        }
    }

    // Mostrar productos del carrito
    function mostrarCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        if (carrito.length === 0) {
            // Mostrar mensaje de carrito vacío
            if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            if (cartTotalElement) cartTotalElement.textContent = '$0.00';
            if (cartSubtotalElement) cartSubtotalElement.textContent = '$0.00';
            if (totalItemsElement) totalItemsElement.textContent = '0 productos';
            if (filaDescuentoResumen) filaDescuentoResumen.style.display = 'none';
            return;
        }

        // Ocultar mensaje de carrito vacío
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';

        // Limpiar contenedor
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';

            let subtotal = 0;
            let cantidadTotal = 0;

            carrito.forEach((producto, index) => {
                const productoSubtotal = producto.precio * producto.cantidad;
                subtotal += productoSubtotal;
                cantidadTotal += producto.cantidad;

                const itemElement = document.createElement('div');
                itemElement.className = 'carrito-item';
                itemElement.innerHTML = `
                    <div class="carrito-item-imagen">
                        <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Producto'">
                    </div>
                    <div class="carrito-item-info">
                        <h3 class="carrito-item-nombre">${producto.nombre}</h3>
                        <p class="carrito-item-precio">$${producto.precio.toFixed(2)}</p>
                        <div class="carrito-item-cantidad">
                            <button class="cantidad-btn minus" data-index="${index}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cantidad-value">${producto.cantidad}</span>
                            <button class="cantidad-btn plus" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="carrito-item-subtotal">
                        $${productoSubtotal.toFixed(2)}
                    </div>
                    <button class="carrito-item-eliminar" data-index="${index}" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                cartItemsContainer.appendChild(itemElement);
            });

            // Calcular descuento
            let descuento = 0;
            if (cantidadTotal > 3) {
                descuento = subtotal * DESCUENTO_POR_CANTIDAD;
            }

            // Calcular total (subtotal - descuento) - ENVÍO GRATIS
            const total = subtotal - descuento;

            // Actualizar resumen principal
            if (cartSubtotalElement) cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
            if (totalItemsElement) totalItemsElement.textContent = `${cantidadTotal} ${cantidadTotal === 1 ? 'producto' : 'productos'}`;

            // Mostrar/ocultar fila de descuento en resumen principal
            if (filaDescuentoResumen) {
                if (cantidadTotal > 3) {
                    filaDescuentoResumen.style.display = 'flex';
                    if (descuentoElement) {
                        descuentoElement.textContent = `-$${descuento.toFixed(2)}`;
                    }
                } else {
                    filaDescuentoResumen.style.display = 'none';
                }
            }

            // Configurar eventos para los botones
            configurarEventosCarrito();
        }
    }

    // Configurar eventos de los elementos del carrito
    function configurarEventosCarrito() {
        // Botones de cantidad (-)
        document.querySelectorAll('.cantidad-btn.minus').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad -= 1;
                } else {
                    carrito.splice(index, 1);
                }

                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Carrito actualizado');
            });
        });

        // Botones de cantidad (+)
        document.querySelectorAll('.cantidad-btn.plus').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                carrito[index].cantidad += 1;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Carrito actualizado');
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.carrito-item-eliminar').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                carrito.splice(index, 1);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Producto eliminado');
            });
        });
    }

    // Función para calcular subtotal
    function calcularSubtotal() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let subtotal = 0;
        carrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
        });
        return subtotal;
    }

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje) {
        // Crear notificación simple
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(52, 152, 219, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        notificacion.innerHTML = `<i class="fas fa-info-circle"></i> ${mensaje}`;
        document.body.appendChild(notificacion);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
        
        // Agregar estilos de animación si no existen
        if (!document.querySelector('#notificacion-styles')) {
            const style = document.createElement('style');
            style.id = 'notificacion-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Actualizar contador del carrito
    function actualizarContador() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let totalProductos = 0;
        carrito.forEach(item => {
            totalProductos += item.cantidad || 1;
        });

        if (cartCountElement) {
            cartCountElement.textContent = totalProductos;
        }
    }

    // ===================================================================
    // FUNCIÓN PRINCIPAL PARA PROCEDER AL PAGO
    // ===================================================================
    function procederAlPago() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // 1. Verificar que haya productos en el carrito
        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito está vacío');
            return;
        }

        // 2. Calcular totales
        const subtotal = calcularSubtotal();
        const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
        
        let descuento = 0;
        if (totalProductos > 3) {
            descuento = subtotal * DESCUENTO_POR_CANTIDAD;
        }
        
        const totalFinal = subtotal - descuento;

        // 3. Obtener información del usuario
        const user = getUser();
        
        // 4. Guardar datos del pedido
        const purchaseData = {
            carrito: carrito,
            subtotal: subtotal,
            descuento: descuento,
            total: totalFinal,
            cantidadTotal: totalProductos,
            timestamp: new Date().toISOString(),
            cliente: user ? {
                name: user.name || user.email.split('@')[0],
                email: user.email
            } : null
        };

        localStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
        console.log("Datos del pedido guardados:", purchaseData);

        // 5. Redirigir directamente a la página de factura
        window.location.href = 'factura-pedido.html';
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================

    // Botón para vaciar carrito
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                localStorage.setItem('carrito', JSON.stringify([]));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Carrito vaciado');
            }
        });
    }

    // Botón para proceder al pago - REDIRIGE DIRECTAMENTE
    if (checkoutButton) {
        checkoutButton.addEventListener('click', procederAlPago);
    }

    // ===================================================================
    // INICIALIZACIÓN
    // ===================================================================

    // Mostrar carrito inicial
    mostrarCarrito();

    // Escuchar actualizaciones del carrito
    window.addEventListener('carritoActualizado', mostrarCarrito);
    window.addEventListener('carritoActualizado', actualizarContador);
    window.addEventListener('storage', function (e) {
        if (e.key === 'carrito') {
            mostrarCarrito();
            actualizarContador();
        }
    });

    // Actualizar contador inicial
    actualizarContador();

    console.log("=== CARRITO.JS INICIALIZADO CORRECTAMENTE ===");
});