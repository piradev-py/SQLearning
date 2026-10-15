-- Faro · datos de la etapa 1 (generado por herramientas/generar-datos.mjs; no editar a mano)

CREATE TABLE tiendas (
  id integer PRIMARY KEY,
  ciudad text NOT NULL,
  apertura date NOT NULL
);

CREATE TABLE empleados (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  departamento text NOT NULL,
  tienda_id integer REFERENCES tiendas (id),
  email text NOT NULL UNIQUE
);

CREATE TABLE productos (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL,
  precio numeric(8, 2) NOT NULL,
  stock integer NOT NULL,
  proveedor text NOT NULL,
  activo boolean NOT NULL DEFAULT TRUE,
  creado date NOT NULL
);

INSERT INTO tiendas (id, ciudad, apertura) VALUES
  (1, 'Madrid', '1998-05-04'),
  (2, 'Valencia', '2004-09-20'),
  (3, 'Sevilla', '2009-02-11'),
  (4, 'Bilbao', '2014-06-02'),
  (5, 'Online', '2017-11-15');

INSERT INTO empleados (id, nombre, departamento, tienda_id, email) VALUES
  (1, 'Ana Beltrán', 'Dirección', 1, 'ana.beltran@faro.example'),
  (2, 'Lucía Mora', 'Datos', 1, 'lucia.mora@faro.example'),
  (3, 'Marcos Gil', 'Atención al cliente', 5, 'marcos.gil@faro.example'),
  (4, 'Elena Ruiz', 'Ventas', 1, 'elena.ruiz@faro.example'),
  (5, 'Héctor Vidal', 'Logística', 1, 'hector.vidal@faro.example'),
  (6, 'Nuria Campos', 'Sistemas', 1, 'nuria.campos@faro.example'),
  (7, 'Iván Soler', 'Sistemas', 1, 'ivan.soler@faro.example'),
  (8, 'Pablo Herrero', 'Tienda', 1, 'pablo.herrero@faro.example'),
  (9, 'Carmen Llorente', 'Tienda', 1, 'carmen.llorente@faro.example'),
  (10, 'Jorge Navarro', 'Tienda', 2, 'jorge.navarro@faro.example'),
  (11, 'Sara Ferrer', 'Tienda', 2, 'sara.ferrer@faro.example'),
  (12, 'Raúl Domínguez', 'Tienda', 3, 'raul.dominguez@faro.example'),
  (13, 'Inés Romero', 'Tienda', 3, 'ines.romero@faro.example'),
  (14, 'Aitor Etxeberria', 'Tienda', 4, 'aitor.etxeberria@faro.example'),
  (15, 'Maite Urquijo', 'Tienda', 4, 'maite.urquijo@faro.example'),
  (16, 'Diego Castaño', 'Atención al cliente', 5, 'diego.castano@faro.example'),
  (17, 'Laura Peña', 'Atención al cliente', 5, 'laura.pena@faro.example'),
  (18, 'Óscar Medina', 'Logística', 1, 'oscar.medina@faro.example'),
  (19, 'Beatriz Soto', 'Logística', 1, 'beatriz.soto@faro.example'),
  (20, 'Tomás Rivas', 'Ventas', 2, 'tomas.rivas@faro.example'),
  (21, 'Claudia Reyes', 'Ventas', 3, 'claudia.reyes@faro.example'),
  (22, 'Rubén Ortega', 'Datos', 1, 'ruben.ortega@faro.example');

