// accesorios.js - Funcionalidad para la página de accesorios
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de accesorios cargada");
    
    // Inicializar Session Manager
    if (!window.sessionManager) {
        window.sessionManager = new SessionManager();
    }
    
    // Elementos del DOM
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    const accesorioCards = document.querySelectorAll('.accesorio-card');
    const agregarCarritoBtns = document.querySelectorAll('.btn-agregar-carrito');
    const quickViewBtns = document.querySelectorAll('.quick-view');
    
    // Filtrado por categoría
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            
            // Actualizar botón activo
            filtroBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar/ocultar productos
            accesorioCards.forEach(card => {
                if (categoria === 'todos' || card.getAttribute('data-categoria') === categoria) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
            
            // Scroll suave al principio
            window.scrollTo({
                top: 400,
                behavior: 'smooth'
            });
        });
    });
    
    // Agregar al carrito
    agregarCarritoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            const card = this.closest('.accesorio-card');
            const nombre = card.querySelector('.accesorio-nombre').textContent;
            const precioTexto = card.querySelector('.accesorio-precio').textContent;
            const imagen = card.querySelector('.accesorio-imagen img').src;
            const precio = parseFloat(precioTexto.replace('$', '').replace(',', ''));
            
            const producto = {
                id: productoId,
                nombre: nombre,
                precio: precio,
                imagen: imagen,
                cantidad: 1,
                tipo: 'accesorio'
            };
            
            // Agregar al carrito
            agregarAlCarrito(producto);
            
            // Efecto visual
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
            this.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
            this.disabled = true;
            
            // Mostrar notificación
            if (window.showNotification) {
                window.showNotification(`${nombre} agregado al carrito`, 'success');
            } else {
                alert(`${nombre} agregado al carrito`);
            }
            
            // Restaurar botón después de 2 segundos
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = 'linear-gradient(90deg, #6c63ff, #00f3ff)';
                this.disabled = false;
            }, 2000);
        });
    });
    
    // Vista rápida
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.accesorio-card');
            mostrarVistaRapida(card);
        });
    });
    
    // Inicializar efectos
    inicializarEfectos();
    
    // Actualizar carrito
    actualizarContadorCarrito();
});

// Función para agregar producto al carrito
function agregarAlCarrito(producto) {
    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar si el producto ya existe
        const productoExistente = carrito.find(item => item.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad || 1;
        } else {
            carrito.push(producto);
        }
        
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Disparar evento
        window.dispatchEvent(new Event('carritoActualizado'));
        
        return true;
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        return false;
    }
}

// Función para mostrar vista rápida
function mostrarVistaRapida(card) {
    const nombre = card.querySelector('.accesorio-nombre').textContent;
    const descripcion = card.querySelector('.accesorio-descripcion').textContent;
    const precio = card.querySelector('.accesorio-precio').textContent;
    const imagen = card.querySelector('.accesorio-imagen img').src;
    const categoria = card.querySelector('.accesorio-categoria').textContent;
    const productoId = card.querySelector('.btn-agregar-carrito').getAttribute('data-id');
    
    // Crear modal si no existe
    let modal = document.getElementById('modal-accesorio');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-accesorio';
        modal.className = 'modal-accesorio';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-imagen">
                        <img src="" alt="">
                    </div>
                    <div class="modal-info">
                        <h3 class="modal-nombre"></h3>
                        <div class="modal-categoria"></div>
                        <p class="modal-descripcion"></p>
                        <div class="modal-precio"></div>
                        <button class="modal-agregar">Agregar al Carrito</button>
                        <p class="modal-envio">🚚 Envío gratuito</p>
                        <p class="modal-stock">✅ Disponible</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Estilos para el modal
        const style = document.createElement('style');
        style.textContent = `
            .modal-accesorio {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .modal-accesorio.active {
                display: flex;
            }
            
            .modal-content {
                background: rgba(10, 15, 40, 0.95);
                border-radius: 15px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                border: 1px solid rgba(108, 99, 255, 0.3);
                position: relative;
            }
            
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            .modal-imagen img {
                width: 100%;
                border-radius: 10px;
            }
            
            .modal-nombre {
                color: white;
                font-size: 1.5rem;
                margin-bottom: 10px;
            }
            
            .modal-categoria {
                color: #6c63ff;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .modal-descripcion {
                color: #a0a0c0;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            
            .modal-precio {
                color: #00f3ff;
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 20px;
            }
            
            .modal-agregar {
                width: 100%;
                padding: 15px;
                background: linear-gradient(90deg, #6c63ff, #00f3ff);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 15px;
            }
            
            .modal-envio, .modal-stock {
                color: #a0a0c0;
                font-size: 0.9rem;
                margin-bottom: 5px;
            }
            
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Evento para cerrar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Evento para agregar desde modal
        modal.querySelector('.modal-agregar').addEventListener('click', function() {
            const producto = {
                id: productoId,
                nombre: nombre,
                precio: parseFloat(precio.replace('$', '').replace(',', '')),
                imagen: imagen,
                cantidad: 1,
                tipo: 'accesorio'
            };
            
            agregarAlCarrito(producto);
            
            // Efecto visual
            const originalText = this.textContent;
            this.textContent = '¡Agregado!';
            this.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
            this.disabled = true;
            
            // Mostrar notificación
            if (window.showNotification) {
                window.showNotification(`${nombre} agregado al carrito`, 'success');
            }
            
            // Cerrar modal después de 1 segundo
            setTimeout(() => {
                modal.classList.remove('active');
                this.textContent = originalText;
                this.style.background = 'linear-gradient(90deg, #6c63ff, #00f3ff)';
                this.disabled = false;
            }, 1000);
        });
    }
    
    // Actualizar contenido del modal
    modal.querySelector('.modal-nombre').textContent = nombre;
    modal.querySelector('.modal-categoria').textContent = categoria;
    modal.querySelector('.modal-descripcion').textContent = descripcion;
    modal.querySelector('.modal-precio').textContent = precio;
    modal.querySelector('.modal-imagen img').src = imagen;
    modal.querySelector('.modal-imagen img').alt = nombre;
    
    // Mostrar modal
    modal.classList.add('active');
}

// Inicializar efectos visuales
function inicializarEfectos() {
    // Efecto de aparición para las tarjetas
    const cards = document.querySelectorAll('.accesorio-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Validar imágenes
    const images = document.querySelectorAll('.accesorio-imagen img');
    const placeholder = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    images.forEach(img => {
        img.onerror = function() {
            this.src = placeholder;
        };
    });
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    } catch (error) {
        console.error('Error actualizando contador:', error);
    }
}

// Escuchar eventos del carrito
window.addEventListener('carritoActualizado', actualizarContadorCarrito);
window.addEventListener('storage', function(e) {
    if (e.key === 'carrito') {
        actualizarContadorCarrito();
    }
});