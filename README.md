Gestor de gastos



Aplicación web para registrar, consultar, editar y eliminar gastos mensuales. Permite organizar los gastos por categorías y consultar un resumen de los registros.



Tecnologías utilizadas



React



TypeScript



NestJS



SQLite



TypeORM



CSS



Requisitos



Node.js



npm



Instalación



1\. Clonar el repositorio



git clone https://github.com/Karoline-7/Gastos-app.git

cd Gastos-app



2\. Iniciar el backend



cd backend

npm install

npm run start:dev



El backend funciona en http://localhost:3000.



3\. Iniciar el frontend



Abrir otra terminal:



cd frontend

npm install

npm run dev



Abrir http://localhost:5173 en el navegador.



Funcionalidades



Registrar gastos.



Consultar, editar y eliminar gastos.



Crear y asignar categorías.



Buscar gastos por descripción.



Filtrar por categoría.



Ordenar por fecha, monto, descripción y categoría.



Navegar entre páginas de resultados.



Validar los datos ingresados.



Evitar gastos duplicados.



Consultar el total y la cantidad de gastos registrados.



API



Método



Ruta



Función



GET



/gastos



Listar gastos



POST



/gastos



Crear gasto



PUT



/gastos/:id



Actualizar gasto



DELETE



/gastos/:id



Eliminar gasto



GET



/categorias



Listar categorías



POST



/categorias



Crear categoría



Repositorio



https://github.com/Karoline-7/Gastos-app

