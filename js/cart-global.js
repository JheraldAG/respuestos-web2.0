
// cart-global.js - Script global para sincronizar el carrito en todas las páginas
document.addEventListener('DOMContentLoaded', function() {
    // Función para actualizar el contador del carrito
    function actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const elementosContador = document.querySelectorAll('.cart-count');
        
        // Calcular cantidad total de productos
        let totalProductos = 0;
        carrito.forEach(item => {
            totalProductos += item.cantidad || 1;
        });
        
        // Actualizar todos los contadores en la página
        elementosContador.forEach(elemento => {
            const contadorAnterior = parseInt(elemento.textContent) || 0;
            elemento.textContent = totalProductos;
            
            // Efecto visual cuando cambia
            if (totalProductos > contadorAnterior) {
                elemento.classList.add('pulse');
                setTimeout(() => {
                    elemento.classList.remove('pulse');
                }, 300);
            }
        });
    }
    
    // Inicializar contador
    actualizarContadorCarrito();
    
    // Escuchar cambios en el localStorage (de otras pestañas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            actualizarContadorCarrito();
        }
    });
    
    // Evento personalizado para actualizar desde el mismo navegador
    window.addEventListener('carritoActualizado', actualizarContadorCarrito);
    
    // Inicializar carrito si no existe
    if (!localStorage.getItem('carrito')) {
        localStorage.setItem('carrito', JSON.stringify([]));
    }
});

// Funciones globales disponibles para todas las páginas
window.Carrito = {
    // Obtener carrito actual
    obtenerCarrito: function() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    },
    
    // Agregar producto al carrito
    agregarProducto: function(producto) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar si el producto ya existe
        const productoExistente = carrito.find(item => item.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad || 1;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: producto.cantidad || 1
            });
        }
        
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Disparar evento para actualizar contadores
        window.dispatchEvent(new Event('carritoActualizado'));
        
        return carrito;
    },
    
    // Actualizar cantidad de un producto
    actualizarCantidad: function(productoId, nuevaCantidad) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const productoIndex = carrito.findIndex(item => item.id === productoId);
        
        if (productoIndex !== -1) {
            if (nuevaCantidad <= 0) {
                carrito.splice(productoIndex, 1);
            } else {
                carrito[productoIndex].cantidad = nuevaCantidad;
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            window.dispatchEvent(new Event('carritoActualizado'));
            return true;
        }
        
        return false;
    },
    
    // Eliminar producto del carrito
    eliminarProducto: function(productoId) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        window.dispatchEvent(new Event('carritoActualizado'));
        return carrito;
    },
    
    // Vaciar carrito
    vaciarCarrito: function() {
        localStorage.setItem('carrito', JSON.stringify([]));
        window.dispatchEvent(new Event('carritoActualizado'));
    },
    
    // Calcular total del carrito
    calcularTotal: function() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let total = 0;
        carrito.forEach(item => {
            total += item.precio * item.cantidad;
        });
        return total;
    },
    
    // Obtener cantidad total de productos
    obtenerCantidadTotal: function() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let total = 0;
        carrito.forEach(item => {
            total += item.cantidad || 1;
        });
        return total;
    }
};