INSERT INTO productos (id, nombre, categoria, precio, stock, proveedor, activo, creado) VALUES
  (1, 'Portátil Lumen 14', 'Informática', 749, 19, 'Lumen', TRUE, '2021-08-19'),
  (2, 'Portátil Lumen 16 Pro', 'Informática', 1199, 42, 'Lumen', TRUE, '2024-05-30'),
  (3, 'Monitor Nexo 24"', 'Informática', 159.9, 85, 'Nexo', TRUE, '2022-12-06'),
  (4, 'Monitor Nexo 27" 4K', 'Informática', 329, 20, 'Nexo', TRUE, '2023-04-18'),
  (5, 'Teclado Kairos Mecánico', 'Informática', 89.9, 81, 'Kairos', TRUE, '2022-07-26'),
  (6, 'Ratón Kairos Inalámbrico', 'Informática', 29.9, 91, 'Kairos', TRUE, '2020-05-10'),
  (7, 'Disco SSD Volta 1 TB', 'Informática', 74.95, 17, 'Volta', TRUE, '2021-02-22'),
  (8, 'Disco SSD Volta 2 TB', 'Informática', 139, 108, 'Volta', TRUE, '2024-04-05'),
  (9, 'Webcam Lumen HD', 'Informática', 49.9, 0, 'Lumen', FALSE, '2023-12-20'),
  (10, 'Smartphone Nexo A5', 'Telefonía', 279, 78, 'Nexo', TRUE, '2020-01-02'),
  (11, 'Smartphone Nexo A9 Pro', 'Telefonía', 699, 114, 'Nexo', TRUE, '2019-05-06'),
  (12, 'Funda Brisa Silicona', 'Telefonía', 14.9, 82, 'Brisa', TRUE, '2021-01-05'),
  (13, 'Cargador Volta 30 W', 'Telefonía', 24.9, 46, 'Volta', TRUE, '2019-04-12'),
  (14, 'Cargador Volta 65 W', 'Telefonía', 44.9, 55, 'Volta', TRUE, '2020-07-02'),
  (15, 'Batería externa Volta 20000', 'Telefonía', 39.9, 119, 'Volta', TRUE, '2023-09-06'),
  (16, 'Smartwatch Nexo Fit', 'Telefonía', 199, 114, 'Nexo', TRUE, '2022-04-27'),
  (17, 'Auriculares Sonora Pulse', 'Audio', 129, -12, 'Sonora', TRUE, '2019-08-19'),
  (18, 'Auriculares Sonora Air', 'Audio', 79.9, 108, 'Sonora', TRUE, '2024-10-05'),
  (19, 'Altavoz Sonora Mini', 'Audio', 34.9, 97, 'Sonora', TRUE, '2024-09-25'),
  (20, 'Altavoz Sonora Boom', 'Audio', 149, 69, 'Sonora', TRUE, '2021-01-05'),
  (21, 'Barra de sonido Sonora 300', 'Audio', 249, 21, 'Sonora', TRUE, '2024-02-27'),
  (22, 'Tocadiscos Brisa Vintage', 'Audio', 119, 0, 'Brisa', FALSE, '2023-10-06'),
  (23, 'Micrófono Kairos Stream', 'Audio', 69.9, 96, 'Kairos', TRUE, '2021-05-02'),
  (24, 'Robot aspirador Brisa R5', 'Hogar', 299, 4, 'Brisa', TRUE, '2019-03-23'),
  (25, 'Cafetera Brisa Espresso', 'Hogar', 189, 70, 'Brisa', TRUE, '2021-03-03'),
  (26, 'Freidora de aire Brisa 5 L', 'Hogar', 99.9, 113, 'Brisa', TRUE, '2021-11-27'),
  (27, 'Bombilla Lumen Smart', 'Hogar', 12.9, 42, 'Lumen', TRUE, '2024-08-03'),
  (28, 'Enchufe Lumen Smart', 'Hogar', 15.9, 8, 'Lumen', TRUE, '2021-04-26'),
  (29, 'Termostato Lumen Eco', 'Hogar', 129, 0, 'Lumen', FALSE, '2023-01-31'),
  (30, 'Purificador Brisa Aire', 'Hogar', 159, 34, 'Brisa', TRUE, '2021-05-12'),
  (31, 'Consola Kairos One', 'Gaming', 449, 52, 'Kairos', TRUE, '2023-10-26'),
  (32, 'Mando Kairos Pro', 'Gaming', 69.9, 93, 'Kairos', TRUE, '2021-07-20'),
  (33, 'Auriculares gaming Sonora X', 'Gaming', 99.9, 107, 'Sonora', TRUE, '2023-03-18'),
  (34, 'Silla gaming Kairos Throne', 'Gaming', 259, 97, 'Kairos', TRUE, '2022-11-20'),
  (35, 'Alfombrilla Kairos XL', 'Gaming', 19.9, 38, 'Kairos', TRUE, '2020-05-21'),
  (36, 'Volante Kairos Racing', 'Gaming', 219, 0, 'Kairos', FALSE, '2021-01-30'),
  (37, 'Tarjeta gráfica Volta RX', 'Gaming', 549, 91, 'Volta', TRUE, '2021-12-27'),
  (38, 'Monitor gaming Nexo 165 Hz', 'Gaming', 279, 60, 'Nexo', TRUE, '2023-10-05'),
  (39, 'Router Nexo WiFi 6', 'Informática', 89, 64, 'Nexo', TRUE, '2019-10-18'),
  (40, 'Impresora Lumen Jet', 'Informática', 119, 72, 'Lumen', TRUE, '2023-10-18');
