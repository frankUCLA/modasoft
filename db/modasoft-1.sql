-- ----------------------------------------------------
-- Esquema SQL para modasoft_db
-- Importa este archivo en phpMyAdmin o usando la consola MySQL
-- ----------------------------------------------------

-- 1. ROLES DE USUARIO (ADMINISTRADOR Y CAJA)
CREATE TABLE IF NOT EXISTS Roles (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: Administrador, Caja/Empleado'
);

-- Inserta los roles iniciales
INSERT IGNORE INTO Roles (nombre_rol) VALUES ('Administrador'), ('Caja/Empleado');

-- 2. USUARIOS (CUENTAS DE ACCESO)
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada (debe usarse hashing)',
    id_rol INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- 3. CATEGORIAS DE PRODUCTOS
CREATE TABLE IF NOT EXISTS Categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 4. TALLAS
CREATE TABLE IF NOT EXISTS Tallas (
    id_talla INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(10) NOT NULL UNIQUE
);

-- 5. PRODUCTOS
CREATE TABLE IF NOT EXISTS Productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10, 2) NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- 6. INVENTARIO (Stock por Talla/Producto)
CREATE TABLE IF NOT EXISTS Inventario (
    id_inventario INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT NOT NULL,
    id_talla INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    costo_promedio DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Costo para cálculo de utilidad',
    UNIQUE KEY uk_inventario (id_producto, id_talla),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_talla) REFERENCES Tallas(id_talla)
);

-- 7. CLIENTES
CREATE TABLE IF NOT EXISTS Clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100)
);

-- 8. VENTAS (FACTURAS)
CREATE TABLE IF NOT EXISTS Ventas (
    id_venta INT PRIMARY KEY AUTO_INCREMENT,
    fecha_hora DATETIME NOT NULL,
    total_venta DECIMAL(10, 2) NOT NULL,
    tipo_pago VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL COMMENT 'Usuario de caja que realizó la venta',
    id_cliente INT COMMENT 'Puede ser NULL para ventas anónimas',
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
);

-- 9. DETALLE DE VENTA (ITEMS DE LA FACTURA)
CREATE TABLE IF NOT EXISTS DetalleVenta (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    id_talla INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_talla) REFERENCES Tallas(id_talla)
);

-- 10. DEVOLUCIONES
CREATE TABLE IF NOT EXISTS Devoluciones (
    id_devolucion INT PRIMARY KEY AUTO_INCREMENT,
    id_detalle INT NOT NULL COMMENT 'El item de la venta original',
    fecha_hora DATETIME NOT NULL,
    cantidad INT NOT NULL,
    monto_reembolsado DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_detalle) REFERENCES DetalleVenta(id_detalle)
);

-- 11. PROVEEDORES
CREATE TABLE IF NOT EXISTS Proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(150),
    telefono VARCHAR(20)
);

-- 12. COMPRAS (ORDENES DE COMPRA A PROVEEDORES)
CREATE TABLE IF NOT EXISTS Compras (
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_proveedor INT NOT NULL,
    fecha_compra DATE NOT NULL,
    total_compra DECIMAL(10, 2) NOT NULL,
    estado_pago VARCHAR(50) NOT NULL COMMENT 'Pagada, Pendiente, Parcial',
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor)
);

-- 13. DETALLE DE COMPRA
CREATE TABLE IF NOT EXISTS DetalleCompra (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    id_talla INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES Compras(id_compra),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_talla) REFERENCES Tallas(id_talla)
);

-- 14. MOVIMIENTOS DE CAJA (Contabilidad y Conciliación)
CREATE TABLE IF NOT EXISTS MovimientosCaja (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    fecha_hora DATETIME NOT NULL,
    tipo_movimiento VARCHAR(50) NOT NULL COMMENT 'INGRESO_VENTA, EGRESO_COMPRA, EGRESO_GASTO, AJUSTE_DEPOSITO, etc.',
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    referencia_id INT COMMENT 'ID de la Venta/Compra que generó el movimiento',
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
