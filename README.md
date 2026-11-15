\# Gestor de gastos mensuales



Aplicación web full-stack para registrar, visualizar y gestionar gastos.



\## Tecnologías



\- \*\*Frontend:\*\* React + TypeScript (Vite)

\- \*\*Backend:\*\* NestJS + TypeScript

\- \*\*Base de datos:\*\* SQLite (con TypeORM y sql.js; se crea sola, no hay que instalar nada)



\## Requisitos



\- Node.js 20 o superior

\- npm



\## Cómo ejecutarla



1\. Clonar el repositorio:



```bash

git clone https://github.com/Karoline-7/Gastos-app.git

cd Gastos-app

```



2\. Backend (terminal 1):



```bash

cd backend

npm install

npm run start:dev

```



La API queda en `http://localhost:3000`. La base de datos `gastos.db` se crea sola.



3\. Frontend (terminal 2):



```bash

cd frontend

npm install

npm run dev

```



Abrir `http://localhost:5173` en el navegador.



\## Funcionalidades



\- Crear categorías y asignarlas a un gasto

\- Registrar gastos (descripción, monto, fecha y hora, categoría)

\- Listar los gastos y mostrar el total

\- Ordenar haciendo clic en el encabezado "Fecha y Hora"

\- Editar y eliminar gastos

\- Validaciones: monto mayor que cero y campos obligatorios (en el front y en el back)



\## API



| Método | Ruta | Descripción |

|---|---|---|

| GET | `/categorias` | Lista las categorías |

| POST | `/categorias` | Crea una categoría |

| GET | `/gastos?orden=asc` o `desc` | Lista los gastos y el total |

| POST | `/gastos` | Crea un gasto |

| PUT | `/gastos/:id` | Edita un gasto |

| DELETE | `/gastos/:id` | Elimina un gasto |

